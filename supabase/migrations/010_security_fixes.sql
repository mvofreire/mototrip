-- 010: Security fixes for profiles
--  1. New users can no longer choose their role via signUp metadata.
--  2. Users can no longer change their own role/email (column-level privileges).
--  3. Emails are no longer readable by anon/authenticated clients; admins get
--     them through admin_get_user_emails().

-- 1. Signup trigger always creates contributors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'contributor'
  );
  RETURN NEW;
END;
$$;

-- Pin search_path on the other SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- 2. Clients may only write harmless columns
REVOKE INSERT, UPDATE ON public.profiles FROM anon, authenticated;
GRANT INSERT (id, email, full_name, avatar_url) ON public.profiles TO authenticated;
GRANT UPDATE (full_name, avatar_url) ON public.profiles TO authenticated;

ALTER POLICY "Users can update own profile" ON public.profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Hide email from public reads
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, full_name, avatar_url, role, created_at, updated_at)
  ON public.profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_get_user_emails(user_ids UUID[])
RETURNS TABLE (id UUID, email TEXT)
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
    SELECT p.id, p.email FROM public.profiles p WHERE p.id = ANY(user_ids);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_user_emails(UUID[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_get_user_emails(UUID[]) TO authenticated;
