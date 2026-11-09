-- 016: Readable route URLs
--
-- routes.slug ("nacional-2-chaves-faro") is generated from the title when a
-- route is created and never changes afterwards, so shared links keep
-- working. Old /routes/<uuid> URLs redirect to /routes/<slug> in the app.

-- Lowercase ASCII, words joined by "-" (accents folded, punctuation dropped)
CREATE OR REPLACE FUNCTION public.slugify(input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(BOTH '-' FROM regexp_replace(
    translate(
      lower(coalesce(input, '')),
      'áàâãäåāéèêëēíìîïóòôõöøúùûüçñ’''',
      'aaaaaaaeeeeeiiiioooooouuuucn'
    ),
    '[^a-z0-9]+', '-', 'g'
  ))
$$;

ALTER TABLE public.routes ADD COLUMN IF NOT EXISTS slug TEXT;

-- Unique slug for a title (max ~80 chars, cut at a word boundary)
CREATE OR REPLACE FUNCTION public.unique_route_slug(title TEXT, route_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  base TEXT := public.slugify(title);
  candidate TEXT;
  n INT := 1;
BEGIN
  IF length(base) > 80 THEN
    base := regexp_replace(left(base, 80), '-[^-]*$', '');
  END IF;
  IF base = '' THEN
    base := 'rota';
  END IF;
  candidate := base;
  WHILE EXISTS (SELECT 1 FROM public.routes WHERE slug = candidate AND id <> route_id) LOOP
    n := n + 1;
    candidate := base || '-' || n;
  END LOOP;
  RETURN candidate;
END;
$$;

-- Backfill, oldest first so the original keeps the plain slug
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id, title FROM public.routes WHERE slug IS NULL ORDER BY created_at LOOP
    UPDATE public.routes SET slug = public.unique_route_slug(r.title, r.id) WHERE id = r.id;
  END LOOP;
END $$;

ALTER TABLE public.routes ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS routes_slug_key ON public.routes(slug);

-- Set on insert; keep it stable afterwards
CREATE OR REPLACE FUNCTION public.routes_set_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.slug IS NULL OR NEW.slug = '' OR NOT public.is_staff() AND auth.uid() IS NOT NULL THEN
      NEW.slug := public.unique_route_slug(NEW.title, NEW.id);
    END IF;
  ELSIF OLD.slug IS NOT NULL AND NEW.slug IS DISTINCT FROM OLD.slug THEN
    NEW.slug := OLD.slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_routes_slug ON public.routes;
CREATE TRIGGER trigger_routes_slug
  BEFORE INSERT OR UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.routes_set_slug();
