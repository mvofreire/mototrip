-- 018: Translations of route content
--
-- routes.translations      = { "en": { "title": "...", "description": "..." }, "es": {...}, ... }
-- route_stops.translations = { "en": { "name": "...", "description": "..." }, ... }
-- The original (routes.title/description, Portuguese) is the fallback.
-- When the original text changes, its translations are dropped so a stale
-- translation is never shown; the site falls back to the original until the
-- route is translated again.

ALTER TABLE public.routes
  ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.route_stops
  ADD COLUMN IF NOT EXISTS translations JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION public.routes_drop_stale_translations()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.title IS DISTINCT FROM OLD.title OR NEW.description IS DISTINCT FROM OLD.description)
     AND NEW.translations IS NOT DISTINCT FROM OLD.translations THEN
    NEW.translations := '{}'::jsonb;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_routes_drop_stale_translations ON public.routes;
CREATE TRIGGER trigger_routes_drop_stale_translations
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.routes_drop_stale_translations();

CREATE OR REPLACE FUNCTION public.route_stops_drop_stale_translations()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (NEW.name IS DISTINCT FROM OLD.name OR NEW.description IS DISTINCT FROM OLD.description)
     AND NEW.translations IS NOT DISTINCT FROM OLD.translations THEN
    NEW.translations := '{}'::jsonb;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_route_stops_drop_stale_translations ON public.route_stops;
CREATE TRIGGER trigger_route_stops_drop_stale_translations
  BEFORE UPDATE ON public.route_stops
  FOR EACH ROW EXECUTE FUNCTION public.route_stops_drop_stale_translations();
