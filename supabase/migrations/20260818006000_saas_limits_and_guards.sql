-- Enforce subscription status and plan limits server-side.

CREATE OR REPLACE FUNCTION public.organization_can_operate(_org UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations o
    LEFT JOIN public.organization_subscriptions s ON s.organization_id=o.id
    WHERE o.id=_org
      AND o.status <> 'suspended'
      AND (s.status IS NULL OR s.status IN ('trial','active'))
      AND (s.trial_ends_at IS NULL OR s.trial_ends_at > now() OR s.status='active')
  );
$$;

CREATE OR REPLACE FUNCTION public.check_room_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_limit INTEGER; v_count INTEGER;
BEGIN
  IF NOT public.organization_can_operate(NEW.organization_id) THEN
    RAISE EXCEPTION 'Organization subscription is not active';
  END IF;
  SELECT p.max_rooms INTO v_limit
  FROM public.organization_subscriptions s JOIN public.saas_plans p ON p.id=s.plan_id
  WHERE s.organization_id=NEW.organization_id;
  IF v_limit IS NOT NULL THEN
    SELECT count(*) INTO v_count FROM public.rooms WHERE organization_id=NEW.organization_id;
    IF v_count >= v_limit THEN RAISE EXCEPTION 'Room limit reached for current plan'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_room_limit ON public.rooms;
CREATE TRIGGER enforce_room_limit BEFORE INSERT ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.check_room_limit();

CREATE OR REPLACE FUNCTION public.check_user_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_limit INTEGER; v_count INTEGER;
BEGIN
  SELECT p.max_users INTO v_limit
  FROM public.organization_subscriptions s JOIN public.saas_plans p ON p.id=s.plan_id
  WHERE s.organization_id=NEW.organization_id;
  IF v_limit IS NOT NULL THEN
    SELECT count(*) INTO v_count FROM public.organization_members WHERE organization_id=NEW.organization_id;
    IF v_count >= v_limit THEN RAISE EXCEPTION 'User limit reached for current plan'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS enforce_user_limit ON public.organization_members;
CREATE TRIGGER enforce_user_limit BEFORE INSERT ON public.organization_members FOR EACH ROW EXECUTE FUNCTION public.check_user_limit();

CREATE OR REPLACE FUNCTION public.refresh_organization_usage(_org UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.organization_usage(organization_id, users_count, rooms_count, reservations_count, updated_at)
  VALUES (_org,
    (SELECT count(*) FROM public.organization_members WHERE organization_id=_org),
    (SELECT count(*) FROM public.rooms WHERE organization_id=_org),
    (SELECT count(*) FROM public.reservations WHERE organization_id=_org),
    now())
  ON CONFLICT (organization_id) DO UPDATE SET
    users_count=EXCLUDED.users_count,
    rooms_count=EXCLUDED.rooms_count,
    reservations_count=EXCLUDED.reservations_count,
    updated_at=now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.organization_can_operate(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_organization_usage(UUID) TO authenticated;
