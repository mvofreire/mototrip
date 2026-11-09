-- 019: "I rode this route" + community ratings
--
-- A row in route_ratings means "I rode this route": scenery, road and fun
-- scores from 1 to 5 plus an optional comment. Routes keep their editorial
-- scores (scenic_score / road_quality_score / fun_factor_score, 0–10); the
-- community aggregate lives in its own columns, kept up to date by a trigger:
--   rating_count, rating_average, rating_scenic, rating_road, rating_fun
-- Rules: only published routes can be rated, authors can't rate their own
-- routes, staff can remove any rating.

-- --------------------------------------------------------------- columns
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating_average NUMERIC(3, 2),
  ADD COLUMN IF NOT EXISTS rating_scenic NUMERIC(3, 2),
  ADD COLUMN IF NOT EXISTS rating_road NUMERIC(3, 2),
  ADD COLUMN IF NOT EXISTS rating_fun NUMERIC(3, 2);

-- 1–5 scale (there were no ratings yet)
ALTER TABLE public.route_ratings
  DROP CONSTRAINT IF EXISTS route_ratings_scenic_rating_check,
  DROP CONSTRAINT IF EXISTS route_ratings_road_quality_rating_check,
  DROP CONSTRAINT IF EXISTS route_ratings_fun_factor_rating_check;
ALTER TABLE public.route_ratings
  ADD CONSTRAINT route_ratings_scenic_rating_check CHECK (scenic_rating BETWEEN 1 AND 5),
  ADD CONSTRAINT route_ratings_road_quality_rating_check CHECK (road_quality_rating BETWEEN 1 AND 5),
  ADD CONSTRAINT route_ratings_fun_factor_rating_check CHECK (fun_factor_rating BETWEEN 1 AND 5),
  ADD CONSTRAINT route_ratings_comment_length CHECK (comment IS NULL OR char_length(comment) <= 1000);

-- ------------------------------------------------------ aggregate trigger
-- Runs as owner so any rider's rating updates the route; the flag lets the
-- review guard accept these columns from a non-staff session.
CREATE OR REPLACE FUNCTION public.update_route_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid UUID := COALESCE(NEW.route_id, OLD.route_id);
BEGIN
  PERFORM set_config('mototrip.rating_aggregate', 'on', true);
  UPDATE public.routes r
  SET rating_count = a.n,
      rating_scenic = a.scenic,
      rating_road = a.road,
      rating_fun = a.fun,
      rating_average = CASE WHEN a.n > 0 THEN round((a.scenic + a.road + a.fun) / 3, 2) END
  FROM (
    SELECT count(*)::int AS n,
           round(avg(scenic_rating), 2) AS scenic,
           round(avg(road_quality_rating), 2) AS road,
           round(avg(fun_factor_rating), 2) AS fun
    FROM public.route_ratings
    WHERE route_id = rid
  ) a
  WHERE r.id = rid;
  PERFORM set_config('mototrip.rating_aggregate', 'off', true);
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ---------------------------------------------------------- review guard
-- Same as 014, plus: rating columns never count as an edit, and only the
-- aggregate trigger (or staff / service role) may change them.
CREATE OR REPLACE FUNCTION public.routes_review_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  review_cols TEXT[] := ARRAY[
    'status', 'published', 'featured', 'review_note', 'reviewed_by',
    'reviewed_at', 'updated_at', 'thumbnail_url',
    'rating_count', 'rating_average', 'rating_scenic', 'rating_road', 'rating_fun'
  ];
  aggregating BOOLEAN := coalesce(current_setting('mototrip.rating_aggregate', true), '') = 'on';
BEGIN
  IF auth.uid() IS NULL THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.published THEN NEW.status := 'approved'; END IF;
    ELSIF NEW.published IS DISTINCT FROM OLD.published AND NEW.status = OLD.status THEN
      NEW.status := CASE WHEN NEW.published THEN 'approved' ELSE 'pending' END;
    END IF;

  ELSIF public.is_staff() THEN
    IF TG_OP = 'UPDATE' AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
      NEW.user_id := OLD.user_id;
    END IF;
    IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
      IF NEW.status IN ('approved', 'rejected') THEN
        NEW.reviewed_by := auth.uid();
        NEW.reviewed_at := NOW();
      ELSE
        NEW.reviewed_by := NULL;
        NEW.reviewed_at := NULL;
      END IF;
      IF NEW.status <> 'rejected' THEN
        NEW.review_note := NULL;
      END IF;
    END IF;

  ELSE
    IF TG_OP = 'INSERT' THEN
      NEW.status := 'pending';
      NEW.featured := FALSE;
      NEW.review_note := NULL;
      NEW.reviewed_by := NULL;
      NEW.reviewed_at := NULL;
      NEW.rating_count := 0;
      NEW.rating_average := NULL;
      NEW.rating_scenic := NULL;
      NEW.rating_road := NULL;
      NEW.rating_fun := NULL;
    ELSE
      NEW.user_id := OLD.user_id;
      NEW.featured := OLD.featured;
      NEW.review_note := OLD.review_note;
      NEW.reviewed_by := OLD.reviewed_by;
      NEW.reviewed_at := OLD.reviewed_at;
      IF NOT aggregating THEN
        NEW.rating_count := OLD.rating_count;
        NEW.rating_average := OLD.rating_average;
        NEW.rating_scenic := OLD.rating_scenic;
        NEW.rating_road := OLD.rating_road;
        NEW.rating_fun := OLD.rating_fun;
      END IF;
      IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'pending' THEN
        NEW.status := OLD.status;
      END IF;
      IF (to_jsonb(NEW) - review_cols) IS DISTINCT FROM (to_jsonb(OLD) - review_cols) THEN
        NEW.status := 'pending';
      END IF;
      IF NEW.status = 'pending' AND OLD.status <> 'pending' THEN
        NEW.review_note := NULL;
        NEW.reviewed_by := NULL;
        NEW.reviewed_at := NULL;
      END IF;
    END IF;
  END IF;

  NEW.published := (NEW.status = 'approved');
  RETURN NEW;
END;
$$;

-- ------------------------------------------------------------- policies
DROP POLICY IF EXISTS "Authenticated users can create ratings" ON public.route_ratings;
CREATE POLICY "Riders can rate published routes of others"
  ON public.route_ratings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND EXISTS (
      SELECT 1 FROM public.routes r
      WHERE r.id = route_ratings.route_id AND r.published AND r.user_id <> auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own ratings" ON public.route_ratings;
CREATE POLICY "Users can update own ratings"
  ON public.route_ratings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can delete any rating" ON public.route_ratings;
CREATE POLICY "Staff can delete any rating"
  ON public.route_ratings FOR DELETE TO authenticated
  USING (public.is_staff());
