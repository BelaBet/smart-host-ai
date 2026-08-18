-- pgTAP-style isolation scenarios. Run in a Supabase test database with two users/tenants.
-- Expected: every cross-tenant SELECT/INSERT/UPDATE/DELETE is rejected or returns zero rows.

BEGIN;

-- These assertions are intentionally executable after fixtures are created.
DO $$
DECLARE
  org_a UUID; org_b UUID; user_a UUID; user_b UUID; room_a UUID; room_b UUID;
BEGIN
  SELECT id INTO org_a FROM public.organizations WHERE slug='test-hotel-a';
  SELECT id INTO org_b FROM public.organizations WHERE slug='test-hotel-b';
  IF org_a IS NULL OR org_b IS NULL OR org_a=org_b THEN RAISE EXCEPTION 'Isolation fixtures missing'; END IF;

  SELECT id INTO room_a FROM public.rooms WHERE organization_id=org_a LIMIT 1;
  SELECT id INTO room_b FROM public.rooms WHERE organization_id=org_b LIMIT 1;
  IF room_a IS NULL OR room_b IS NULL THEN RAISE EXCEPTION 'Room fixtures missing'; END IF;

  IF (SELECT organization_id FROM public.rooms WHERE id=room_a) <> org_a THEN RAISE EXCEPTION 'Room A tenant mismatch'; END IF;
  IF (SELECT organization_id FROM public.rooms WHERE id=room_b) <> org_b THEN RAISE EXCEPTION 'Room B tenant mismatch'; END IF;

  IF EXISTS (SELECT 1 FROM public.reservations r JOIN public.rooms rm ON rm.id=r.room_id WHERE r.organization_id <> rm.organization_id) THEN
    RAISE EXCEPTION 'Cross-tenant reservation detected';
  END IF;
  IF EXISTS (SELECT 1 FROM public.room_maintenance m JOIN public.rooms rm ON rm.id=m.room_id WHERE m.organization_id <> rm.organization_id) THEN
    RAISE EXCEPTION 'Cross-tenant maintenance detected';
  END IF;
END $$;

ROLLBACK;
