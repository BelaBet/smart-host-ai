CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'gerente', 'recepcao', 'caixa', 'governanca');

CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'recepcao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

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

CREATE POLICY "users can read own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

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

DROP POLICY IF EXISTS "authenticated users can read audit log" ON public.audit_log;
CREATE POLICY "admins can read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin']::public.app_role[]));

-- Remove legacy permissive (public) policies
DROP POLICY IF EXISTS "Allow public read access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public insert access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public update access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public delete access on rooms" ON public.rooms;
DROP POLICY IF EXISTS "Allow public read access on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public insert access on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public update access on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public delete access on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public read access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public insert access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public update access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public delete access on reservations" ON public.reservations;
DROP POLICY IF EXISTS "Allow public read access on room_maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Allow public insert access on room_maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Allow public update access on room_maintenance" ON public.room_maintenance;
DROP POLICY IF EXISTS "Allow public delete access on room_maintenance" ON public.room_maintenance;

REVOKE ALL ON public.rooms FROM anon;
REVOKE ALL ON public.guests FROM anon;
REVOKE ALL ON public.reservations FROM anon;
REVOKE ALL ON public.room_maintenance FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.room_maintenance TO authenticated;

CREATE POLICY "role read rooms" ON public.rooms FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]));
CREATE POLICY "role insert rooms" ON public.rooms FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));
CREATE POLICY "role update rooms" ON public.rooms FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao','governanca']::public.app_role[]));
CREATE POLICY "role delete rooms" ON public.rooms FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin']::public.app_role[]));

CREATE POLICY "role read guests" ON public.guests FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role insert guests" ON public.guests FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role update guests" ON public.guests FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role delete guests" ON public.guests FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));

CREATE POLICY "role read reservations" ON public.reservations FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role insert reservations" ON public.reservations FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role update reservations" ON public.reservations FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','recepcao']::public.app_role[]));
CREATE POLICY "role delete reservations" ON public.reservations FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));

CREATE POLICY "role read room maintenance" ON public.room_maintenance FOR SELECT TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]));
CREATE POLICY "role insert room maintenance" ON public.room_maintenance FOR INSERT TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]));
CREATE POLICY "role update room maintenance" ON public.room_maintenance FOR UPDATE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]))
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente','governanca']::public.app_role[]));
CREATE POLICY "role delete room maintenance" ON public.room_maintenance FOR DELETE TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['super_admin','admin','gerente']::public.app_role[]));

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

-- Backfill existing accounts as admin so current users keep access
INSERT INTO public.user_roles(user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
