-- Role hierarchy for Smart Host AI.
-- Roles are stored in a dedicated table instead of trusting client-side metadata.

CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'gerente', 'recepcao', 'caixa', 'governanca');

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'recepcao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  );
$$;

-- Only privileged roles can manage/view role assignments.
CREATE POLICY "privileged users can read roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin']::public.app_role[]));

CREATE POLICY "super admin manages roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_any_role(UUID, public.app_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(UUID, public.app_role[]) TO authenticated;

-- Audit becomes restricted to Super Admin and Admin.
DROP POLICY IF EXISTS "authenticated users can read audit log" ON public.audit_log;
CREATE POLICY "admins can read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin']::public.app_role[]));

-- Role-based access for core hotel operations.
-- Super Admin/Admin: everything.
-- Gerente: operational management, reports and guests; no role management or audit.
-- Recepção: guests, rooms and reservations.
-- Caixa: financial/cash operations and reports.
-- Governança: room status/maintenance operations.

DROP POLICY IF EXISTS "authenticated read rooms" ON public.rooms;
DROP POLICY IF EXISTS "authenticated insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "authenticated update rooms" ON public.rooms;
DROP POLICY IF EXISTS "authenticated delete rooms" ON public.rooms;
CREATE POLICY "role read rooms" ON public.rooms FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]));
CREATE POLICY "role insert rooms" ON public.rooms FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));
CREATE POLICY "role update rooms" ON public.rooms FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]));
CREATE POLICY "role delete rooms" ON public.rooms FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin']::public.app_role[]));

DROP POLICY IF EXISTS "authenticated read guests" ON public.guests;
DROP POLICY IF EXISTS "authenticated insert guests" ON public.guests;
DROP POLICY IF EXISTS "authenticated update guests" ON public.guests;
DROP POLICY IF EXISTS "authenticated delete guests" ON public.guests;
CREATE POLICY "role read guests" ON public.guests FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role insert guests" ON public.guests FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role update guests" ON public.guests FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role delete guests" ON public.guests FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));

DROP POLICY IF EXISTS "authenticated read reservations" ON public.reservations;
DROP POLICY IF EXISTS "authenticated insert reservations" ON public.reservations;
DROP POLICY IF EXISTS "authenticated update reservations" ON public.reservations;
DROP POLICY IF EXISTS "authenticated delete reservations" ON public.reservations;
CREATE POLICY "role read reservations" ON public.reservations FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role insert reservations" ON public.reservations FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role update reservations" ON public.reservations FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role delete reservations" ON public.reservations FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));

DROP POLICY IF EXISTS "authenticated read room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "authenticated insert room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "authenticated update room maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "authenticated delete room maintenance" ON public.room_maintenance;
CREATE POLICY "role read room maintenance" ON public.room_maintenance FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]));
CREATE POLICY "role insert room maintenance" ON public.room_maintenance FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]));
CREATE POLICY "role update room maintenance" ON public.room_maintenance FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]));
CREATE POLICY "role delete room maintenance" ON public.room_maintenance FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));

-- Prevent a fresh account from silently becoming privileged. New users default to reception.
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'recepcao')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_default_role_on_user ON auth.users;
CREATE TRIGGER assign_default_role_on_user
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.assign_default_role();
