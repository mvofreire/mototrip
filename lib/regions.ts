/**
 * Destination landing pages (/[locale]/regions/[slug]). Each one lists the
 * published routes of a country or region, so search engines have a page for
 * queries like "rotas de moto no Algarve".
 */

export type Locale = 'pt' | 'en' | 'es' | 'fr' | 'de'
type Text = Record<Locale, string>

export interface Region {
  slug: string
  country: 'PT' | 'ES'
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
