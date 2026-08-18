-- Complete SaaS foundation: tenant context, platform administration, plans, subscriptions,
-- usage limits, billing state, invitations, and tenant-scoped audit.

CREATE TABLE IF NOT EXISTS public.platform_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_platform_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user UUID DEFAULT auth.uid())
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.platform_users WHERE user_id=_user AND is_platform_admin=true);
$$;
CREATE POLICY "platform admins read platform users" ON public.platform_users FOR SELECT TO authenticated
USING (public.is_platform_admin());
CREATE POLICY "platform admins manage platform users" ON public.platform_users FOR ALL TO authenticated
USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE TABLE IF NOT EXISTS public.saas_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  price_monthly NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_rooms INTEGER,
  max_users INTEGER,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_subscriptions (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.saas_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial','active','past_due','canceled','suspended')),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  external_customer_id TEXT,
  external_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_usage (
  organization_id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  users_count INTEGER NOT NULL DEFAULT 0,
  rooms_count INTEGER NOT NULL DEFAULT 0,
  reservations_count INTEGER NOT NULL DEFAULT 0,
  storage_bytes BIGINT NOT NULL DEFAULT 0,
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'recepcao',
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.organization_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organization_audit_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_organization_ids()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id=auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_organization_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id=auth.uid() ORDER BY created_at LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_access_org(_org UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT public.is_platform_admin() OR public.is_org_member(_org);
$$;

CREATE POLICY "members read subscription" ON public.organization_subscriptions FOR SELECT TO authenticated
USING (public.can_access_org(organization_id));
CREATE POLICY "platform/admin manage subscription" ON public.organization_subscriptions FOR ALL TO authenticated
USING (public.is_platform_admin() OR public.is_org_admin(organization_id))
WITH CHECK (public.is_platform_admin() OR public.is_org_admin(organization_id));

ALTER TABLE public.organization_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read usage" ON public.organization_usage FOR SELECT TO authenticated
USING (public.can_access_org(organization_id));
CREATE POLICY "platform manage usage" ON public.organization_usage FOR ALL TO authenticated
USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE POLICY "admins manage invitations" ON public.organization_invitations FOR ALL TO authenticated
USING (public.is_platform_admin() OR public.is_org_admin(organization_id))
WITH CHECK (public.is_platform_admin() OR public.is_org_admin(organization_id));

CREATE POLICY "admins read org audit" ON public.organization_audit_log FOR SELECT TO authenticated
USING (public.is_platform_admin() OR (public.is_org_admin(organization_id)));
CREATE POLICY "members write org audit" ON public.organization_audit_log FOR INSERT TO authenticated
WITH CHECK (public.is_platform_admin() OR public.is_org_member(organization_id));

INSERT INTO public.saas_plans (code,name,price_monthly,price_yearly,max_rooms,max_users,features)
VALUES
 ('starter','Starter',99,990,20,5,'{"audit":true,"white_label":false,"custom_domain":false}'::jsonb),
 ('professional','Professional',249,2490,100,20,'{"audit":true,"white_label":true,"custom_domain":true}'::jsonb),
 ('enterprise','Enterprise',599,5990,NULL,NULL,'{"audit":true,"white_label":true,"custom_domain":true,"api":true,"priority_support":true}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Platform admins can inspect all tenants; normal users remain tenant-scoped.
CREATE POLICY "platform admins read all organizations" ON public.organizations FOR SELECT TO authenticated
USING (public.is_platform_admin());
CREATE POLICY "platform admins manage organizations" ON public.organizations FOR ALL TO authenticated
USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

CREATE INDEX IF NOT EXISTS organization_audit_org_created_idx ON public.organization_audit_log(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS organization_subscriptions_status_idx ON public.organization_subscriptions(status);

REVOKE ALL ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_organization_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_organization_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_access_org(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_organization_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_org(UUID) TO authenticated;
