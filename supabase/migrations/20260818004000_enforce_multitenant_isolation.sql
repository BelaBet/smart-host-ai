-- Enforce real tenant isolation for operational hotel data.
-- Existing rows are assigned to a bootstrap organization before NOT NULL/RLS enforcement.

DO $$
DECLARE
  v_org UUID;
BEGIN
  SELECT id INTO v_org FROM public.organizations WHERE slug = 'default-hotel' LIMIT 1;
  IF v_org IS NULL THEN
    INSERT INTO public.organizations (name, slug, status)
    VALUES ('Hotel Principal', 'default-hotel', 'active')
    RETURNING id INTO v_org;
    INSERT INTO public.organization_branding (organization_id, display_name)
    VALUES (v_org, 'Hotel Principal');
    INSERT INTO public.organization_settings (organization_id)
    VALUES (v_org);
  END IF;

  -- Ensure the current bootstrap/admin user can own the migrated data when one exists.
  INSERT INTO public.organization_members (organization_id, user_id, role)
  SELECT v_org, id, 'super_admin'::public.app_role
  FROM auth.users
  WHERE email = current_setting('app.bootstrap_admin_email', true)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'super_admin';
END $$;

ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.room_maintenance ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Backfill all legacy rows into the bootstrap tenant.
DO $$
DECLARE v_org UUID;
BEGIN
  SELECT id INTO v_org FROM public.organizations WHERE slug = 'default-hotel' LIMIT 1;
  UPDATE public.rooms SET organization_id = v_org WHERE organization_id IS NULL;
  UPDATE public.guests SET organization_id = v_org WHERE organization_id IS NULL;
  UPDATE public.reservations SET organization_id = v_org WHERE organization_id IS NULL;
  UPDATE public.room_maintenance SET organization_id = v_org WHERE organization_id IS NULL;
END $$;

ALTER TABLE public.rooms ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.guests ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.reservations ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.room_maintenance ALTER COLUMN organization_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS rooms_org_idx ON public.rooms(organization_id);
CREATE INDEX IF NOT EXISTS guests_org_idx ON public.guests(organization_id);
CREATE INDEX IF NOT EXISTS reservations_org_idx ON public.reservations(organization_id);
CREATE INDEX IF NOT EXISTS room_maintenance_org_idx ON public.room_maintenance(organization_id);

-- Room numbers/documents/codes must be unique only inside a tenant.
ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_number_key;
CREATE UNIQUE INDEX IF NOT EXISTS rooms_org_number_key ON public.rooms(organization_id, number);

ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_confirmation_code_key;
CREATE UNIQUE INDEX IF NOT EXISTS reservations_org_confirmation_code_key ON public.reservations(organization_id, confirmation_code);

-- Ensure cross-tenant relationships cannot be created.
CREATE OR REPLACE FUNCTION public.validate_same_organization_reservation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_room_org UUID; v_guest_org UUID;
BEGIN
  SELECT organization_id INTO v_room_org FROM public.rooms WHERE id = NEW.room_id;
  SELECT organization_id INTO v_guest_org FROM public.guests WHERE id = NEW.guest_id;
  IF v_room_org IS NULL OR v_guest_org IS NULL OR v_room_org <> NEW.organization_id OR v_guest_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'Cross-tenant reservation is not allowed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validate_reservation_organization ON public.reservations;
CREATE TRIGGER validate_reservation_organization
BEFORE INSERT OR UPDATE ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.validate_same_organization_reservation();

CREATE OR REPLACE FUNCTION public.validate_same_organization_maintenance()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_room_org UUID;
BEGIN
  SELECT organization_id INTO v_room_org FROM public.rooms WHERE id = NEW.room_id;
  IF v_room_org IS NULL OR v_room_org <> NEW.organization_id THEN
    RAISE EXCEPTION 'Cross-tenant maintenance is not allowed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS validate_maintenance_organization ON public.room_maintenance;
CREATE TRIGGER validate_maintenance_organization
BEFORE INSERT OR UPDATE ON public.room_maintenance
FOR EACH ROW EXECUTE FUNCTION public.validate_same_organization_maintenance();

