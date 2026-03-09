-- ============================================
-- DIAGNOSTIC SCRIPT - Execute no Supabase SQL Editor
-- ============================================

-- 1. Verificar se a tabela profiles existe e tem a coluna role
SELECT 'Step 1: Profiles table structure' as step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar quantos usuários admin existem
SELECT 'Step 2: Admin users count' as step;
SELECT COUNT(*) as admin_count
FROM public.profiles
WHERE role = 'admin';

-- 3. Listar usuários admin
SELECT 'Step 3: List admin users' as step;
SELECT id, email, full_name, role, created_at
FROM public.profiles
WHERE role = 'admin';

-- 4. Verificar quantas rotas existem
SELECT 'Step 4: Routes count' as step;
SELECT COUNT(*) as total_routes
FROM public.routes;

-- 5. Verificar se a função is_admin existe
SELECT 'Step 5: Check is_admin function' as step;
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'is_admin';

-- 6. Verificar políticas RLS na tabela routes
SELECT 'Step 6: RLS Policies on routes table' as step;
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'routes'
ORDER BY policyname;

-- 7. Verificar se RLS está habilitado
SELECT 'Step 7: RLS enabled status' as step;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'routes'
AND schemaname = 'public';

-- 8. Listar 5 rotas com informações do usuário
SELECT 'Step 8: Sample routes with user info' as step;
SELECT 
  r.id,
  r.title,
  r.published,
  r.featured,
  r.category,
  r.difficulty,
  r.distance_km,
  r.user_id,
  p.email as user_email,
  p.full_name as user_name,
  p.role as user_role,
  r.created_at
FROM public.routes r
LEFT JOIN public.profiles p ON r.user_id = p.id
ORDER BY r.created_at DESC
LIMIT 5;

-- 9. Verificar se existem rotas sem profile associado
SELECT 'Step 9: Routes without profile' as step;
SELECT COUNT(*) as routes_without_profile
FROM public.routes r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE p.id IS NULL;

-- 10. Verificar a estrutura da tabela routes
SELECT 'Step 10: Routes table structure' as step;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'routes'
ORDER BY ordinal_position;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Step 1: Deve mostrar as colunas da tabela profiles incluindo 'role'
-- Step 2: Deve mostrar pelo menos 1 admin
-- Step 3: Deve listar seu email como admin
-- Step 4: Deve mostrar o número total de rotas
-- Step 5: Deve mostrar que a função is_admin existe
-- Step 6: Deve listar várias políticas incluindo as de admin
-- Step 7: Deve mostrar rowsecurity = true
-- Step 8: Deve listar rotas com email e nome do usuário
-- Step 9: Deve ser 0 (zero rotas sem profile)
-- Step 10: Deve mostrar as colunas da tabela routes
