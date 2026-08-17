-- Immutable audit trail for sensitive operational changes.
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  old_data JSONB,
  new_data JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS audit_log_occurred_at_idx ON public.audit_log(occurred_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_table_record_idx ON public.audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON public.audit_log(actor_id);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Audit records are intentionally append-only. Users cannot insert/update/delete them directly.
CREATE POLICY "authenticated users can read audit log"
  ON public.audit_log FOR SELECT TO authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.write_audit_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old JSONB;
  v_new JSONB;
  v_record_id TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE(v_new->>'id', v_new->>'uuid', 'unknown');
  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    v_record_id := COALESCE(v_new->>'id', v_new->>'uuid', 'unknown');
  ELSE
    v_old := to_jsonb(OLD);
    v_record_id := COALESCE(v_old->>'id', v_old->>'uuid', 'unknown');
  END IF;

  INSERT INTO public.audit_log(actor_id, action, table_name, record_id, old_data, new_data, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    v_record_id,
    v_old,
    v_new,
    jsonb_build_object('source', 'database_trigger')
  );

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- Only create triggers for tables that exist in the current schema.
DO $$
DECLARE
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'guests',
    'cashier_sessions',
    'cashier_transactions',
    'restaurant_products',
    'restaurant_orders',
    'restaurant_order_items'
  ] LOOP
    IF to_regclass('public.' || v_table) IS NOT NULL THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_%I ON public.%I', v_table, v_table);
      EXECUTE format(
        'CREATE TRIGGER audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.write_audit_log()',
        v_table, v_table
      );
    END IF;
  END LOOP;
END $$;

-- Protect audit records from direct mutation even by normal authenticated clients.
REVOKE ALL ON FUNCTION public.write_audit_log() FROM PUBLIC;
