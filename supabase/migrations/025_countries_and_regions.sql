-- 025: Countries and regions as data
--
-- The submit form used a hard-coded country list (lib/countries.ts) and a
-- free-text region, which produced spellings like "Norte", "Norte Portugal"
-- and "North Portugal" for the same place. Regions now live in a table:
-- everyone reads them, only curators and admins add or change them.
--
-- routes.region stays a text column: it stores regions.route_region, the
-- value the destination pages (lib/regions.ts) already match on.
-- bbox lets the submit form pre-select the region of the route's start.

-- ---------------------------------------------------------------- countries
CREATE TABLE IF NOT EXISTS public.countries (
  code        CHAR(2) PRIMARY KEY CHECK (code ~ '^[A-Z]{2}$'),  -- ISO 3166-1
  flag        TEXT NOT NULL,
  name        JSONB NOT NULL,                                   -- {pt,en,es,fr,de}
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------ regions
CREATE TABLE IF NOT EXISTS public.regions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country       CHAR(2) NOT NULL REFERENCES public.countries(code) ON UPDATE CASCADE,
  -- Value stored in routes.region
  route_region  TEXT NOT NULL CHECK (length(trim(route_region)) BETWEEN 2 AND 60),
  name          JSONB NOT NULL,                                 -- {pt,en,es,fr,de}
  -- Other spellings found in routes.region (normalised on insert)
  aliases       TEXT[] NOT NULL DEFAULT '{}',
  -- [west, south, east, north], for detecting the region of a GPX start
  bbox          NUMERIC[] CHECK (bbox IS NULL OR array_length(bbox, 1) = 4),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (country, route_region)
);
CREATE INDEX IF NOT EXISTS idx_regions_country ON public.regions(country);

-- ---------------------------------------------------------------------- RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Countries are viewable by everyone" ON public.countries;
CREATE POLICY "Countries are viewable by everyone"
  ON public.countries FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Staff can add countries" ON public.countries;
CREATE POLICY "Staff can add countries"
  ON public.countries FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Staff can update countries" ON public.countries;
CREATE POLICY "Staff can update countries"
  ON public.countries FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Regions are viewable by everyone" ON public.regions;
CREATE POLICY "Regions are viewable by everyone"
  ON public.regions FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Staff can add regions" ON public.regions;
CREATE POLICY "Staff can add regions"
  ON public.regions FOR INSERT TO authenticated WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Staff can update regions" ON public.regions;
CREATE POLICY "Staff can update regions"
  ON public.regions FOR UPDATE TO authenticated
  USING (public.is_staff()) WITH CHECK (public.is_staff());
-- No DELETE policy: deactivate (is_active = false) instead, routes keep the text

-- created_by always comes from the session
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trigger_countries_created_by ON public.countries;
CREATE TRIGGER trigger_countries_created_by
  BEFORE INSERT ON public.countries FOR EACH ROW EXECUTE FUNCTION public.set_created_by();
DROP TRIGGER IF EXISTS trigger_regions_created_by ON public.regions;
CREATE TRIGGER trigger_regions_created_by
  BEFORE INSERT ON public.regions FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

