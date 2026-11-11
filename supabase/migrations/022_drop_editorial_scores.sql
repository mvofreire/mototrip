-- 022: Drop the old editorial scores
--
-- scenic_score / road_quality_score / fun_factor_score (0–10) were set when a
-- route was created, without research. They are replaced by the MotoTrip
-- curator review (021: route_curator_reviews + routes.curator_*), and nothing
-- in the app or the jobs reads or writes them any more.
--
-- Apply only after the code from the curator-review change is deployed: the
-- previous version of the site still orders featured routes by scenic_score.

DROP INDEX IF EXISTS public.idx_routes_scenic_score;

ALTER TABLE public.routes
  DROP COLUMN IF EXISTS scenic_score,
  DROP COLUMN IF EXISTS road_quality_score,
  DROP COLUMN IF EXISTS fun_factor_score;
