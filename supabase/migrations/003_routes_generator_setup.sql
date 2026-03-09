-- ============================================================================
-- Setup script for Routes Generator
-- ============================================================================
-- This script prepares the database for the routes generator job
-- Run this before executing the routes_generator.ts script

-- ============================================================================
-- 1. Create System User
-- ============================================================================

-- Insert system user for generated routes
-- This user will own all automatically generated routes
INSERT INTO public.users (id, email, name, bio, avatar_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@mototrip.com',
  'Sistema Mototrip',
  'Rotas geradas automaticamente usando dados do OpenStreetMap',
  null
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- ============================================================================
-- 2. Verify Tables Exist
-- ============================================================================

-- Check if all required tables exist
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check routes table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'routes') THEN
    missing_tables := array_append(missing_tables, 'routes');
  END IF;
  
  -- Check route_stops table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'route_stops') THEN
    missing_tables := array_append(missing_tables, 'route_stops');
  END IF;
  
  -- Check users table
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
    missing_tables := array_append(missing_tables, 'users');
  END IF;
  
  -- Report missing tables
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE EXCEPTION 'Missing required tables: %. Please run schema.sql first.', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'All required tables exist ✓';
  END IF;
END $$;

-- ============================================================================
-- 3. Add Indexes for Better Performance (if not exists)
-- ============================================================================

-- Index on region for filtering
CREATE INDEX IF NOT EXISTS idx_routes_region ON public.routes(region);

-- Composite index for featured + published routes
CREATE INDEX IF NOT EXISTS idx_routes_featured_published 
ON public.routes(featured, published) 
WHERE published = TRUE;

-- Index on fun_factor_score for sorting
CREATE INDEX IF NOT EXISTS idx_routes_fun_factor ON public.routes(fun_factor_score DESC);

-- GIN index for JSONB polyline_coordinates (for geospatial queries)
CREATE INDEX IF NOT EXISTS idx_routes_polyline_gin ON public.routes USING GIN (polyline_coordinates);

-- ============================================================================
-- 4. Helper Functions
-- ============================================================================

-- Function to count routes by region
CREATE OR REPLACE FUNCTION count_routes_by_region()
RETURNS TABLE(region TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.region,
    COUNT(*) as count
  FROM public.routes r
  WHERE r.user_id = '00000000-0000-0000-0000-000000000001'
  GROUP BY r.region
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get route statistics
CREATE OR REPLACE FUNCTION get_route_statistics()
RETURNS TABLE(
  total_routes BIGINT,
  total_distance_km NUMERIC,
  avg_distance_km NUMERIC,
  avg_scenic_score NUMERIC,
  avg_fun_factor NUMERIC,
  featured_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_routes,
    SUM(r.distance_km) as total_distance_km,
    ROUND(AVG(r.distance_km), 2) as avg_distance_km,
    ROUND(AVG(r.scenic_score), 2) as avg_scenic_score,
    ROUND(AVG(r.fun_factor_score), 2) as avg_fun_factor,
    COUNT(*) FILTER (WHERE r.featured = TRUE) as featured_count
  FROM public.routes r
  WHERE r.user_id = '00000000-0000-0000-0000-000000000001';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. Clean Up Functions
-- ============================================================================

-- Function to delete all system-generated routes
CREATE OR REPLACE FUNCTION delete_all_generated_routes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete all routes owned by system user
  DELETE FROM public.routes 
  WHERE user_id = '00000000-0000-0000-0000-000000000001';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % system-generated routes', deleted_count;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to delete routes by region
CREATE OR REPLACE FUNCTION delete_routes_by_region(region_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.routes 
  WHERE user_id = '00000000-0000-0000-0000-000000000001'
    AND region = region_name;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Deleted % routes from region: %', deleted_count, region_name;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Verification Queries
-- ============================================================================

-- Show system user
SELECT 
  id,
  email,
  name,
  bio,
  created_at
FROM public.users 
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Show current route counts by region
SELECT * FROM count_routes_by_region();

-- Show route statistics
SELECT * FROM get_route_statistics();

-- ============================================================================
-- Setup Complete
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Routes Generator Setup Complete ✓';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'System user created/verified';
  RAISE NOTICE 'Indexes optimized';
  RAISE NOTICE 'Helper functions installed';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now run: npm run generate:routes';
  RAISE NOTICE '========================================';
END $$;
