-- White-label SaaS foundation: each customer gets an isolated organization/brand.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','trial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'recepcao',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.organization_branding (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#C9A227',
  secondary_color TEXT NOT NULL DEFAULT '#111827',
  accent_color TEXT NOT NULL DEFAULT '#F5F5F5',
  font_family TEXT NOT NULL DEFAULT 'Inter',
  custom_css TEXT,
  login_title TEXT,
  login_subtitle TEXT,
  support_email TEXT,
  support_phone TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  hostname TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_settings (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  timezone TEXT NOT NULL DEFAULT 'America/Recife',
  locale TEXT NOT NULL DEFAULT 'pt-BR',
  currency TEXT NOT NULL DEFAULT 'BRL',
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS organization_members_user_idx ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS organization_domains_hostname_idx ON public.organization_domains(hostname);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_org_member(_org UUID, _user UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.organization_members WHERE organization_id=_org AND user_id=_user);
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_org UUID, _user UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id=_org AND user_id=_user AND role IN ('super_admin','admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.resolve_organization(_hostname TEXT)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT organization_id FROM public.organization_domains
  WHERE lower(hostname)=lower(_hostname) AND verified_at IS NOT NULL LIMIT 1;
$$;

CREATE POLICY "members read organizations" ON public.organizations FOR SELECT TO authenticated
USING (public.is_org_member(id));
CREATE POLICY "admins update organizations" ON public.organizations FOR UPDATE TO authenticated
USING (public.is_org_admin(id)) WITH CHECK (public.is_org_admin(id));

CREATE POLICY "members read memberships" ON public.organization_members FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "admins manage memberships" ON public.organization_members FOR ALL TO authenticated
USING (public.is_org_admin(organization_id)) WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "members read branding" ON public.organization_branding FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "admins manage branding" ON public.organization_branding FOR INSERT TO authenticated
WITH CHECK (public.is_org_admin(organization_id));
CREATE POLICY "admins update branding" ON public.organization_branding FOR UPDATE TO authenticated
USING (public.is_org_admin(organization_id)) WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "members read domains" ON public.organization_domains FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "admins manage domains" ON public.organization_domains FOR ALL TO authenticated
USING (public.is_org_admin(organization_id)) WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "members read settings" ON public.organization_settings FOR SELECT TO authenticated
USING (public.is_org_member(organization_id));
CREATE POLICY "admins manage settings" ON public.organization_settings FOR ALL TO authenticated
USING (public.is_org_admin(organization_id)) WITH CHECK (public.is_org_admin(organization_id));

REVOKE ALL ON FUNCTION public.is_org_member(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_org_admin(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.resolve_organization(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID,UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_admin(UUID,UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_organization(TEXT) TO anon, authenticated;

-- Public branding lookup is intentionally limited to branding by verified custom domain.
CREATE OR REPLACE VIEW public.public_branding AS
SELECT d.hostname, b.display_name, b.logo_url, b.favicon_url, b.primary_color,
       b.secondary_color, b.accent_color, b.font_family, b.login_title, b.login_subtitle
FROM public.organization_domains d
JOIN public.organization_branding b ON b.organization_id=d.organization_id
WHERE d.verified_at IS NOT NULL;

GRANT SELECT ON public.public_branding TO anon, authenticated;
