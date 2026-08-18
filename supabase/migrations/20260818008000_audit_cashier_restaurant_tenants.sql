-- Heavy audit finding: cashier and restaurant data were still global.
-- Move these operational modules behind the same tenant boundary.

DO $$
DECLARE
  v_org UUID;
  v_table TEXT;
BEGIN
  SELECT id INTO v_org FROM public.organizations WHERE slug = 'default-hotel' LIMIT 1;
  IF v_org IS NULL THEN
    SELECT id INTO v_org FROM public.organizations ORDER BY created_at LIMIT 1;
  END IF;

  FOREACH v_table IN ARRAY ARRAY[
    'cashier_sessions',
    'cashier_transactions',
    'restaurant_products',
    'restaurant_orders',
    'restaurant_order_items'
  ] LOOP
    IF to_regclass('public.' || v_table) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE', v_table);
      EXECUTE format('UPDATE public.%I SET organization_id = $1 WHERE organization_id IS NULL', v_table) USING v_org;
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN organization_id SET NOT NULL', v_table);
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(organization_id)', v_table || '_org_idx', v_table);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
    END IF;
  END LOOP;
END $$;

-- Cashier: one open session per hotel, not one globally across the entire SaaS.
DROP INDEX IF EXISTS public.one_open_cashier_session_idx;
CREATE UNIQUE INDEX IF NOT EXISTS one_open_cashier_session_per_org_idx
  ON public.cashier_sessions (organization_id)
  WHERE status = 'open';

-- Remove global cashier policies and replace them with tenant/role policies.
DROP POLICY IF EXISTS "authenticated users can read cashier sessions" ON public.cashier_sessions;
DROP POLICY IF EXISTS "authenticated users can create cashier sessions" ON public.cashier_sessions;
DROP POLICY IF EXISTS "authenticated users can update cashier sessions" ON public.cashier_sessions;
DROP POLICY IF EXISTS "authenticated users can read cashier transactions" ON public.cashier_transactions;
DROP POLICY IF EXISTS "authenticated users can create cashier transactions" ON public.cashier_transactions;
DROP POLICY IF EXISTS "authenticated users can soft delete cashier transactions" ON public.cashier_transactions;

CREATE POLICY "tenant cashier read sessions" ON public.cashier_sessions
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','caixa']::public.app_role[]));
CREATE POLICY "tenant cashier create sessions" ON public.cashier_sessions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id) AND opened_by = auth.uid() AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','caixa']::public.app_role[]));
CREATE POLICY "tenant cashier update sessions" ON public.cashier_sessions
  FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','caixa']::public.app_role[]))
  WITH CHECK (public.is_org_member(organization_id));

CREATE POLICY "tenant cashier read transactions" ON public.cashier_transactions
  FOR SELECT TO authenticated
  USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','caixa']::public.app_role[]));
