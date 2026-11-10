/**
 * Destination landing pages (/[locale]/regions/[slug]). Each one lists the
 * published routes of a country or region, so search engines have a page for
 * queries like "rotas de moto no Algarve".
 */

import type { CountryCode } from './countries'

export type Locale = 'pt' | 'en' | 'es' | 'fr' | 'de'
type Text = Record<Locale, string>

export interface Region {
  slug: string
  country: CountryCode
  /** A whole country, or a region inside it */
  kind: 'country' | 'region'
  /** `routes.region` values that belong to this region (case-insensitive) */
  match: string[]
  name: Text
  intro: Text
}

export const REGIONS: Region[] = [
  {
    slug: 'portugal',
    country: 'PT',
    kind: 'country',
    match: [],
    name: { pt: 'Portugal', en: 'Portugal', es: 'Portugal', fr: 'Portugal', de: 'Portugal' },
    intro: {
      pt: 'Da Nacional 2 às serras do interior e às estradas da costa atlântica, Portugal tem algumas das melhores estradas de moto da Europa. Escolha a rota, veja as paradas e baixe o GPX grátis.',
      en: 'From the N2 to the inland mountain ranges and the Atlantic coast roads, Portugal has some of the best motorcycle roads in Europe. Pick a route, check the stops and download the GPX for free.',
      es: 'Desde la Nacional 2 hasta las sierras del interior y las carreteras de la costa atlántica, Portugal tiene algunas de las mejores carreteras para moto de Europa. Elige la ruta, mira las paradas y descarga el GPX gratis.',
      fr: "De la N2 aux montagnes de l'intérieur et aux routes de la côte atlantique, le Portugal offre certaines des plus belles routes moto d'Europe. Choisissez un itinéraire, découvrez les arrêts et téléchargez le GPX gratuitement.",
      de: 'Von der N2 über die Gebirge im Landesinneren bis zu den Küstenstraßen am Atlantik: Portugal hat einige der schönsten Motorradstraßen Europas. Route wählen, Stopps ansehen und GPX kostenlos herunterladen.',
    },
  },
  {
    slug: 'norte',
    country: 'PT',
    kind: 'region',
    match: ['Norte', 'Norte Portugal'],
    name: { pt: 'Norte de Portugal', en: 'Northern Portugal', es: 'Norte de Portugal', fr: 'Nord du Portugal', de: 'Nordportugal' },
    intro: {
      pt: 'O Douro vinhateiro, o Gerês e Trás-os-Montes concentram curvas sem fim, miradouros e vilas de pedra. É a região preferida para quem quer estrada de montanha a sério.',
      en: 'The Douro wine valley, Gerês and Trás-os-Montes pack endless bends, viewpoints and stone villages. The go-to region for proper mountain riding.',
      es: 'El valle del Duero, Gerês y Trás-os-Montes reúnen curvas sin fin, miradores y pueblos de piedra. La región favorita para carreteras de montaña de verdad.',
      fr: 'La vallée du Douro, le Gerês et le Trás-os-Montes enchaînent virages, belvédères et villages de pierre. La région idéale pour la vraie route de montagne.',
      de: 'Das Douro-Tal, Gerês und Trás-os-Montes bieten endlose Kurven, Aussichtspunkte und Steindörfer. Die Region für echtes Bergfahren.',
    },
  },
  {
    slug: 'centro',
    country: 'PT',
    kind: 'region',
    match: ['Centro'],
    name: { pt: 'Centro de Portugal', en: 'Central Portugal', es: 'Centro de Portugal', fr: 'Centre du Portugal', de: 'Zentralportugal' },
    intro: {
      pt: 'Serra da Estrela, aldeias do xisto e as estradas entre o interior e a costa da Prata. Subidas longas, asfalto bom e paisagem que muda a cada vale.',
      en: 'Serra da Estrela, the schist villages and the roads between the interior and the Silver Coast. Long climbs, good tarmac and scenery that changes with every valley.',
      es: 'Serra da Estrela, las aldeas de pizarra y las carreteras entre el interior y la costa de Prata. Subidas largas, buen asfalto y paisaje que cambia en cada valle.',
      fr: "Serra da Estrela, les villages de schiste et les routes entre l'intérieur et la Côte d'Argent. De longues montées, un bon bitume et des paysages qui changent à chaque vallée.",
      de: 'Serra da Estrela, die Schieferdörfer und die Straßen zwischen Hinterland und Silberküste. Lange Anstiege, guter Asphalt und Landschaft, die sich mit jedem Tal ändert.',
    },
  },
  {
    slug: 'lisboa',
    country: 'PT',
    kind: 'region',
    match: ['Lisboa'],
    name: { pt: 'Lisboa e arredores', en: 'Lisbon area', es: 'Lisboa y alrededores', fr: 'Lisbonne et environs', de: 'Lissabon und Umgebung' },
    intro: {
      pt: 'Sintra, Cascais e a Arrábida ficam a menos de uma hora de Lisboa e são perfeitas para um passeio de meio dia com vista para o mar.',
      en: 'Sintra, Cascais and Arrábida are under an hour from Lisbon and perfect for a half-day ride with sea views.',
      es: 'Sintra, Cascais y la Arrábida están a menos de una hora de Lisboa y son perfectas para una salida de media jornada con vistas al mar.',
      fr: "Sintra, Cascais et l'Arrábida sont à moins d'une heure de Lisbonne, parfaites pour une demi-journée avec vue sur la mer.",
      de: 'Sintra, Cascais und Arrábida liegen weniger als eine Stunde von Lissabon entfernt – ideal für eine Halbtagestour mit Meerblick.',
    },
  },
  {
    slug: 'alentejo',
    country: 'PT',
    kind: 'region',
    match: ['Alentejo'],
    name: { pt: 'Alentejo', en: 'Alentejo', es: 'Alentejo', fr: 'Alentejo', de: 'Alentejo' },
    intro: {
      pt: 'Planícies douradas, castelos no alto dos montes e o lago do Alqueva. Estradas calmas e retas longas, ideais para viajar sem pressa e comer bem.',
      en: 'Golden plains, hilltop castles and the Alqueva lake. Quiet roads and long straights, ideal for unhurried touring and great food.',
      es: 'Llanuras doradas, castillos en lo alto de los cerros y el lago de Alqueva. Carreteras tranquilas y rectas largas, ideales para viajar sin prisa y comer bien.',
      fr: "Plaines dorées, châteaux perchés et le lac d'Alqueva. Des routes calmes et de longues lignes droites, idéales pour voyager sans se presser et bien manger.",
      de: 'Goldene Ebenen, Burgen auf Hügeln und der Alqueva-Stausee. Ruhige Straßen und lange Geraden – perfekt zum entspannten Touren und gut Essen.',
    },
  },
  {
    slug: 'algarve',
    country: 'PT',
    kind: 'region',
    match: ['Algarve'],
    name: { pt: 'Algarve', en: 'Algarve', es: 'Algarve', fr: 'Algarve', de: 'Algarve' },
    intro: {
      pt: 'Além das praias, o Algarve tem a serra de Monchique e a Costa Vicentina, com curvas fechadas e o pôr do sol mais bonito do país.',
      en: 'Beyond the beaches, the Algarve has the Monchique hills and the Costa Vicentina, with tight bends and the best sunsets in the country.',
      es: 'Más allá de las playas, el Algarve tiene la sierra de Monchique y la Costa Vicentina, con curvas cerradas y las mejores puestas de sol del país.',
      fr: "Au-delà des plages, l'Algarve offre la serra de Monchique et la Costa Vicentina, avec des virages serrés et les plus beaux couchers de soleil du pays.",
      de: 'Neben den Stränden bietet die Algarve die Serra de Monchique und die Costa Vicentina – enge Kurven und die schönsten Sonnenuntergänge des Landes.',
    },
  },
  {
    slug: 'espanha',
    country: 'ES',
    kind: 'country',
    match: [],
    name: { pt: 'Espanha', en: 'Spain', es: 'España', fr: 'Espagne', de: 'Spanien' },
    intro: {
      pt: 'Dos Picos de Europa aos Pirenéus, da Andaluzia à Costa Brava: rotas de moto em Espanha testadas, com paradas e GPX grátis.',
      en: 'From the Picos de Europa to the Pyrenees, from Andalusia to the Costa Brava: tested motorcycle routes in Spain, with stops and free GPX.',
      es: 'De los Picos de Europa a los Pirineos, de Andalucía a la Costa Brava: rutas en moto por España probadas, con paradas y GPX gratis.',
      fr: "Des Picos de Europa aux Pyrénées, de l'Andalousie à la Costa Brava : des itinéraires moto en Espagne testés, avec arrêts et GPX gratuit.",
      de: 'Von den Picos de Europa bis zu den Pyrenäen, von Andalusien bis zur Costa Brava: getestete Motorradrouten in Spanien mit Stopps und kostenlosem GPX.',
    },
  },
  {
    slug: 'picos-de-europa',
    country: 'ES',
    kind: 'region',
    match: ['Picos de Europa', 'North Spain'],
    name: { pt: 'Picos de Europa', en: 'Picos de Europa', es: 'Picos de Europa', fr: 'Picos de Europa', de: 'Picos de Europa' },
    intro: {
      pt: 'Desfiladeiros, portos de montanha e aldeias entre as Astúrias, a Cantábria e Leão. Um dos destinos de moto mais famosos da Europa.',
      en: 'Gorges, mountain passes and villages between Asturias, Cantabria and León. One of the most famous motorcycle destinations in Europe.',
      es: 'Desfiladeros, puertos de montaña y pueblos entre Asturias, Cantabria y León. Uno de los destinos moteros más famosos de Europa.',
      fr: "Gorges, cols et villages entre les Asturies, la Cantabrie et León. L'une des destinations moto les plus célèbres d'Europe.",
      de: 'Schluchten, Pässe und Dörfer zwischen Asturien, Kantabrien und León. Eines der bekanntesten Motorradziele Europas.',
    },
  },
  {
    slug: 'pireneus',
    country: 'ES',
    kind: 'region',
    match: ['Pirenéus', 'Pirineos', 'Pyrenees'],
    name: { pt: 'Pirenéus', en: 'Pyrenees', es: 'Pirineos', fr: 'Pyrénées', de: 'Pyrenäen' },
    intro: {
      pt: 'Portos de alta montanha em Aragão e na Catalunha, vales verdes e estradas que sobem até a fronteira com França.',
      en: 'High mountain passes in Aragon and Catalonia, green valleys and roads that climb up to the French border.',
      es: 'Puertos de alta montaña en Aragón y Cataluña, valles verdes y carreteras que suben hasta la frontera con Francia.',
      fr: "Cols de haute montagne en Aragon et en Catalogne, vallées verdoyantes et routes qui montent jusqu'à la frontière française.",
      de: 'Hochgebirgspässe in Aragonien und Katalonien, grüne Täler und Straßen bis hinauf zur französischen Grenze.',
    },
  },
  {
    slug: 'andaluzia',
    country: 'ES',
    kind: 'region',
    match: ['Andaluzia', 'Andalucía', 'Andalusia'],
    name: { pt: 'Andaluzia', en: 'Andalusia', es: 'Andalucía', fr: 'Andalousie', de: 'Andalusien' },
    intro: {
      pt: 'Aldeias brancas, a Serra de Grazalema e as Alpujarras na Serra Nevada. Sol quase o ano inteiro e curvas para todos os gostos.',
      en: 'White villages, the Sierra de Grazalema and the Alpujarras in the Sierra Nevada. Sun almost all year round and bends for every taste.',
      es: 'Pueblos blancos, la Sierra de Grazalema y las Alpujarras en Sierra Nevada. Sol casi todo el año y curvas para todos los gustos.',
      fr: "Villages blancs, la Sierra de Grazalema et les Alpujarras dans la Sierra Nevada. Du soleil presque toute l'année et des virages pour tous les goûts.",
      de: 'Weiße Dörfer, die Sierra de Grazalema und die Alpujarras in der Sierra Nevada. Fast ganzjährig Sonne und Kurven für jeden Geschmack.',
    },
  },
  {
    slug: 'galiza',
    country: 'ES',
    kind: 'region',
    match: ['Galiza', 'Galicia'],
    name: { pt: 'Galiza', en: 'Galicia', es: 'Galicia', fr: 'Galice', de: 'Galicien' },
    intro: {
      pt: 'Falésias sobre o Atlântico, rias e estradas costeiras quase vazias, logo acima da fronteira com o Minho.',
      en: 'Cliffs over the Atlantic, rías and almost empty coastal roads, just north of the Portuguese border.',
      es: 'Acantilados sobre el Atlántico, rías y carreteras costeras casi vacías, justo al norte de la frontera con Portugal.',
      fr: "Falaises sur l'Atlantique, rias et routes côtières presque désertes, juste au nord de la frontière portugaise.",
      de: 'Klippen über dem Atlantik, Rías und fast leere Küstenstraßen, direkt nördlich der portugiesischen Grenze.',
    },
  },
  {
    slug: 'costa-brava',
    country: 'ES',
    kind: 'region',
    match: ['Costa Brava'],
    name: { pt: 'Costa Brava', en: 'Costa Brava', es: 'Costa Brava', fr: 'Costa Brava', de: 'Costa Brava' },
    intro: {
      pt: 'Curvas sobre o Mediterrâneo entre Lloret, Tossa e o Cap de Creus. Estradas estreitas, enseadas e vilas de pescadores.',
      en: 'Bends above the Mediterranean between Lloret, Tossa and Cap de Creus. Narrow roads, coves and fishing villages.',
      es: 'Curvas sobre el Mediterráneo entre Lloret, Tossa y el Cap de Creus. Carreteras estrechas, calas y pueblos de pescadores.',
      fr: 'Des virages au-dessus de la Méditerranée entre Lloret, Tossa et le Cap de Creus. Routes étroites, criques et villages de pêcheurs.',
      de: 'Kurven über dem Mittelmeer zwischen Lloret, Tossa und dem Cap de Creus. Schmale Straßen, Buchten und Fischerdörfer.',
    },
  },
  {
    slug: 'franca',
    country: 'FR',
    kind: 'country',
    match: [],
    name: { pt: 'França', en: 'France', es: 'Francia', fr: 'France', de: 'Frankreich' },
    intro: {
      pt: 'Dos grandes colos dos Alpes e dos Pirenéus às gargantas da Provença, aos vulcões da Auvergne e às estradas da Córsega: rotas de moto em França com paradas e GPX grátis.',
      en: 'From the great passes of the Alps and the Pyrenees to the gorges of Provence, the Auvergne volcanoes and the roads of Corsica: motorcycle routes in France with stops and free GPX.',
      es: 'De los grandes puertos de los Alpes y los Pirineos a las gargantas de la Provenza, los volcanes de Auvernia y las carreteras de Córcega: rutas en moto por Francia con paradas y GPX gratis.',
      fr: "Des grands cols des Alpes et des Pyrénées aux gorges de Provence, des volcans d'Auvergne aux routes de Corse : des itinéraires moto en France avec arrêts et GPX gratuit.",
      de: 'Von den großen Pässen der Alpen und Pyrenäen über die Schluchten der Provence und die Vulkane der Auvergne bis zu den Straßen Korsikas: Motorradrouten in Frankreich mit Stopps und kostenlosem GPX.',
    },
  },
  {
    slug: 'alpes-franceses',
    country: 'FR',
    kind: 'region',
    match: ['Alpes', 'Alps'],
    name: { pt: 'Alpes franceses', en: 'French Alps', es: 'Alpes franceses', fr: 'Alpes françaises', de: 'Französische Alpen' },
    intro: {
      pt: 'Iseran, Galibier, Izoard e Bonette: os colos mais altos da Europa, ligados pela Route des Grandes Alpes. Abertos normalmente de junho a outubro.',
      en: 'Iseran, Galibier, Izoard and Bonette: the highest passes in Europe, linked by the Route des Grandes Alpes. Usually open from June to October.',
      es: 'Iseran, Galibier, Izoard y Bonette: los puertos más altos de Europa, unidos por la Route des Grandes Alpes. Normalmente abiertos de junio a octubre.',
      fr: "Iseran, Galibier, Izoard et Bonette : les plus hauts cols d'Europe, reliés par la route des Grandes Alpes. Généralement ouverts de juin à octobre.",
      de: 'Iseran, Galibier, Izoard und Bonette: die höchsten Pässe Europas, verbunden durch die Route des Grandes Alpes. Meist von Juni bis Oktober geöffnet.',
    },
  },
  {
    slug: 'provenca',
    country: 'FR',
    kind: 'region',
    match: ['Provença', 'Provence'],
    name: { pt: 'Provença e Côte d’Azur', en: 'Provence and the Riviera', es: 'Provenza y Costa Azul', fr: "Provence et Côte d'Azur", de: 'Provence und Côte d’Azur' },
    intro: {
      pt: 'As Gorges du Verdon, o Mont Ventoux, a Route Napoléon e os colos por cima de Nice. Sol, curvas e lavanda, com o Mediterrâneo sempre perto.',
      en: 'The Gorges du Verdon, Mont Ventoux, the Route Napoléon and the passes above Nice. Sun, bends and lavender, with the Mediterranean always close.',
      es: 'Las Gorges du Verdon, el Mont Ventoux, la Route Napoléon y los puertos sobre Niza. Sol, curvas y lavanda, con el Mediterráneo siempre cerca.',
      fr: 'Les gorges du Verdon, le mont Ventoux, la route Napoléon et les cols au-dessus de Nice. Du soleil, des virages et de la lavande, avec la Méditerranée toujours proche.',
      de: 'Die Gorges du Verdon, der Mont Ventoux, die Route Napoléon und die Pässe oberhalb von Nizza. Sonne, Kurven und Lavendel, das Mittelmeer immer in der Nähe.',
    },
  },
  {
    slug: 'pireneus-franceses',
    country: 'FR',
    kind: 'region',
    match: ['Pirenéus', 'Pirineos', 'Pyrenees', 'Pyrénées'],
    name: { pt: 'Pirenéus franceses', en: 'French Pyrenees', es: 'Pirineo francés', fr: 'Pyrénées françaises', de: 'Französische Pyrenäen' },
    intro: {
      pt: 'Tourmalet, Aubisque, Aspin e Peyresourde: os colos do Tour de France, com prados, vacas soltas e estradas cortadas na rocha.',
      en: 'Tourmalet, Aubisque, Aspin and Peyresourde: the Tour de France passes, with meadows, free-roaming cows and roads cut into the rock.',
      es: 'Tourmalet, Aubisque, Aspin y Peyresourde: los puertos del Tour de Francia, con prados, vacas sueltas y carreteras talladas en la roca.',
      fr: 'Tourmalet, Aubisque, Aspin et Peyresourde : les cols du Tour de France, avec prairies, vaches en liberté et routes taillées dans la roche.',
      de: 'Tourmalet, Aubisque, Aspin und Peyresourde: die Pässe der Tour de France mit Wiesen, frei laufenden Kühen und in den Fels gehauenen Straßen.',
    },
  },
  {
    slug: 'macico-central',
    country: 'FR',
    kind: 'region',
    match: ['Maciço Central', 'Massif Central'],
    name: { pt: 'Maciço Central', en: 'Massif Central', es: 'Macizo Central', fr: 'Massif central', de: 'Zentralmassiv' },
    intro: {
      pt: 'Os vulcões da Auvergne e as gargantas do Tarn e da Ardèche: estradas vazias, paisagem verde e algumas das curvas mais bonitas de França longe da multidão.',
      en: 'The Auvergne volcanoes and the Tarn and Ardèche gorges: empty roads, green landscapes and some of the finest bends in France, away from the crowds.',
      es: 'Los volcanes de Auvernia y las gargantas del Tarn y del Ardèche: carreteras vacías, paisaje verde y algunas de las curvas más bonitas de Francia lejos de las multitudes.',
      fr: "Les volcans d'Auvergne et les gorges du Tarn et de l'Ardèche : des routes désertes, des paysages verts et certains des plus beaux virages de France, loin de la foule.",
      de: 'Die Vulkane der Auvergne und die Schluchten von Tarn und Ardèche: leere Straßen, grüne Landschaft und einige der schönsten Kurven Frankreichs, abseits der Massen.',
    },
  },
  {
    slug: 'vosges-alsacia',
    country: 'FR',
    kind: 'region',
    match: ['Vosges e Alsácia', 'Vosges', 'Alsace'],
    name: { pt: 'Vosges e Alsácia', en: 'Vosges and Alsace', es: 'Vosgos y Alsacia', fr: 'Vosges et Alsace', de: 'Vogesen und Elsass' },
    intro: {
      pt: 'A Route des Crêtes pelo cume dos Vosges e a Rota dos Vinhos entre aldeias de enxaimel. Perto da Alemanha e da Suíça.',
      en: 'The Route des Crêtes along the ridge of the Vosges and the Wine Route through half-timbered villages. Close to Germany and Switzerland.',
      es: 'La Route des Crêtes por la cresta de los Vosgos y la Ruta del Vino entre pueblos de entramado de madera. Cerca de Alemania y Suiza.',
      fr: "La route des Crêtes sur la ligne de crête des Vosges et la route des Vins entre villages à colombages. À deux pas de l'Allemagne et de la Suisse.",
      de: 'Die Route des Crêtes auf dem Vogesenkamm und die Weinstraße durch Fachwerkdörfer. Nahe an Deutschland und der Schweiz.',
    },
  },
  {
    slug: 'corsega',
    country: 'FR',
    kind: 'region',
    match: ['Córsega', 'Corsica', 'Corse'],
    name: { pt: 'Córsega', en: 'Corsica', es: 'Córcega', fr: 'Corse', de: 'Korsika' },
    intro: {
      pt: 'A "ilha da beleza": falésias de granito vermelho, colos entre pinheiros e estradas costeiras estreitas onde nunca há uma reta.',
      en: 'The "island of beauty": red granite cliffs, passes through pine forests and narrow coastal roads without a single straight.',
      es: 'La "isla de la belleza": acantilados de granito rojo, puertos entre pinos y carreteras costeras estrechas donde nunca hay una recta.',
      fr: "L'« île de Beauté » : falaises de granit rouge, cols au milieu des pins et routes côtières étroites où il n'y a jamais une ligne droite.",
      de: 'Die „Insel der Schönheit“: rote Granitklippen, Pässe durch Kiefernwälder und schmale Küstenstraßen ohne eine einzige Gerade.',
    },
  },
]

export function getRegion(slug: string) {
  return REGIONS.find((r) => r.slug === slug)
}

export function textFor(text: Text, locale: string) {
  return text[(locale as Locale)] ?? text.en
}

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase()

/** Does a route belong to this region/country page? */
export function routeInRegion(
  route: { country: string | null; region: string | null },
  region: Region,
) {
  if (region.kind === 'country') return route.country === region.country
  return route.country === region.country && region.match.some((m) => norm(m) === norm(route.region))
}

/** Region page a route belongs to (most specific first) */
export function regionForRoute(route: { country: string | null; region: string | null }) {
  return (
    REGIONS.find((r) => r.kind === 'region' && routeInRegion(route, r)) ??
    REGIONS.find((r) => r.kind === 'country' && routeInRegion(route, r))
  )
}

/** Region name in the page's language (the raw routes.region when it has no page) */
export function regionLabel(route: { country: string | null; region: string | null }, locale: string) {
  const region = REGIONS.find((r) => r.kind === 'region' && routeInRegion(route, r))
  return region ? textFor(region.name, locale) : route.region
}