-- Replace permissive operational policies with tenant-scoped policies.
DROP POLICY IF EXISTS "role read rooms" ON public.rooms;
DROP POLICY IF EXISTS "role insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "role update rooms" ON public.rooms;
DROP POLICY IF EXISTS "role delete rooms" ON public.rooms;
CREATE POLICY "tenant read rooms" ON public.rooms FOR SELECT TO authenticated
USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]));
CREATE POLICY "tenant insert rooms" ON public.rooms FOR INSERT TO authenticated
WITH CHECK (public.is_org_admin(organization_id));
CREATE POLICY "tenant update rooms" ON public.rooms FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]))
WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "tenant delete rooms" ON public.rooms FOR DELETE TO authenticated
USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "role read guests" ON public.guests;
DROP POLICY IF EXISTS "role insert guests" ON public.guests;
DROP POLICY IF EXISTS "role update guests" ON public.guests;
DROP POLICY IF EXISTS "role delete guests" ON public.guests;
CREATE POLICY "tenant read guests" ON public.guests FOR SELECT TO authenticated
USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "tenant insert guests" ON public.guests FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "tenant update guests" ON public.guests FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]))
WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "tenant delete guests" ON public.guests FOR DELETE TO authenticated
USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "role read reservations" ON public.reservations;
DROP POLICY IF EXISTS "role insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "role update reservations" ON public.reservations;
DROP POLICY IF EXISTS "role delete reservations" ON public.reservations;
CREATE POLICY "tenant read reservations" ON public.reservations FOR SELECT TO authenticated
USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "tenant insert reservations" ON public.reservations FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "tenant update reservations" ON public.reservations FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]))
WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "tenant delete reservations" ON public.reservations FOR DELETE TO authenticated
USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "role read room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "role insert room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "role update room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "role delete room maintenance" ON public.room_maintenance;
CREATE POLICY "tenant read room maintenance" ON public.room_maintenance FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "tenant insert room maintenance" ON public.room_maintenance FOR INSERT TO authenticated
WITH CHECK (public.is_org_member(organization_id) AND public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]));
CREATE POLICY "tenant update room maintenance" ON public.room_maintenance FOR UPDATE TO authenticated
USING (public.is_org_member(organization_id)) WITH CHECK (public.is_org_member(organization_id));
CREATE POLICY "tenant delete room maintenance" ON public.room_maintenance FOR DELETE TO authenticated
USING (public.is_org_admin(organization_id));

-- Prevent client code from moving a record to another tenant during UPDATE.
CREATE OR REPLACE FUNCTION public.prevent_organization_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.organization_id <> NEW.organization_id THEN
    RAISE EXCEPTION 'Changing organization_id is not allowed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS prevent_room_org_change ON public.rooms;
CREATE TRIGGER prevent_room_org_change BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.prevent_organization_change();
DROP TRIGGER IF EXISTS prevent_guest_org_change ON public.guests;
CREATE TRIGGER prevent_guest_org_change BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.prevent_organization_change();
DROP TRIGGER IF EXISTS prevent_reservation_org_change ON public.reservations;
CREATE TRIGGER prevent_reservation_org_change BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.prevent_organization_change();
DROP TRIGGER IF EXISTS prevent_maintenance_org_change ON public.room_maintenance;
CREATE TRIGGER prevent_maintenance_org_change BEFORE UPDATE ON public.room_maintenance FOR EACH ROW EXECUTE FUNCTION public.prevent_organization_change();

-- Security: organization_id must be supplied by trusted application code and match membership.
COMMENT ON COLUMN public.rooms.organization_id IS 'Tenant boundary; immutable after creation.';
COMMENT ON COLUMN public.guests.organization_id IS 'Tenant boundary; immutable after creation.';
COMMENT ON COLUMN public.reservations.organization_id IS 'Tenant boundary; immutable after creation.';
COMMENT ON COLUMN public.room_maintenance.organization_id IS 'Tenant boundary; immutable after creation.';
