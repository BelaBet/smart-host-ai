-- Remove legacy authenticated policies that used USING/WITH CHECK (true).
-- RLS is OR-combined: leaving these policies would bypass tenant isolation.
DROP POLICY IF EXISTS "Authenticated users can read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can delete rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can read guests" ON public.guests;
DROP POLICY IF EXISTS "Authenticated users can insert guests" ON public.guests;
DROP POLICY IF EXISTS "Authenticated users can update guests" ON public.guests;
DROP POLICY IF EXISTS "Authenticated users can delete guests" ON public.guests;
DROP POLICY IF EXISTS "Authenticated users can read reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Authenticated users can read room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Authenticated users can insert room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Authenticated users can update room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Authenticated users can delete room maintenance" ON public.room_maintenance;

-- Audit rows must also be tenant-bound. Legacy records without a tenant are assigned to bootstrap.
ALTER TABLE public.audit_log ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
DO $$
DECLARE v_org UUID;
BEGIN
  SELECT id INTO v_org FROM public.organizations WHERE slug='default-hotel' LIMIT 1;
  IF v_org IS NOT NULL THEN
    UPDATE public.audit_log SET organization_id=v_org WHERE organization_id IS NULL;
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS audit_log_org_idx ON public.audit_log(organization_id);

-- Keep audit visibility tenant-scoped in addition to the admin role requirement.
DROP POLICY IF EXISTS "admins can read audit log" ON public.audit_log;
CREATE POLICY "tenant admins can read audit log" ON public.audit_log FOR SELECT TO authenticated
USING (organization_id IS NOT NULL AND public.is_org_admin(organization_id));

-- Audit writes are performed by SECURITY DEFINER trigger functions, not client users.
REVOKE INSERT, UPDATE, DELETE ON public.audit_log FROM authenticated, anon;
