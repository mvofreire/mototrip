-- 029: routes.comments_count
--
-- Route cards showed the comment count with one count query per card, run
-- from the browser (/explore fired 58+ requests to route_comments). The count
-- now lives on the route, kept up to date by a trigger like rating_count, so
-- listings get it with the route row.
-- Like rating_count, it counts every comment, including those of users whose
-- content is hidden.

ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;

UPDATE public.routes r
SET comments_count = c.n
FROM (SELECT route_id, count(*)::int AS n FROM public.route_comments GROUP BY route_id) c
WHERE r.id = c.route_id;

-- Runs as owner so any rider's comment updates the route; reuses the
-- aggregate flag so the review guard accepts the change from a non-staff
-- session.
CREATE OR REPLACE FUNCTION public.update_route_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rid UUID := COALESCE(NEW.route_id, OLD.route_id);
BEGIN
  PERFORM set_config('mototrip.rating_aggregate', 'on', true);
  UPDATE public.routes
  SET comments_count = (SELECT count(*)::int FROM public.route_comments WHERE route_id = rid)
  WHERE id = rid;
  PERFORM set_config('mototrip.rating_aggregate', 'off', true);
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_route_comments_count ON public.route_comments;
CREATE TRIGGER trigger_route_comments_count
  AFTER INSERT OR DELETE ON public.route_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_route_comments_count();

-- ---------------------------------------------------------- review guard
-- Same as 021, plus comments_count: never counts as an edit, and only the
-- trigger (or staff / service role) may change it.
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
    'curator_rating', 'curator_scenic', 'curator_road', 'curator_fun',
    'comments_count'
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
      NEW.comments_count := 0;
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
        NEW.comments_count := OLD.comments_count;
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
