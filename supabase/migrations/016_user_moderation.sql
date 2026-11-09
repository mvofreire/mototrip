-- 016: User moderation (suspend / ban / reactivate) + moderation history
--
-- Status (profiles.account_status)
--   active    — default
--   suspended — temporary, until profiles.suspended_until (expires by itself)
--   banned    — permanent until an admin reactivates the account
--
-- Enforcement
--   1. auth.users.banned_until: Supabase Auth refuses sign-in and token
--      refresh (email and Google). Existing sessions are revoked.
--   2. RESTRICTIVE RLS policies: a still-valid access token (up to 1h) can no
--      longer write anything (routes, stops, photos, comments, ratings,
--      saves, profile, storage uploads).
--   3. The app reads my_account_status() and signs blocked users out.
--
-- Only admins moderate; admins themselves and your own account are off limits.
-- The moderation columns are not granted to clients (see 010), so the reason
-- is only visible to admins and to the user (my_account_status()).

-- ---------------------------------------------------------------- columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'active'
    CHECK (account_status IN ('active', 'suspended', 'banned')),
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
  ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

-- ---------------------------------------------------------------- history
CREATE TABLE IF NOT EXISTS public.user_moderation_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('suspend', 'ban', 'reactivate', 'role_change')),
  reason TEXT,
  suspended_until TIMESTAMPTZ,
  details JSONB,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_moderation_log_user
  ON public.user_moderation_log(user_id, created_at DESC);

ALTER TABLE public.user_moderation_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_moderation_log FROM anon, authenticated;
REVOKE ALL ON SEQUENCE public.user_moderation_log_id_seq FROM anon, authenticated;

-- ----------------------------------------------------------------- helpers
-- Effective status: an expired suspension counts as active
CREATE OR REPLACE FUNCTION public.effective_account_status(status TEXT, until TIMESTAMPTZ)
RETURNS TEXT
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN status = 'suspended' AND until IS NOT NULL AND until <= NOW() THEN 'active'
    ELSE COALESCE(status, 'active')
  END
$$;
GRANT EXECUTE ON FUNCTION public.effective_account_status(TEXT, TIMESTAMPTZ) TO anon, authenticated;

-- True unless the current user is suspended or banned
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND public.effective_account_status(account_status, suspended_until) <> 'active'
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.is_active_user() TO anon, authenticated;

