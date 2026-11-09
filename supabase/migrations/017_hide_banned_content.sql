-- 017: Hide content of banned users
--
-- When banning, an admin can hide everything the user published: routes
-- (and with them their stops, photos and comments), plus the user's comments,
-- photos and ratings on other people's routes. Nothing is deleted:
-- profiles.content_hidden only filters reads through RESTRICTIVE RLS
-- policies, so reactivating the account (or "show content") brings it back.
-- Staff keep seeing everything so they can review.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS content_hidden BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.user_moderation_log DROP CONSTRAINT IF EXISTS user_moderation_log_action_check;
ALTER TABLE public.user_moderation_log ADD CONSTRAINT user_moderation_log_action_check
  CHECK (action IN ('suspend', 'ban', 'reactivate', 'role_change', 'hide_content', 'show_content'));

-- --------------------------------------------------------------- helper
CREATE OR REPLACE FUNCTION public.is_content_hidden(author UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = author AND content_hidden)
$$;
GRANT EXECUTE ON FUNCTION public.is_content_hidden(UUID) TO anon, authenticated;

-- ---------------------------------------------------------- read filters
DROP POLICY IF EXISTS "Hide content of banned users" ON public.routes;
CREATE POLICY "Hide content of banned users" ON public.routes
  AS RESTRICTIVE FOR SELECT
  USING (NOT public.is_content_hidden(user_id) OR user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Hide content of banned users" ON public.route_comments;
CREATE POLICY "Hide content of banned users" ON public.route_comments
  AS RESTRICTIVE FOR SELECT
  USING (NOT public.is_content_hidden(user_id) OR user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Hide content of banned users" ON public.route_photos;
CREATE POLICY "Hide content of banned users" ON public.route_photos
  AS RESTRICTIVE FOR SELECT
  USING (NOT public.is_content_hidden(user_id) OR user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Hide content of banned users" ON public.route_ratings;
CREATE POLICY "Hide content of banned users" ON public.route_ratings
  AS RESTRICTIVE FOR SELECT
  USING (NOT public.is_content_hidden(user_id) OR user_id = auth.uid() OR public.is_staff());

-- ------------------------------------------------------------ moderation
-- New parameter, so replace the 016 signature
DROP FUNCTION IF EXISTS public.admin_moderate_user(UUID, TEXT, TIMESTAMPTZ, TEXT);
CREATE FUNCTION public.admin_moderate_user(
  target_user UUID,
  new_status TEXT,
  until TIMESTAMPTZ DEFAULT NULL,
  reason TEXT DEFAULT NULL,
  hide_content BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_reason TEXT := NULLIF(BTRIM(reason), '');
  hidden BOOLEAN := (new_status = 'banned' AND COALESCE(hide_content, FALSE));
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  IF target_user = auth.uid() THEN
    RAISE EXCEPTION 'you cannot moderate your own account' USING ERRCODE = '42501';
  END IF;
  IF new_status NOT IN ('active', 'suspended', 'banned') THEN
    RAISE EXCEPTION 'invalid status %', new_status USING ERRCODE = '22023';
  END IF;
  IF new_status = 'suspended' AND (until IS NULL OR until <= NOW()) THEN
    RAISE EXCEPTION 'suspension end must be in the future' USING ERRCODE = '22023';
  END IF;
  IF new_status <> 'active' AND clean_reason IS NULL THEN
    RAISE EXCEPTION 'a reason is required' USING ERRCODE = '22023';
  END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user AND role = 'admin') THEN
    RAISE EXCEPTION 'admins cannot be moderated' USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles SET
    account_status = new_status,
    suspended_until = CASE WHEN new_status = 'suspended' THEN until END,
    moderation_reason = CASE WHEN new_status = 'active' THEN NULL ELSE clean_reason END,
    content_hidden = hidden,
    moderated_by = auth.uid(),
    moderated_at = NOW()
  WHERE id = target_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0002';
  END IF;

  UPDATE auth.users SET banned_until = CASE new_status
    WHEN 'suspended' THEN until
    WHEN 'banned' THEN NOW() + INTERVAL '100 years'
    ELSE NULL
  END
  WHERE id = target_user;

  IF new_status <> 'active' THEN
    DELETE FROM auth.refresh_tokens WHERE user_id = target_user::TEXT;
    DELETE FROM auth.sessions WHERE user_id = target_user;
  END IF;

  INSERT INTO public.user_moderation_log (user_id, action, reason, suspended_until, details, performed_by)
  VALUES (
    target_user,
    CASE new_status WHEN 'suspended' THEN 'suspend' WHEN 'banned' THEN 'ban' ELSE 'reactivate' END,
    clean_reason,
    CASE WHEN new_status = 'suspended' THEN until END,
    CASE WHEN new_status = 'banned' THEN jsonb_build_object('content_hidden', hidden) END,
    auth.uid()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_moderate_user(UUID, TEXT, TIMESTAMPTZ, TEXT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_user(UUID, TEXT, TIMESTAMPTZ, TEXT, BOOLEAN) TO authenticated;

-- Hide / show the content of an already banned user
CREATE OR REPLACE FUNCTION public.admin_set_content_hidden(target_user UUID, hidden BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_user AND account_status = 'banned') THEN
    RAISE EXCEPTION 'only the content of banned users can be hidden' USING ERRCODE = '22023';
  END IF;
  UPDATE public.profiles SET content_hidden = hidden WHERE id = target_user AND content_hidden <> hidden;
  IF FOUND THEN
    INSERT INTO public.user_moderation_log (user_id, action, performed_by)
    VALUES (target_user, CASE WHEN hidden THEN 'hide_content' ELSE 'show_content' END, auth.uid());
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_content_hidden(UUID, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_content_hidden(UUID, BOOLEAN) TO authenticated;

-- ------------------------------------------------------- admin_list_users
DROP FUNCTION IF EXISTS public.admin_list_users();
CREATE FUNCTION public.admin_list_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT,
  provider TEXT,
  created_at TIMESTAMPTZ,
  email_confirmed_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  account_status TEXT,
  suspended_until TIMESTAMPTZ,
  moderation_reason TEXT,
  moderated_at TIMESTAMPTZ,
  content_hidden BOOLEAN,
  routes_count BIGINT,
  comments_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT
      u.id,
      u.email::TEXT,
      p.full_name,
      p.avatar_url,
      COALESCE(p.role, 'contributor'),
      COALESCE(u.raw_app_meta_data->>'provider', 'email'),
      u.created_at,
      u.email_confirmed_at,
      u.confirmation_sent_at,
      u.last_sign_in_at,
      public.effective_account_status(p.account_status, p.suspended_until),
      CASE WHEN p.account_status = 'suspended' AND p.suspended_until > NOW() THEN p.suspended_until END,
      CASE WHEN public.effective_account_status(p.account_status, p.suspended_until) <> 'active'
        THEN p.moderation_reason END,
      p.moderated_at,
      COALESCE(p.content_hidden, FALSE),
      (SELECT COUNT(*) FROM public.routes r WHERE r.user_id = u.id),
      (SELECT COUNT(*) FROM public.route_comments c WHERE c.user_id = u.id)
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
