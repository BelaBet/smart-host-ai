-- Regression suite for the vulnerabilities found during the heavy audit.
-- Run against a disposable Supabase database after applying migrations.

BEGIN;

DO $$
DECLARE v_org UUID; v_plan UUID;
BEGIN
  SELECT id INTO v_org FROM public.organizations WHERE slug='default-hotel' LIMIT 1;
  IF v_org IS NULL THEN RAISE EXCEPTION 'Bootstrap organization missing'; END IF;

  -- Every operational tenant must have an active/trial subscription after hardening.
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_subscriptions
    WHERE organization_id=v_org AND status IN ('trial','active')
  ) THEN RAISE EXCEPTION 'Bootstrap subscription missing'; END IF;

  SELECT id INTO v_plan FROM public.saas_plans WHERE code='professional';
  IF v_plan IS NULL THEN RAISE EXCEPTION 'Professional plan missing'; END IF;

  -- No cross-tenant operational references.
  IF EXISTS (
    SELECT 1 FROM public.reservations r JOIN public.rooms rm ON rm.id=r.room_id
    WHERE r.organization_id <> rm.organization_id
  ) THEN RAISE EXCEPTION 'Cross-tenant reservation reference'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.reservations r JOIN public.guests g ON g.id=r.guest_id
    WHERE r.organization_id <> g.organization_id
  ) THEN RAISE EXCEPTION 'Cross-tenant guest reference'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.room_maintenance m JOIN public.rooms rm ON rm.id=m.room_id
    WHERE m.organization_id <> rm.organization_id
  ) THEN RAISE EXCEPTION 'Cross-tenant maintenance reference'; END IF;

  IF EXISTS (
    SELECT 1 FROM public.cashier_transactions t JOIN public.cashier_sessions s ON s.id=t.session_id
    WHERE t.organization_id <> s.organization_id
  ) THEN RAISE EXCEPTION 'Cross-tenant cashier reference'; END IF;

  IF EXISTS (SELECT 1 FROM public.organization_audit_log) AND EXISTS (
    SELECT 1 FROM public.organization_audit_log a
    WHERE a.actor_user_id IS NULL AND a.action <> 'system'
  ) THEN RAISE EXCEPTION 'Unexpected forged org audit record'; END IF;
END $$;

-- Verify there is no global open-cashier index left.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='one_open_cashier_session_idx') THEN
    RAISE EXCEPTION 'Global cashier uniqueness index still exists';
  END IF;
END $$;

ROLLBACK;
