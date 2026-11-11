-- 021: MotoTrip curator review
--
-- Each route can have one review signed by the MotoTrip curation profile,
-- separate from the community ratings (route_ratings), so it never enters the
-- community average. Scores are 1–5 in half steps: overall, scenic, road, fun.
-- The first reviews come from web research (jobs/import_curator_reviews.ts).
--
-- routes keeps a copy of the scores (curator_rating, curator_scenic,
-- curator_road, curator_fun) for cards, sorting and filters, kept in sync by a
-- trigger. Only staff and the service role write reviews; route authors can
-- never change the curator columns.
--
-- The editorial scores (scenic_score / road_quality_score / fun_factor_score)
-- are replaced by this review and will be dropped in a later migration.

-- ----------------------------------------------------------------- table
CREATE TABLE IF NOT EXISTS public.route_curator_reviews (
  route_id      UUID PRIMARY KEY REFERENCES public.routes(id) ON DELETE CASCADE,
  curator_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  overall       NUMERIC(2, 1) NOT NULL,
  scenic        NUMERIC(2, 1) NOT NULL,
  road          NUMERIC(2, 1) NOT NULL,
  fun           NUMERIC(2, 1) NOT NULL,
  verdict       TEXT NOT NULL,
  highlights    TEXT[] NOT NULL DEFAULT '{}',
  warnings      TEXT[] NOT NULL DEFAULT '{}',
  best_season   TEXT,
  translations  JSONB NOT NULL DEFAULT '{}'::jsonb,
  sources       JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence    TEXT NOT NULL DEFAULT 'medium'
                  CHECK (confidence IN ('high', 'medium', 'low')),
  researched_at TIMESTAMPTZ,
  updated_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT curator_scores_range CHECK (
    overall BETWEEN 1 AND 5 AND scenic BETWEEN 1 AND 5 AND
    road BETWEEN 1 AND 5 AND fun BETWEEN 1 AND 5
  ),
  CONSTRAINT curator_scores_half_steps CHECK (
    overall * 2 = trunc(overall * 2) AND scenic * 2 = trunc(scenic * 2) AND
    road * 2 = trunc(road * 2) AND fun * 2 = trunc(fun * 2)
  ),
  CONSTRAINT curator_verdict_length CHECK (char_length(verdict) BETWEEN 1 AND 1500),
  CONSTRAINT curator_best_season_length CHECK (best_season IS NULL OR char_length(best_season) <= 200),
  CONSTRAINT curator_translations_object CHECK (jsonb_typeof(translations) = 'object'),
  CONSTRAINT curator_sources_array CHECK (jsonb_typeof(sources) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_route_curator_reviews_curator ON public.route_curator_reviews(curator_id);

ALTER TABLE public.route_curator_reviews ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------- routes columns
ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS curator_rating NUMERIC(2, 1),
  ADD COLUMN IF NOT EXISTS curator_scenic NUMERIC(2, 1),
  ADD COLUMN IF NOT EXISTS curator_road NUMERIC(2, 1),
  ADD COLUMN IF NOT EXISTS curator_fun NUMERIC(2, 1);

CREATE INDEX IF NOT EXISTS idx_routes_curator_rating ON public.routes(curator_rating DESC NULLS LAST);

-- ------------------------------------------- updated_at / updated_by / i18n
-- Editing the Portuguese text without sending translations drops the stale
-- translations (same rule as routes and stops in 018).
CREATE OR REPLACE FUNCTION public.route_curator_reviews_touch()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.updated_by := auth.uid();
  IF TG_OP = 'UPDATE'
     AND (NEW.verdict IS DISTINCT FROM OLD.verdict
          OR NEW.highlights IS DISTINCT FROM OLD.highlights
          OR NEW.warnings IS DISTINCT FROM OLD.warnings
          OR NEW.best_season IS DISTINCT FROM OLD.best_season)
     AND NEW.translations IS NOT DISTINCT FROM OLD.translations THEN
    NEW.translations := '{}'::jsonb;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_route_curator_reviews_touch ON public.route_curator_reviews;
CREATE TRIGGER trigger_route_curator_reviews_touch
  BEFORE INSERT OR UPDATE ON public.route_curator_reviews
  FOR EACH ROW EXECUTE FUNCTION public.route_curator_reviews_touch();

-- ------------------------------------------------- sync scores to routes
CREATE OR REPLACE FUNCTION public.sync_route_curator_scores()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.routes
      SET curator_rating = NULL, curator_scenic = NULL, curator_road = NULL, curator_fun = NULL
      WHERE id = OLD.route_id;
    RETURN OLD;
  END IF;

  UPDATE public.routes
    SET curator_rating = NEW.overall,
        curator_scenic = NEW.scenic,
        curator_road = NEW.road,
        curator_fun = NEW.fun
    WHERE id = NEW.route_id;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_route_curator_scores() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trigger_sync_route_curator_scores ON public.route_curator_reviews;
CREATE TRIGGER trigger_sync_route_curator_scores
  AFTER INSERT OR UPDATE OR DELETE ON public.route_curator_reviews
  FOR EACH ROW EXECUTE FUNCTION public.sync_route_curator_scores();

-- ---------------------------------------------------------- review guard
-- Same as 019, plus: the curator columns never count as an author edit, and
-- authors can't set or change them. Only the sync trigger writes them, and it
-- only runs for staff / service role writes on route_curator_reviews.
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
    'rating_count', 'rating_average', 'rating_scenic', 'rating_road', 'rating_fun',
    'curator_rating', 'curator_scenic', 'curator_road', 'curator_fun'
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
      NEW.curator_rating := NULL;
      NEW.curator_scenic := NULL;
      NEW.curator_road := NULL;
      NEW.curator_fun := NULL;
    ELSE
      NEW.user_id := OLD.user_id;
      NEW.featured := OLD.featured;
      NEW.review_note := OLD.review_note;
      NEW.reviewed_by := OLD.reviewed_by;
      NEW.reviewed_at := OLD.reviewed_at;
      NEW.curator_rating := OLD.curator_rating;
      NEW.curator_scenic := OLD.curator_scenic;
      NEW.curator_road := OLD.curator_road;
      NEW.curator_fun := OLD.curator_fun;
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
DROP POLICY IF EXISTS "Curator reviews follow route visibility" ON public.route_curator_reviews;
CREATE POLICY "Curator reviews follow route visibility"
  ON public.route_curator_reviews FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.routes r
    WHERE r.id = route_curator_reviews.route_id
      AND (r.published = TRUE OR r.user_id = auth.uid() OR public.is_staff())
  ));

DROP POLICY IF EXISTS "Staff can create curator reviews" ON public.route_curator_reviews;
CREATE POLICY "Staff can create curator reviews"
  ON public.route_curator_reviews FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can update curator reviews" ON public.route_curator_reviews;
CREATE POLICY "Staff can update curator reviews"
  ON public.route_curator_reviews FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can delete curator reviews" ON public.route_curator_reviews;
CREATE POLICY "Staff can delete curator reviews"
  ON public.route_curator_reviews FOR DELETE TO authenticated
  USING (public.is_staff());
