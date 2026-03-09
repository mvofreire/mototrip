-- Test script to check admin setup

-- 1. Check if profiles table exists and has role column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- 2. Check if any admin users exist
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin';

-- 3. Check if routes exist
SELECT COUNT(*) as total_routes
FROM public.routes;

-- 4. Check if is_admin function exists
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'is_admin';

-- 5. Check RLS policies on routes table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'routes';

-- 6. Sample routes with user info
SELECT 
  r.id,
  r.title,
  r.published,
  r.featured,
  r.user_id,
  p.email as user_email,
  p.full_name as user_name
FROM public.routes r
LEFT JOIN public.profiles p ON r.user_id = p.id
LIMIT 5;
