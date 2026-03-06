-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create routes table
CREATE TABLE public.routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'moderate', 'challenging', 'expert')),
  distance_km DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  elevation_gain_m INTEGER,
  polyline_coordinates JSONB NOT NULL,
  region TEXT,
  category TEXT NOT NULL CHECK (category IN ('scenic', 'mountain', 'coastal', 'weekend', 'adventure')),
  scenic_score DECIMAL(3, 1) DEFAULT 0 CHECK (scenic_score >= 0 AND scenic_score <= 10),
  road_quality_score DECIMAL(3, 1) DEFAULT 0 CHECK (road_quality_score >= 0 AND road_quality_score <= 10),
  fun_factor_score DECIMAL(3, 1) DEFAULT 0 CHECK (fun_factor_score >= 0 AND fun_factor_score <= 10),
  featured BOOLEAN DEFAULT FALSE,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create route_stops table
CREATE TABLE public.route_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('viewpoint', 'cafe', 'gas_station', 'restaurant', 'landmark', 'accommodation')),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create route_photos table
CREATE TABLE public.route_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create route_ratings table
CREATE TABLE public.route_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  scenic_rating DECIMAL(3, 1) NOT NULL CHECK (scenic_rating >= 0 AND scenic_rating <= 10),
  road_quality_rating DECIMAL(3, 1) NOT NULL CHECK (road_quality_rating >= 0 AND road_quality_rating <= 10),
  fun_factor_rating DECIMAL(3, 1) NOT NULL CHECK (fun_factor_rating >= 0 AND fun_factor_rating <= 10),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(route_id, user_id)
);

-- Create saved_routes table
CREATE TABLE public.saved_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, route_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_routes_user_id ON public.routes(user_id);
CREATE INDEX idx_routes_category ON public.routes(category);
CREATE INDEX idx_routes_difficulty ON public.routes(difficulty);
CREATE INDEX idx_routes_featured ON public.routes(featured) WHERE featured = TRUE;
CREATE INDEX idx_routes_published ON public.routes(published) WHERE published = TRUE;
CREATE INDEX idx_routes_scenic_score ON public.routes(scenic_score DESC);
CREATE INDEX idx_routes_created_at ON public.routes(created_at DESC);

CREATE INDEX idx_route_stops_route_id ON public.route_stops(route_id);
CREATE INDEX idx_route_stops_order ON public.route_stops(route_id, order_index);

CREATE INDEX idx_route_photos_route_id ON public.route_photos(route_id);
CREATE INDEX idx_route_photos_user_id ON public.route_photos(user_id);

CREATE INDEX idx_route_ratings_route_id ON public.route_ratings(route_id);
CREATE INDEX idx_route_ratings_user_id ON public.route_ratings(user_id);

CREATE INDEX idx_saved_routes_user_id ON public.saved_routes(user_id);
CREATE INDEX idx_saved_routes_route_id ON public.saved_routes(route_id);

-- Create function to update average ratings
CREATE OR REPLACE FUNCTION update_route_scores()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.routes
  SET 
    scenic_score = (
      SELECT AVG(scenic_rating)
      FROM public.route_ratings
      WHERE route_id = NEW.route_id
    ),
    road_quality_score = (
      SELECT AVG(road_quality_rating)
      FROM public.route_ratings
      WHERE route_id = NEW.route_id
    ),
    fun_factor_score = (
      SELECT AVG(fun_factor_rating)
      FROM public.route_ratings
      WHERE route_id = NEW.route_id
    ),
    updated_at = NOW()
  WHERE id = NEW.route_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update route scores
CREATE TRIGGER trigger_update_route_scores
AFTER INSERT OR UPDATE OR DELETE ON public.route_ratings
FOR EACH ROW
EXECUTE FUNCTION update_route_scores();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_route_ratings_updated_at
BEFORE UPDATE ON public.route_ratings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_routes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Routes: Anyone can read published routes, only owners can modify
CREATE POLICY "Published routes are viewable by everyone"
  ON public.routes FOR SELECT
  USING (published = true OR user_id = auth.uid());

CREATE POLICY "Users can create routes"
  ON public.routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own routes"
  ON public.routes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own routes"
  ON public.routes FOR DELETE
  USING (auth.uid() = user_id);

-- Route Stops: Readable by everyone, modifiable by route owner
CREATE POLICY "Route stops are viewable by everyone"
  ON public.route_stops FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routes
      WHERE routes.id = route_stops.route_id
      AND (routes.published = true OR routes.user_id = auth.uid())
    )
  );

CREATE POLICY "Route owners can manage stops"
  ON public.route_stops FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.routes
      WHERE routes.id = route_stops.route_id
      AND routes.user_id = auth.uid()
    )
  );

-- Route Photos: Similar to stops
CREATE POLICY "Route photos are viewable by everyone"
  ON public.route_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.routes
      WHERE routes.id = route_photos.route_id
      AND (routes.published = true OR routes.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can add photos to routes"
  ON public.route_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.route_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Route Ratings: Users can rate routes
CREATE POLICY "Route ratings are viewable by everyone"
  ON public.route_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON public.route_ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON public.route_ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON public.route_ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Routes: Users manage their own saved routes
CREATE POLICY "Users can view own saved routes"
  ON public.saved_routes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save routes"
  ON public.saved_routes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave routes"
  ON public.saved_routes FOR DELETE
  USING (auth.uid() = user_id);
