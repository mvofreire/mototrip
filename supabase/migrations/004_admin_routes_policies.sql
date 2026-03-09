-- Enable RLS on routes table if not already enabled
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view published routes" ON public.routes;
DROP POLICY IF EXISTS "Users can insert their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can update their own routes" ON public.routes;
DROP POLICY IF EXISTS "Users can delete their own routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can view all routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can update all routes" ON public.routes;
DROP POLICY IF EXISTS "Admins can delete all routes" ON public.routes;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public can view published routes
CREATE POLICY "Users can view published routes"
  ON public.routes FOR SELECT
  USING (published = TRUE OR user_id = auth.uid() OR is_admin());

-- Users can insert their own routes
CREATE POLICY "Users can insert their own routes"
  ON public.routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own routes
CREATE POLICY "Users can update their own routes"
  ON public.routes FOR UPDATE
  USING (auth.uid() = user_id OR is_admin());

-- Users can delete their own routes
CREATE POLICY "Users can delete their own routes"
  ON public.routes FOR DELETE
  USING (auth.uid() = user_id OR is_admin());

-- Admins can view all routes (even unpublished)
CREATE POLICY "Admins can view all routes"
  ON public.routes FOR SELECT
  USING (is_admin());

-- Grant necessary permissions
GRANT ALL ON public.routes TO authenticated;