-- --------------------------------------------------------------------- seed
INSERT INTO public.countries (code, flag, name) VALUES
  ('PT', '🇵🇹', '{"pt":"Portugal","en":"Portugal","es":"Portugal","fr":"Portugal","de":"Portugal"}'),
  ('ES', '🇪🇸', '{"pt":"Espanha","en":"Spain","es":"España","fr":"Espagne","de":"Spanien"}'),
  ('FR', '🇫🇷', '{"pt":"França","en":"France","es":"Francia","fr":"France","de":"Frankreich"}')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.regions (country, route_region, name, aliases, bbox) VALUES
  ('PT', 'Norte', '{"pt":"Norte de Portugal","en":"Northern Portugal","es":"Norte de Portugal","fr":"Nord du Portugal","de":"Nordportugal"}',
    '{"Norte Portugal","North Portugal"}', '{-8.90,40.80,-6.18,42.16}'),
  ('PT', 'Centro', '{"pt":"Centro de Portugal","en":"Central Portugal","es":"Centro de Portugal","fr":"Centre du Portugal","de":"Zentralportugal"}',
    '{}', '{-9.05,39.20,-6.80,40.80}'),
  ('PT', 'Lisboa', '{"pt":"Lisboa e arredores","en":"Lisbon area","es":"Lisboa y alrededores","fr":"Lisbonne et environs","de":"Lissabon und Umgebung"}',
    '{"Lisbon"}', '{-9.55,38.40,-8.70,39.10}'),
  ('PT', 'Alentejo', '{"pt":"Alentejo","en":"Alentejo","es":"Alentejo","fr":"Alentejo","de":"Alentejo"}',
    '{}', '{-9.00,37.30,-6.90,39.70}'),
  ('PT', 'Algarve', '{"pt":"Algarve","en":"Algarve","es":"Algarve","fr":"Algarve","de":"Algarve"}',
    '{}', '{-9.00,36.95,-7.38,37.55}'),
  ('ES', 'Picos de Europa', '{"pt":"Picos de Europa","en":"Picos de Europa","es":"Picos de Europa","fr":"Picos de Europa","de":"Picos de Europa"}',
    '{"North Spain"}', '{-5.60,42.85,-4.20,43.50}'),
  ('ES', 'Pirenéus', '{"pt":"Pirenéus","en":"Pyrenees","es":"Pirineos","fr":"Pyrénées","de":"Pyrenäen"}',
    '{"Pirineos","Pyrenees"}', '{-1.80,42.20,3.35,42.95}'),
  ('ES', 'Andaluzia', '{"pt":"Andaluzia","en":"Andalusia","es":"Andalucía","fr":"Andalousie","de":"Andalusien"}',
    '{"Andalucía","Andalusia"}', '{-7.55,35.90,-1.60,38.75}'),
  ('ES', 'Galiza', '{"pt":"Galiza","en":"Galicia","es":"Galicia","fr":"Galice","de":"Galicien"}',
    '{"Galicia"}', '{-9.35,41.80,-6.70,43.80}'),
  ('ES', 'Costa Brava', '{"pt":"Costa Brava","en":"Costa Brava","es":"Costa Brava","fr":"Costa Brava","de":"Costa Brava"}',
    '{}', '{2.70,41.60,3.35,42.45}'),
  ('FR', 'Alpes', '{"pt":"Alpes franceses","en":"French Alps","es":"Alpes franceses","fr":"Alpes françaises","de":"Französische Alpen"}',
    '{"Alps"}', '{5.00,43.70,7.80,46.45}'),
  ('FR', 'Provença', '{"pt":"Provença e Côte d’Azur","en":"Provence and the Riviera","es":"Provenza y Costa Azul","fr":"Provence et Côte d''Azur","de":"Provence und Côte d’Azur"}',
    '{"Provence"}', '{4.20,43.00,7.60,44.40}'),
  ('FR', 'Pirenéus', '{"pt":"Pirenéus franceses","en":"French Pyrenees","es":"Pirineo francés","fr":"Pyrénées françaises","de":"Französische Pyrenäen"}',
    '{"Pirineos","Pyrenees","Pyrénées"}', '{-1.80,42.60,3.20,43.40}'),
  ('FR', 'Maciço Central', '{"pt":"Maciço Central","en":"Massif Central","es":"Macizo Central","fr":"Massif central","de":"Zentralmassiv"}',
    '{"Massif Central"}', '{1.80,44.00,4.90,46.30}'),
  ('FR', 'Vosges e Alsácia', '{"pt":"Vosges e Alsácia","en":"Vosges and Alsace","es":"Vosgos y Alsacia","fr":"Vosges et Alsace","de":"Vogesen und Elsass"}',
    '{"Vosges","Alsace"}', '{6.20,47.40,8.25,49.10}'),
  ('FR', 'Córsega', '{"pt":"Córsega","en":"Corsica","es":"Córcega","fr":"Corse","de":"Korsika"}',
    '{"Corsica","Corse"}', '{8.50,41.30,9.60,43.05}'),
  ('FR', 'Normandia', '{"pt":"Normandia","en":"Normandy","es":"Normandía","fr":"Normandie","de":"Normandie"}',
    '{"Normandy","Normandie"}', '{-1.95,48.15,1.80,50.10}')
ON CONFLICT (country, route_region) DO NOTHING;

-- ------------------------------------------- normalise existing spellings
-- As the service role (auth.uid() IS NULL) the review guard leaves status alone.
UPDATE public.routes r
SET region = g.route_region
FROM public.regions g
WHERE r.country = g.country
  AND r.region IS DISTINCT FROM g.route_region
  AND lower(trim(r.region)) = ANY (SELECT lower(a) FROM unnest(g.aliases) a);
