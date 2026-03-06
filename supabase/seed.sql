-- Insert sample routes into Supabase
-- Note: Replace user_id values with actual user IDs from your Supabase auth.users table

-- Sample route 1: Pacific Coast Highway
INSERT INTO public.routes (
  user_id,
  title,
  description,
  difficulty,
  distance_km,
  duration_minutes,
  elevation_gain_m,
  polyline_coordinates,
  region,
  category,
  scenic_score,
  road_quality_score,
  fun_factor_score,
  featured,
  published
) VALUES (
  'YOUR_USER_ID_HERE',
  'Pacific Coast Highway: Big Sur Edition',
  'Experience one of the most scenic coastal drives in the world. This route takes you through the dramatic cliffs of Big Sur, with countless viewpoints overlooking the Pacific Ocean.',
  'moderate',
  145,
  240,
  1200,
  '{"type":"LineString","coordinates":[[-121.9018,36.6002],[-121.8742,36.4502],[-121.6805,36.2342]]}',
  'California, USA',
  'coastal',
  9.8,
  8.5,
  9.2,
  true,
  true
);

-- Get the route ID for adding stops
-- You would need to get the actual ID after inserting

-- Sample stops for Pacific Coast Highway
-- INSERT INTO public.route_stops (route_id, name, description, type, latitude, longitude, order_index) VALUES
-- ('route_id_here', 'Bixby Bridge', 'Iconic bridge with stunning ocean views', 'viewpoint', 36.3717, -121.9021, 1),
-- ('route_id_here', 'Nepenthe Restaurant', 'Famous restaurant with panoramic views', 'restaurant', 36.2458, -121.8105, 2),
-- ('route_id_here', 'McWay Falls', 'Beautiful waterfall flowing directly into the ocean', 'viewpoint', 36.1597, -121.6693, 3);

-- Sample route 2: Stelvio Pass
INSERT INTO public.routes (
  user_id,
  title,
  description,
  difficulty,
  distance_km,
  duration_minutes,
  elevation_gain_m,
  polyline_coordinates,
  region,
  category,
  scenic_score,
  road_quality_score,
  fun_factor_score,
  featured,
  published
) VALUES (
  'YOUR_USER_ID_HERE',
  'Stelvio Pass: Alpine Adventure',
  'Conquer one of the highest paved mountain passes in the Eastern Alps. Famous for its 48 hairpin turns and breathtaking alpine scenery.',
  'expert',
  78,
  180,
  1871,
  '{"type":"LineString","coordinates":[[10.4520,46.5281],[10.4520,46.5281]]}',
  'Italian Alps',
  'mountain',
  10.0,
  8.0,
  9.8,
  true,
  true
);

-- Sample route 3: Blue Ridge Parkway
INSERT INTO public.routes (
  user_id,
  title,
  description,
  difficulty,
  distance_km,
  duration_minutes,
  elevation_gain_m,
  polyline_coordinates,
  region,
  category,
  scenic_score,
  road_quality_score,
  fun_factor_score,
  featured,
  published
) VALUES (
  'YOUR_USER_ID_HERE',
  'Blue Ridge Parkway: Autumn Colors',
  'A leisurely ride through the Appalachian Highlands. Best experienced in fall when the mountains explode with color.',
  'easy',
  192,
  300,
  890,
  '{"type":"LineString","coordinates":[[-82.5515,35.5951],[-79.0753,36.5782]]}',
  'North Carolina, USA',
  'scenic',
  9.5,
  9.0,
  8.5,
  true,
  true
);
