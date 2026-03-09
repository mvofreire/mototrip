-- Fix RLS policies for admin access
-- This replaces the previous migration with corrected policies

-- Drop all existing policies on routes
DROP POLICY IF EXISTS "Users can view published routes" ON public.routes;
DROP POLICY IF EXISTS "Published routes are viewable by everyone" ON public.routes;
DROP POLICY IF EXISTS "Users can insert their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can create routes" ON public.routes;
DROP POLICY IF EXISTS "Users can update their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can update own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can delete their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can delete own routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can view all routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can update all routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can delete all routes" ON public.routes;

-- Ensure is_admin function exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view published routes OR their own routes OR if they are admin
CREATE POLICY "Anyone can view appropriate routes"
  ON public.routes FOR SELECT
  USING (
    published = TRUE 
    OR user_id = auth.uid() 
    OR is_admin()
  );

-- Policy 2: Authenticated users can insert their own routes
CREATE POLICY "Users can insert own routes"
  ON public.routes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own routes OR admins can update any
CREATE POLICY "Users can update own routes or admins can update any"
  ON public.routes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- Policy 4: Users can delete their own routes OR admins can delete any
CREATE POLICY "Users can delete own routes or admins can delete any"
  ON public.routes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR is_admin());
