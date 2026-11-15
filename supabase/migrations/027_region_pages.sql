-- 027: Destination pages from the regions/countries tables
--
-- /regions and /regions/<slug> used the hard-coded list in lib/regions.ts, so a
-- region a curator added in the submit wizard had no page. The page data now
-- lives next to the region:
--   slug        URL of the page (/regions/<slug>), shared by countries and
--               regions; generated on insert when not given, never changed
--               afterwards so links keep working
--   intro       {pt,en,es,fr,de} paragraph under the title (optional)
--   sort_order  order on the /regions index (new rows go last)
--
-- Backfilled from lib/regions.ts so every existing URL stays the same.

ALTER TABLE public.countries
  ADD COLUMN IF NOT EXISTS slug       TEXT,
  ADD COLUMN IF NOT EXISTS intro      JSONB,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1000;

ALTER TABLE public.regions
  ADD COLUMN IF NOT EXISTS slug       TEXT,
  ADD COLUMN IF NOT EXISTS intro      JSONB,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1000;

-- ------------------------------------------------------------------- slugs
-- "Vosges e Alsácia" -> "vosges-e-alsacia"
CREATE OR REPLACE FUNCTION public.place_slug(input TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(BOTH '-' FROM regexp_replace(
    translate(
      replace(replace(replace(lower(coalesce(input, '')), 'œ', 'oe'), 'æ', 'ae'), 'ß', 'ss'),
      'áàâãäåāçćčéèêëēęíìîïīñńóòôõöøōúùûüūýÿž',
      'aaaaaaaccceeeeeeiiiiinnoooooooouuuuuyyz'
    ),
    '[^a-z0-9]+', '-', 'g'
  ))
$$;

-- First free slug among countries and regions: base, base-<country>, base-2...
CREATE OR REPLACE FUNCTION public.unique_place_slug(base TEXT, country TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
SET search_path = public
AS $$
DECLARE
  root TEXT := coalesce(nullif(base, ''), 'regiao');
  candidate TEXT := root;
  n INTEGER := 1;
BEGIN
  WHILE EXISTS (SELECT 1 FROM regions WHERE slug = candidate)
     OR EXISTS (SELECT 1 FROM countries WHERE slug = candidate) LOOP
    n := n + 1;
    IF n = 2 AND country IS NOT NULL THEN
      candidate := root || '-' || lower(country);
    ELSE
      candidate := root || '-' || n;
    END IF;
  END LOOP;
  RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_region_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(NEW.slug, '') = '' THEN
    NEW.slug := unique_place_slug(place_slug(NEW.route_region), NEW.country);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_country_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF coalesce(NEW.slug, '') = '' THEN
    NEW.slug := unique_place_slug(place_slug(coalesce(NEW.name->>'pt', NEW.name->>'en', NEW.code)));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_regions_slug ON public.regions;
CREATE TRIGGER trigger_regions_slug
  BEFORE INSERT ON public.regions FOR EACH ROW EXECUTE FUNCTION public.set_region_slug();
DROP TRIGGER IF EXISTS trigger_countries_slug ON public.countries;
CREATE TRIGGER trigger_countries_slug
  BEFORE INSERT ON public.countries FOR EACH ROW EXECUTE FUNCTION public.set_country_slug();

-- ----------------------------------------------- backfill (lib/regions.ts)
UPDATE public.countries SET slug = 'portugal', sort_order = 10, intro = '{"pt":"Da Nacional 2 às serras do interior e às estradas da costa atlântica, Portugal tem algumas das melhores estradas de moto da Europa. Escolha a rota, veja as paradas e baixe o GPX grátis.","en":"From the N2 to the inland mountain ranges and the Atlantic coast roads, Portugal has some of the best motorcycle roads in Europe. Pick a route, check the stops and download the GPX for free.","es":"Desde la Nacional 2 hasta las sierras del interior y las carreteras de la costa atlántica, Portugal tiene algunas de las mejores carreteras para moto de Europa. Elige la ruta, mira las paradas y descarga el GPX gratis.","fr":"De la N2 aux montagnes de l''intérieur et aux routes de la côte atlantique, le Portugal offre certaines des plus belles routes moto d''Europe. Choisissez un itinéraire, découvrez les arrêts et téléchargez le GPX gratuitement.","de":"Von der N2 über die Gebirge im Landesinneren bis zu den Küstenstraßen am Atlantik: Portugal hat einige der schönsten Motorradstraßen Europas. Route wählen, Stopps ansehen und GPX kostenlos herunterladen."}'::jsonb
  WHERE code = 'PT';
UPDATE public.regions SET slug = 'norte', sort_order = 10, intro = '{"pt":"O Douro vinhateiro, o Gerês e Trás-os-Montes concentram curvas sem fim, miradouros e vilas de pedra. É a região preferida para quem quer estrada de montanha a sério.","en":"The Douro wine valley, Gerês and Trás-os-Montes pack endless bends, viewpoints and stone villages. The go-to region for proper mountain riding.","es":"El valle del Duero, Gerês y Trás-os-Montes reúnen curvas sin fin, miradores y pueblos de piedra. La región favorita para carreteras de montaña de verdad.","fr":"La vallée du Douro, le Gerês et le Trás-os-Montes enchaînent virages, belvédères et villages de pierre. La région idéale pour la vraie route de montagne.","de":"Das Douro-Tal, Gerês und Trás-os-Montes bieten endlose Kurven, Aussichtspunkte und Steindörfer. Die Region für echtes Bergfahren."}'::jsonb
  WHERE country = 'PT' AND route_region = 'Norte';
UPDATE public.regions SET slug = 'centro', sort_order = 20, intro = '{"pt":"Serra da Estrela, aldeias do xisto e as estradas entre o interior e a costa da Prata. Subidas longas, asfalto bom e paisagem que muda a cada vale.","en":"Serra da Estrela, the schist villages and the roads between the interior and the Silver Coast. Long climbs, good tarmac and scenery that changes with every valley.","es":"Serra da Estrela, las aldeas de pizarra y las carreteras entre el interior y la costa de Prata. Subidas largas, buen asfalto y paisaje que cambia en cada valle.","fr":"Serra da Estrela, les villages de schiste et les routes entre l''intérieur et la Côte d''Argent. De longues montées, un bon bitume et des paysages qui changent à chaque vallée.","de":"Serra da Estrela, die Schieferdörfer und die Straßen zwischen Hinterland und Silberküste. Lange Anstiege, guter Asphalt und Landschaft, die sich mit jedem Tal ändert."}'::jsonb
  WHERE country = 'PT' AND route_region = 'Centro';
UPDATE public.regions SET slug = 'lisboa', sort_order = 30, intro = '{"pt":"Sintra, Cascais e a Arrábida ficam a menos de uma hora de Lisboa e são perfeitas para um passeio de meio dia com vista para o mar.","en":"Sintra, Cascais and Arrábida are under an hour from Lisbon and perfect for a half-day ride with sea views.","es":"Sintra, Cascais y la Arrábida están a menos de una hora de Lisboa y son perfectas para una salida de media jornada con vistas al mar.","fr":"Sintra, Cascais et l''Arrábida sont à moins d''une heure de Lisbonne, parfaites pour une demi-journée avec vue sur la mer.","de":"Sintra, Cascais und Arrábida liegen weniger als eine Stunde von Lissabon entfernt – ideal für eine Halbtagestour mit Meerblick."}'::jsonb
  WHERE country = 'PT' AND route_region = 'Lisboa';
UPDATE public.regions SET slug = 'alentejo', sort_order = 40, intro = '{"pt":"Planícies douradas, castelos no alto dos montes e o lago do Alqueva. Estradas calmas e retas longas, ideais para viajar sem pressa e comer bem.","en":"Golden plains, hilltop castles and the Alqueva lake. Quiet roads and long straights, ideal for unhurried touring and great food.","es":"Llanuras doradas, castillos en lo alto de los cerros y el lago de Alqueva. Carreteras tranquilas y rectas largas, ideales para viajar sin prisa y comer bien.","fr":"Plaines dorées, châteaux perchés et le lac d''Alqueva. Des routes calmes et de longues lignes droites, idéales pour voyager sans se presser et bien manger.","de":"Goldene Ebenen, Burgen auf Hügeln und der Alqueva-Stausee. Ruhige Straßen und lange Geraden – perfekt zum entspannten Touren und gut Essen."}'::jsonb
  WHERE country = 'PT' AND route_region = 'Alentejo';
UPDATE public.regions SET slug = 'algarve', sort_order = 50, intro = '{"pt":"Além das praias, o Algarve tem a serra de Monchique e a Costa Vicentina, com curvas fechadas e o pôr do sol mais bonito do país.","en":"Beyond the beaches, the Algarve has the Monchique hills and the Costa Vicentina, with tight bends and the best sunsets in the country.","es":"Más allá de las playas, el Algarve tiene la sierra de Monchique y la Costa Vicentina, con curvas cerradas y las mejores puestas de sol del país.","fr":"Au-delà des plages, l''Algarve offre la serra de Monchique et la Costa Vicentina, avec des virages serrés et les plus beaux couchers de soleil du pays.","de":"Neben den Stränden bietet die Algarve die Serra de Monchique und die Costa Vicentina – enge Kurven und die schönsten Sonnenuntergänge des Landes."}'::jsonb
  WHERE country = 'PT' AND route_region = 'Algarve';
UPDATE public.countries SET slug = 'espanha', sort_order = 20, intro = '{"pt":"Dos Picos de Europa aos Pirenéus, da Andaluzia à Costa Brava: rotas de moto em Espanha testadas, com paradas e GPX grátis.","en":"From the Picos de Europa to the Pyrenees, from Andalusia to the Costa Brava: tested motorcycle routes in Spain, with stops and free GPX.","es":"De los Picos de Europa a los Pirineos, de Andalucía a la Costa Brava: rutas en moto por España probadas, con paradas y GPX gratis.","fr":"Des Picos de Europa aux Pyrénées, de l''Andalousie à la Costa Brava : des itinéraires moto en Espagne testés, avec arrêts et GPX gratuit.","de":"Von den Picos de Europa bis zu den Pyrenäen, von Andalusien bis zur Costa Brava: getestete Motorradrouten in Spanien mit Stopps und kostenlosem GPX."}'::jsonb
  WHERE code = 'ES';
UPDATE public.regions SET slug = 'picos-de-europa', sort_order = 10, intro = '{"pt":"Desfiladeiros, portos de montanha e aldeias entre as Astúrias, a Cantábria e Leão. Um dos destinos de moto mais famosos da Europa.","en":"Gorges, mountain passes and villages between Asturias, Cantabria and León. One of the most famous motorcycle destinations in Europe.","es":"Desfiladeros, puertos de montaña y pueblos entre Asturias, Cantabria y León. Uno de los destinos moteros más famosos de Europa.","fr":"Gorges, cols et villages entre les Asturies, la Cantabrie et León. L''une des destinations moto les plus célèbres d''Europe.","de":"Schluchten, Pässe und Dörfer zwischen Asturien, Kantabrien und León. Eines der bekanntesten Motorradziele Europas."}'::jsonb
  WHERE country = 'ES' AND route_region = 'Picos de Europa';
UPDATE public.regions SET slug = 'pireneus', sort_order = 20, intro = '{"pt":"Portos de alta montanha em Aragão e na Catalunha, vales verdes e estradas que sobem até a fronteira com França.","en":"High mountain passes in Aragon and Catalonia, green valleys and roads that climb up to the French border.","es":"Puertos de alta montaña en Aragón y Cataluña, valles verdes y carreteras que suben hasta la frontera con Francia.","fr":"Cols de haute montagne en Aragon et en Catalogne, vallées verdoyantes et routes qui montent jusqu''à la frontière française.","de":"Hochgebirgspässe in Aragonien und Katalonien, grüne Täler und Straßen bis hinauf zur französischen Grenze."}'::jsonb
  WHERE country = 'ES' AND route_region = 'Pirenéus';
UPDATE public.regions SET slug = 'andaluzia', sort_order = 30, intro = '{"pt":"Aldeias brancas, a Serra de Grazalema e as Alpujarras na Serra Nevada. Sol quase o ano inteiro e curvas para todos os gostos.","en":"White villages, the Sierra de Grazalema and the Alpujarras in the Sierra Nevada. Sun almost all year round and bends for every taste.","es":"Pueblos blancos, la Sierra de Grazalema y las Alpujarras en Sierra Nevada. Sol casi todo el año y curvas para todos los gustos.","fr":"Villages blancs, la Sierra de Grazalema et les Alpujarras dans la Sierra Nevada. Du soleil presque toute l''année et des virages pour tous les goûts.","de":"Weiße Dörfer, die Sierra de Grazalema und die Alpujarras in der Sierra Nevada. Fast ganzjährig Sonne und Kurven für jeden Geschmack."}'::jsonb
  WHERE country = 'ES' AND route_region = 'Andaluzia';
UPDATE public.regions SET slug = 'galiza', sort_order = 40, intro = '{"pt":"Falésias sobre o Atlântico, rias e estradas costeiras quase vazias, logo acima da fronteira com o Minho.","en":"Cliffs over the Atlantic, rías and almost empty coastal roads, just north of the Portuguese border.","es":"Acantilados sobre el Atlántico, rías y carreteras costeras casi vacías, justo al norte de la frontera con Portugal.","fr":"Falaises sur l''Atlantique, rias et routes côtières presque désertes, juste au nord de la frontière portugaise.","de":"Klippen über dem Atlantik, Rías und fast leere Küstenstraßen, direkt nördlich der portugiesischen Grenze."}'::jsonb
  WHERE country = 'ES' AND route_region = 'Galiza';
UPDATE public.regions SET slug = 'costa-brava', sort_order = 50, intro = '{"pt":"Curvas sobre o Mediterrâneo entre Lloret, Tossa e o Cap de Creus. Estradas estreitas, enseadas e vilas de pescadores.","en":"Bends above the Mediterranean between Lloret, Tossa and Cap de Creus. Narrow roads, coves and fishing villages.","es":"Curvas sobre el Mediterráneo entre Lloret, Tossa y el Cap de Creus. Carreteras estrechas, calas y pueblos de pescadores.","fr":"Des virages au-dessus de la Méditerranée entre Lloret, Tossa et le Cap de Creus. Routes étroites, criques et villages de pêcheurs.","de":"Kurven über dem Mittelmeer zwischen Lloret, Tossa und dem Cap de Creus. Schmale Straßen, Buchten und Fischerdörfer."}'::jsonb
  WHERE country = 'ES' AND route_region = 'Costa Brava';
UPDATE public.countries SET slug = 'franca', sort_order = 30, intro = '{"pt":"Dos grandes colos dos Alpes e dos Pirenéus às gargantas da Provença, aos vulcões da Auvergne e às estradas da Córsega: rotas de moto em França com paradas e GPX grátis.","en":"From the great passes of the Alps and the Pyrenees to the gorges of Provence, the Auvergne volcanoes and the roads of Corsica: motorcycle routes in France with stops and free GPX.","es":"De los grandes puertos de los Alpes y los Pirineos a las gargantas de la Provenza, los volcanes de Auvernia y las carreteras de Córcega: rutas en moto por Francia con paradas y GPX gratis.","fr":"Des grands cols des Alpes et des Pyrénées aux gorges de Provence, des volcans d''Auvergne aux routes de Corse : des itinéraires moto en France avec arrêts et GPX gratuit.","de":"Von den großen Pässen der Alpen und Pyrenäen über die Schluchten der Provence und die Vulkane der Auvergne bis zu den Straßen Korsikas: Motorradrouten in Frankreich mit Stopps und kostenlosem GPX."}'::jsonb
  WHERE code = 'FR';
UPDATE public.regions SET slug = 'alpes-franceses', sort_order = 10, intro = '{"pt":"Iseran, Galibier, Izoard e Bonette: os colos mais altos da Europa, ligados pela Route des Grandes Alpes. Abertos normalmente de junho a outubro.","en":"Iseran, Galibier, Izoard and Bonette: the highest passes in Europe, linked by the Route des Grandes Alpes. Usually open from June to October.","es":"Iseran, Galibier, Izoard y Bonette: los puertos más altos de Europa, unidos por la Route des Grandes Alpes. Normalmente abiertos de junio a octubre.","fr":"Iseran, Galibier, Izoard et Bonette : les plus hauts cols d''Europe, reliés par la route des Grandes Alpes. Généralement ouverts de juin à octobre.","de":"Iseran, Galibier, Izoard und Bonette: die höchsten Pässe Europas, verbunden durch die Route des Grandes Alpes. Meist von Juni bis Oktober geöffnet."}'::jsonb
  WHERE country = 'FR' AND route_region = 'Alpes';
UPDATE public.regions SET slug = 'provenca', sort_order = 20, intro = '{"pt":"As Gorges du Verdon, o Mont Ventoux, a Route Napoléon e os colos por cima de Nice. Sol, curvas e lavanda, com o Mediterrâneo sempre perto.","en":"The Gorges du Verdon, Mont Ventoux, the Route Napoléon and the passes above Nice. Sun, bends and lavender, with the Mediterranean always close.","es":"Las Gorges du Verdon, el Mont Ventoux, la Route Napoléon y los puertos sobre Niza. Sol, curvas y lavanda, con el Mediterráneo siempre cerca.","fr":"Les gorges du Verdon, le mont Ventoux, la route Napoléon et les cols au-dessus de Nice. Du soleil, des virages et de la lavande, avec la Méditerranée toujours proche.","de":"Die Gorges du Verdon, der Mont Ventoux, die Route Napoléon und die Pässe oberhalb von Nizza. Sonne, Kurven und Lavendel, das Mittelmeer immer in der Nähe."}'::jsonb
  WHERE country = 'FR' AND route_region = 'Provença';
UPDATE public.regions SET slug = 'pireneus-franceses', sort_order = 30, intro = '{"pt":"Tourmalet, Aubisque, Aspin e Peyresourde: os colos do Tour de France, com prados, vacas soltas e estradas cortadas na rocha.","en":"Tourmalet, Aubisque, Aspin and Peyresourde: the Tour de France passes, with meadows, free-roaming cows and roads cut into the rock.","es":"Tourmalet, Aubisque, Aspin y Peyresourde: los puertos del Tour de Francia, con prados, vacas sueltas y carreteras talladas en la roca.","fr":"Tourmalet, Aubisque, Aspin et Peyresourde : les cols du Tour de France, avec prairies, vaches en liberté et routes taillées dans la roche.","de":"Tourmalet, Aubisque, Aspin und Peyresourde: die Pässe der Tour de France mit Wiesen, frei laufenden Kühen und in den Fels gehauenen Straßen."}'::jsonb
  WHERE country = 'FR' AND route_region = 'Pirenéus';
UPDATE public.regions SET slug = 'macico-central', sort_order = 40, intro = '{"pt":"Os vulcões da Auvergne e as gargantas do Tarn e da Ardèche: estradas vazias, paisagem verde e algumas das curvas mais bonitas de França longe da multidão.","en":"The Auvergne volcanoes and the Tarn and Ardèche gorges: empty roads, green landscapes and some of the finest bends in France, away from the crowds.","es":"Los volcanes de Auvernia y las gargantas del Tarn y del Ardèche: carreteras vacías, paisaje verde y algunas de las curvas más bonitas de Francia lejos de las multitudes.","fr":"Les volcans d''Auvergne et les gorges du Tarn et de l''Ardèche : des routes désertes, des paysages verts et certains des plus beaux virages de France, loin de la foule.","de":"Die Vulkane der Auvergne und die Schluchten von Tarn und Ardèche: leere Straßen, grüne Landschaft und einige der schönsten Kurven Frankreichs, abseits der Massen."}'::jsonb
  WHERE country = 'FR' AND route_region = 'Maciço Central';
UPDATE public.regions SET slug = 'vosges-alsacia', sort_order = 50, intro = '{"pt":"A Route des Crêtes pelo cume dos Vosges e a Rota dos Vinhos entre aldeias de enxaimel. Perto da Alemanha e da Suíça.","en":"The Route des Crêtes along the ridge of the Vosges and the Wine Route through half-timbered villages. Close to Germany and Switzerland.","es":"La Route des Crêtes por la cresta de los Vosgos y la Ruta del Vino entre pueblos de entramado de madera. Cerca de Alemania y Suiza.","fr":"La route des Crêtes sur la ligne de crête des Vosges et la route des Vins entre villages à colombages. À deux pas de l''Allemagne et de la Suisse.","de":"Die Route des Crêtes auf dem Vogesenkamm und die Weinstraße durch Fachwerkdörfer. Nahe an Deutschland und der Schweiz."}'::jsonb
  WHERE country = 'FR' AND route_region = 'Vosges e Alsácia';
UPDATE public.regions SET slug = 'corsega', sort_order = 60, intro = '{"pt":"A \"ilha da beleza\": falésias de granito vermelho, colos entre pinheiros e estradas costeiras estreitas onde nunca há uma reta.","en":"The \"island of beauty\": red granite cliffs, passes through pine forests and narrow coastal roads without a single straight.","es":"La \"isla de la belleza\": acantilados de granito rojo, puertos entre pinos y carreteras costeras estrechas donde nunca hay una recta.","fr":"L''« île de Beauté » : falaises de granit rouge, cols au milieu des pins et routes côtières étroites où il n''y a jamais une ligne droite.","de":"Die „Insel der Schönheit“: rote Granitklippen, Pässe durch Kiefernwälder und schmale Küstenstraßen ohne eine einzige Gerade."}'::jsonb
  WHERE country = 'FR' AND route_region = 'Córsega';

-- Normandia had no page yet
UPDATE public.regions SET slug = 'normandia', sort_order = 70, intro = '{"pt":"As falésias de Étretat, as praias do Desembarque e o Mont-Saint-Michel no horizonte. Estradas calmas entre pomares de maçã, vilas de enxaimel e queijarias, perfeitas para viajar sem pressa.","en":"The Étretat cliffs, the D-Day beaches and Mont-Saint-Michel on the horizon. Quiet roads through apple orchards, half-timbered towns and cheese farms, perfect for unhurried touring.","es":"Los acantilados de Étretat, las playas del Desembarco y el Mont-Saint-Michel en el horizonte. Carreteras tranquilas entre manzanos, pueblos de entramado de madera y queserías, perfectas para viajar sin prisa.","fr":"Les falaises d''Étretat, les plages du Débarquement et le Mont-Saint-Michel à l''horizon. Des routes tranquilles entre vergers, villages à colombages et fromageries, idéales pour voyager sans se presser.","de":"Die Klippen von Étretat, die Strände der Landung und der Mont-Saint-Michel am Horizont. Ruhige Straßen durch Apfelplantagen, Fachwerkstädtchen und Käsereien – ideal zum entspannten Touren."}'::jsonb
  WHERE country = 'FR' AND route_region = 'Normandia' AND slug IS NULL;

-- Anything else (countries or regions staff added since 025)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT code, name FROM public.countries WHERE slug IS NULL ORDER BY created_at LOOP
    UPDATE public.countries
    SET slug = public.unique_place_slug(public.place_slug(coalesce(r.name->>'pt', r.name->>'en', r.code)))
    WHERE code = r.code;
  END LOOP;
  FOR r IN SELECT id, country, route_region FROM public.regions WHERE slug IS NULL ORDER BY created_at LOOP
    UPDATE public.regions
    SET slug = public.unique_place_slug(public.place_slug(r.route_region), r.country)
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- -------------------------------------------------------------- constraints
ALTER TABLE public.countries ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.regions ALTER COLUMN slug SET NOT NULL;

ALTER TABLE public.countries DROP CONSTRAINT IF EXISTS countries_slug_key;
ALTER TABLE public.countries ADD CONSTRAINT countries_slug_key UNIQUE (slug);
ALTER TABLE public.regions DROP CONSTRAINT IF EXISTS regions_slug_key;
ALTER TABLE public.regions ADD CONSTRAINT regions_slug_key UNIQUE (slug);

ALTER TABLE public.countries DROP CONSTRAINT IF EXISTS countries_slug_format;
ALTER TABLE public.countries ADD CONSTRAINT countries_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE public.regions DROP CONSTRAINT IF EXISTS regions_slug_format;
ALTER TABLE public.regions ADD CONSTRAINT regions_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
