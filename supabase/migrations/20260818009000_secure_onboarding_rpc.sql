-- Secure onboarding: a new authenticated user may create exactly their own tenant through one transaction.
-- Direct table INSERTs remain protected by RLS.

CREATE OR REPLACE FUNCTION public.create_organization(
  p_name TEXT,
  p_slug TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_org UUID;
  v_slug TEXT := lower(regexp_replace(trim(p_slug), '[^a-zA-Z0-9-]+', '-', 'g'));
  v_plan UUID;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Usuário não autenticado'; END IF;
  IF length(trim(p_name)) < 2 OR length(trim(p_name)) > 120 THEN RAISE EXCEPTION 'Nome do hotel inválido'; END IF;
  IF length(v_slug) < 3 OR length(v_slug) > 60 THEN RAISE EXCEPTION 'Slug inválido'; END IF;
  IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id=v_user) THEN
    RAISE EXCEPTION 'Usuário já possui uma organização';
  END IF;
  IF EXISTS (SELECT 1 FROM public.organizations WHERE slug=v_slug) THEN
    RAISE EXCEPTION 'Este slug já está em uso';
  END IF;

  INSERT INTO public.organizations(name, slug, status)
  VALUES (trim(p_name), v_slug, 'active')
  RETURNING id INTO v_org;

  INSERT INTO public.organization_members(organization_id,user_id,role)
  VALUES (v_org,v_user,'admin');

  INSERT INTO public.organization_branding(organization_id,display_name)
  VALUES (v_org,trim(p_name));

  INSERT INTO public.organization_settings(organization_id)
  VALUES (v_org);

  SELECT id INTO v_plan FROM public.saas_plans WHERE code='professional' AND active=true LIMIT 1;
  IF v_plan IS NOT NULL THEN
    INSERT INTO public.organization_subscriptions(
      organization_id,plan_id,status,billing_cycle,trial_ends_at,current_period_start,current_period_end
    ) VALUES (v_org,v_plan,'trial','monthly',now()+interval '14 days',now(),now()+interval '14 days');
  END IF;

  INSERT INTO public.organization_usage(organization_id,period_start,period_end)
  VALUES (v_org,current_date,current_date+14);

  INSERT INTO public.user_active_organization(user_id,organization_id)
  VALUES (v_user,v_org)
  ON CONFLICT (user_id) DO UPDATE SET organization_id=EXCLUDED.organization_id,updated_at=now();

  RETURN v_org;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'Não foi possível criar a organização. Verifique o slug.';
END;
$$;

REVOKE ALL ON FUNCTION public.create_organization(TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_organization(TEXT,TEXT) TO authenticated;