-- The signed-in user's own status (to explain why they were signed out)
CREATE OR REPLACE FUNCTION public.my_account_status()
RETURNS TABLE (status TEXT, suspended_until TIMESTAMPTZ, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT
      public.effective_account_status(p.account_status, p.suspended_until),
      CASE WHEN p.account_status = 'suspended' THEN p.suspended_until END,
      CASE WHEN public.effective_account_status(p.account_status, p.suspended_until) <> 'active'
        THEN p.moderation_reason END
    FROM public.profiles p
    WHERE p.id = auth.uid();
END;
$$;
REVOKE ALL ON FUNCTION public.my_account_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_account_status() TO authenticated;

-- -------------------------------------------------------------- moderation
CREATE OR REPLACE FUNCTION public.admin_moderate_user(
  target_user UUID,
  new_status TEXT,
  until TIMESTAMPTZ DEFAULT NULL,
  reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_reason TEXT := NULLIF(BTRIM(reason), '');
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
    moderated_by = auth.uid(),
    moderated_at = NOW()
  WHERE id = target_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0002';
  END IF;

  -- Supabase Auth refuses sign-in / refresh while banned_until is in the future
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

  INSERT INTO public.user_moderation_log (user_id, action, reason, suspended_until, performed_by)
  VALUES (
    target_user,
    CASE new_status WHEN 'suspended' THEN 'suspend' WHEN 'banned' THEN 'ban' ELSE 'reactivate' END,
    clean_reason,
    CASE WHEN new_status = 'suspended' THEN until END,
    auth.uid()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_moderate_user(UUID, TEXT, TIMESTAMPTZ, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_moderate_user(UUID, TEXT, TIMESTAMPTZ, TEXT) TO authenticated;

-- Role changes now also go to the history
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_role TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  IF new_role NOT IN ('contributor', 'curator') THEN
    RAISE EXCEPTION 'invalid role %', new_role USING ERRCODE = '22023';
  END IF;
  SELECT role INTO old_role FROM public.profiles WHERE id = target_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user not found' USING ERRCODE = 'P0002';
  END IF;
  IF old_role = 'admin' THEN
    RAISE EXCEPTION 'cannot change the role of an admin' USING ERRCODE = '42501';
  END IF;
  IF old_role IS NOT DISTINCT FROM new_role THEN
    RETURN;
  END IF;
  UPDATE public.profiles SET role = new_role WHERE id = target_user;
  INSERT INTO public.user_moderation_log (user_id, action, details, performed_by)
  VALUES (target_user, 'role_change', jsonb_build_object('from', old_role, 'to', new_role), auth.uid());
END;
$$;
REVOKE ALL ON FUNCTION public.admin_set_user_role(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(UUID, TEXT) TO authenticated;

-- History of one user, newest first (admin only)
CREATE OR REPLACE FUNCTION public.admin_user_moderation_log(target_user UUID)
RETURNS TABLE (
  id BIGINT,
  action TEXT,
  reason TEXT,
  suspended_until TIMESTAMPTZ,
  details JSONB,
  performed_by_name TEXT,
  created_at TIMESTAMPTZ
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
    SELECT l.id, l.action, l.reason, l.suspended_until, l.details,
           COALESCE(p.full_name, p.email), l.created_at
    FROM public.user_moderation_log l
    LEFT JOIN public.profiles p ON p.id = l.performed_by
    WHERE l.user_id = target_user
    ORDER BY l.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_user_moderation_log(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_moderation_log(UUID) TO authenticated;

-- ------------------------------------------------------- admin_list_users
-- Return type changes, so drop first
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
      (SELECT COUNT(*) FROM public.routes r WHERE r.user_id = u.id),
      (SELECT COUNT(*) FROM public.route_comments c WHERE c.user_id = u.id)
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    ORDER BY u.created_at DESC;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- ------------------------------------------- write blocks (RESTRICTIVE RLS)
-- ANDed with the existing permissive policies.
DROP POLICY IF EXISTS "Active users only (insert)" ON public.routes;
CREATE POLICY "Active users only (insert)" ON public.routes
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_active_user());
DROP POLICY IF EXISTS "Active users only (update)" ON public.routes;
CREATE POLICY "Active users only (update)" ON public.routes
  AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_active_user());

DROP POLICY IF EXISTS "Active users only (insert)" ON public.route_stops;
CREATE POLICY "Active users only (insert)" ON public.route_stops
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_active_user());
DROP POLICY IF EXISTS "Active users only (update)" ON public.route_stops;
CREATE POLICY "Active users only (update)" ON public.route_stops
  AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_active_user());
DROP POLICY IF EXISTS "Active users only (delete)" ON public.route_stops;
CREATE POLICY "Active users only (delete)" ON public.route_stops
  AS RESTRICTIVE FOR DELETE TO authenticated USING (public.is_active_user());

DROP POLICY IF EXISTS "Active users only (insert)" ON public.route_photos;
CREATE POLICY "Active users only (insert)" ON public.route_photos
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS "Active users only (insert)" ON public.route_comments;
CREATE POLICY "Active users only (insert)" ON public.route_comments
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_active_user());
DROP POLICY IF EXISTS "Active users only (update)" ON public.route_comments;
CREATE POLICY "Active users only (update)" ON public.route_comments
  AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_active_user());

DROP POLICY IF EXISTS "Active users only (insert)" ON public.route_ratings;
CREATE POLICY "Active users only (insert)" ON public.route_ratings
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_active_user());
DROP POLICY IF EXISTS "Active users only (update)" ON public.route_ratings;
CREATE POLICY "Active users only (update)" ON public.route_ratings
  AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_active_user());

DROP POLICY IF EXISTS "Active users only (insert)" ON public.saved_routes;
CREATE POLICY "Active users only (insert)" ON public.saved_routes
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_active_user());

DROP POLICY IF EXISTS "Active users only (update)" ON public.profiles;
CREATE POLICY "Active users only (update)" ON public.profiles
  AS RESTRICTIVE FOR UPDATE TO authenticated USING (public.is_active_user());

DROP POLICY IF EXISTS "Active users only (upload)" ON storage.objects;
CREATE POLICY "Active users only (upload)" ON storage.objects
  AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (public.is_active_user());