CREATE POLICY "tenant cashier create transactions" ON public.cashier_transactions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_org_member(organization_id) AND created_by = auth.uid() AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','caixa']::public.app_role[]));
CREATE POLICY "tenant cashier soft delete transactions" ON public.cashier_transactions
  FOR UPDATE TO authenticated
  USING (public.is_org_member(organization_id) AND created_by = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (public.is_org_member(organization_id) AND deleted_at IS NOT NULL AND deleted_by = auth.uid());

-- Cashier records cannot be moved between tenants and transactions must belong to their session.
CREATE OR REPLACE FUNCTION public.validate_cashier_tenant()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_session_org UUID;
BEGIN
  IF TG_TABLE_NAME = 'cashier_transactions' THEN
    SELECT organization_id INTO v_session_org FROM public.cashier_sessions WHERE id = NEW.session_id;
    IF v_session_org IS NULL OR v_session_org <> NEW.organization_id THEN
      RAISE EXCEPTION 'Cross-tenant cashier transaction is not allowed';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.organization_id <> NEW.organization_id THEN
    RAISE EXCEPTION 'Changing organization_id is not allowed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validate_cashier_session_tenant ON public.cashier_sessions;
CREATE TRIGGER validate_cashier_session_tenant BEFORE INSERT OR UPDATE ON public.cashier_sessions
FOR EACH ROW EXECUTE FUNCTION public.validate_cashier_tenant();
DROP TRIGGER IF EXISTS validate_cashier_transaction_tenant ON public.cashier_transactions;
CREATE TRIGGER validate_cashier_transaction_tenant BEFORE INSERT OR UPDATE ON public.cashier_transactions
FOR EACH ROW EXECUTE FUNCTION public.validate_cashier_tenant();

-- Replace cashier helpers so they always use the active tenant and never operate globally.
CREATE OR REPLACE FUNCTION public.open_cashier(p_opening_balance NUMERIC)
RETURNS public.cashier_sessions
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE v_session public.cashier_sessions; v_org UUID;
BEGIN
  IF p_opening_balance < 0 THEN RAISE EXCEPTION 'Saldo inicial inválido'; END IF;
  v_org := public.current_organization_id();
  IF v_org IS NULL OR NOT public.organization_can_operate(v_org) THEN RAISE EXCEPTION 'Organização sem assinatura ativa'; END IF;
  INSERT INTO public.cashier_sessions (organization_id, opening_balance, opened_by)
  VALUES (v_org, p_opening_balance, auth.uid())
  RETURNING * INTO v_session;
  RETURN v_session;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Já existe um caixa aberto neste hotel';
END;
$$;

CREATE OR REPLACE FUNCTION public.close_cashier(p_session_id UUID, p_closing_balance NUMERIC, p_notes TEXT DEFAULT NULL)
RETURNS public.cashier_sessions
LANGUAGE plpgsql SECURITY INVOKER AS $$
DECLARE v_session public.cashier_sessions; v_income NUMERIC(12,2); v_expense NUMERIC(12,2); v_expected NUMERIC(12,2);
BEGIN
  IF p_closing_balance < 0 THEN RAISE EXCEPTION 'Saldo final inválido'; END IF;
  SELECT * INTO v_session FROM public.cashier_sessions
  WHERE id=p_session_id AND status='open' AND organization_id=public.current_organization_id() FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Caixa não encontrado ou já fechado'; END IF;
  SELECT COALESCE(SUM(amount) FILTER (WHERE type='income' AND deleted_at IS NULL),0),
         COALESCE(SUM(amount) FILTER (WHERE type='expense' AND deleted_at IS NULL),0)
  INTO v_income, v_expense FROM public.cashier_transactions WHERE session_id=p_session_id;
  v_expected := v_session.opening_balance + v_income - v_expense;
  UPDATE public.cashier_sessions SET closed_at=now(), closing_balance=p_closing_balance,
    expected_balance=v_expected, difference=p_closing_balance-v_expected,
    status='closed', closed_by=auth.uid(), notes=p_notes
  WHERE id=p_session_id RETURNING * INTO v_session;
  RETURN v_session;
END;
$$;

-- Restaurant: tenant-scoped CRUD. Remove any old broad authenticated policies when present.
DO $$
DECLARE v_table TEXT; v_policy RECORD;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['restaurant_products','restaurant_orders','restaurant_order_items'] LOOP
    IF to_regclass('public.' || v_table) IS NOT NULL THEN
      FOR v_policy IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=v_table LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', v_policy.policyname, v_table);
      END LOOP;
      EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (public.is_org_member(organization_id))', 'tenant_'||v_table||'_read', v_table);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_org_member(organization_id) AND public.organization_can_operate(organization_id))', 'tenant_'||v_table||'_insert', v_table);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id))', 'tenant_'||v_table||'_update', v_table);
      EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_org_admin(organization_id))', 'tenant_'||v_table||'_delete', v_table);
    END IF;
  END LOOP;
END $$;

-- Prevent tenant changes on restaurant rows.
DO $$
DECLARE v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['restaurant_products','restaurant_orders','restaurant_order_items'] LOOP
    IF to_regclass('public.' || v_table) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS prevent_%I_org_change ON public.%I', v_table, v_table);
      EXECUTE format('CREATE TRIGGER prevent_%I_org_change BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.prevent_organization_change()', v_table, v_table);
    END IF;
  END LOOP;
END $$;

-- Canonical audit writer must capture organization_id for all tenant-bound records.
CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_old JSONB; v_new JSONB; v_record_id TEXT; v_org UUID;
BEGIN
  IF TG_OP='INSERT' THEN v_new:=to_jsonb(NEW); v_record_id:=COALESCE(v_new->>'id',v_new->>'uuid','unknown');
  ELSIF TG_OP='UPDATE' THEN v_old:=to_jsonb(OLD); v_new:=to_jsonb(NEW); v_record_id:=COALESCE(v_new->>'id',v_new->>'uuid','unknown');
  ELSE v_old:=to_jsonb(OLD); v_record_id:=COALESCE(v_old->>'id',v_old->>'uuid','unknown'); END IF;
  v_org := COALESCE((CASE WHEN TG_OP='DELETE' THEN v_old->>'organization_id' ELSE v_new->>'organization_id' END)::uuid, public.current_organization_id());
  INSERT INTO public.audit_log(actor_id, action, table_name, record_id, organization_id, old_data, new_data, metadata)
  VALUES(auth.uid(),TG_OP,TG_TABLE_NAME,v_record_id,v_org,v_old,v_new,jsonb_build_object('source','database_trigger'));
  RETURN CASE WHEN TG_OP='DELETE' THEN OLD ELSE NEW END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.open_cashier(NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_cashier(UUID,NUMERIC,TEXT) TO authenticated;
