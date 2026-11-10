/**
 * Curated motorcycle routes in Portugal.
 *
 * Waypoints are [lat, lng] and force the router onto the intended roads.
 * Geometry, distance, duration and elevation are computed by
 * jobs/import_curated_routes.ts — they are not stored here.
 */

export type StopType =
  | 'viewpoint'
  | 'cafe'
  | 'gas_station'
  | 'restaurant'
  | 'landmark'
  | 'accommodation';

export type TranslationLocale = 'en' | 'es' | 'fr' | 'de';

export interface CuratedStop {
  name: string;
  description: string;
  type: StopType;
  lat: number;
  lng: number;
  /** Stored in route_stops.translations (name falls back to the original) */
  i18n?: Partial<Record<TranslationLocale, { name?: string; description: string }>>;
}

export interface CuratedRoute {
  title: string;
  description: string;
  region:
    | 'Norte' | 'Centro' | 'Lisboa' | 'Alentejo' | 'Algarve' // PT
    | 'Picos de Europa' | 'Pirenéus' | 'Andaluzia' | 'Galiza' | 'Costa Brava' // ES (+ Pirenéus FR)
    | 'Alpes' | 'Provença' | 'Maciço Central' | 'Vosges e Alsácia' | 'Córsega' | 'Normandia'; // FR
  category: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure';
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  route_type: 'loop' | 'out_and_back';
  scenic_score: number;
  road_quality_score: number;
  fun_factor_score: number;
  featured?: boolean;
  waypoints: Array<[number, number]>;
  stops: CuratedStop[];
  /** Stored in routes.translations (title falls back to the original) */
  i18n?: Partial<Record<TranslationLocale, { title?: string; description: string }>>;
}

export const CURATED_ROUTES_PT: CuratedRoute[] = [
  // ───────────────────────────── NORTE ─────────────────────────────
  {
    title: 'N222 | Peso da Régua > Pinhão > São João da Pesqueira',
    description:
      'Considerada uma das melhores estradas do mundo para conduzir, a N222 acompanha o rio Douro pela margem sul entre socalcos de vinha classificados pela UNESCO. Curvas constantes e bem desenhadas, asfalto em bom estado e vistas para o rio em quase todo o percurso. Depois do Pinhão, a estrada sobe até São João da Pesqueira com miradouros sobre todo o vale.',
    region: 'Norte',
    category: 'scenic',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    scenic_score: 9.8,
    road_quality_score: 8.5,
    fun_factor_score: 9.5,
    featured: true,
    waypoints: [
      [41.1631, -7.7887], // Peso da Régua
      [41.16, -7.65], // N222, margem sul
      [41.1876, -7.5463], // Pinhão
      [41.1478, -7.4041], // São João da Pesqueira
    ],
    stops: [
      {
        name: 'Museu do Douro',
        description: 'Ponto de partida na Régua, com história da região demarcada.',
        type: 'landmark',
        lat: 41.1617,
        lng: -7.7869,
      },
      {
        name: 'Estação do Pinhão',
        description: 'Estação ferroviária com painéis de azulejo sobre a vindima.',
        type: 'landmark',
        lat: 41.1897,
        lng: -7.5455,
      },
      {
        name: 'Miradouro de São Salvador do Mundo',
        description: 'Vista panorâmica sobre o Douro e a barragem da Valeira.',
        type: 'viewpoint',
        lat: 41.135,
        lng: -7.4223,
      },
    ],
  },
  {
    title: 'Douro pela N222 | Gaia > Castelo de Paiva > Resende > Régua',
    description:
      'A N222 completa pela margem sul do Douro, desde Vila Nova de Gaia até à Régua. Começa urbana, mas a partir de Castelo de Paiva torna-se uma sucessão de curvas sobre o rio, passando por Cinfães e por Resende, terra da cereja, antes de chegar à porta do Alto Douro Vinhateiro.',
    region: 'Norte',
    category: 'scenic',
    difficulty: 'easy',
    route_type: 'out_and_back',
    scenic_score: 8.5,
    road_quality_score: 7.5,
    fun_factor_score: 7.5,
    waypoints: [
      [41.1373, -8.6125], // Vila Nova de Gaia, cais
      [41.0648, -8.5011], // Crestuma
      [41.0639, -8.471], // Lever
      [41.0427, -8.3851], // Pedorido
      [41.041, -8.2718], // Castelo de Paiva
      [41.075, -7.9506], // Resende
      [41.1631, -7.7887], // Peso da Régua
    ],
    stops: [
      {
        name: 'Ponte Luís I',
        description: 'Ponto de partida no cais de Gaia, frente à Ribeira do Porto.',
        type: 'landmark',
        lat: 41.1399,
        lng: -8.6094,
      },
      {
        name: 'Resende',
        description: 'Terra da cereja — boa paragem para café antes da reta final até à Régua.',
        type: 'cafe',
        lat: 41.075,
        lng: -7.9506,
      },
      {
        name: 'Museu do Douro',
        description: 'Chegada à Régua, capital do vinho do Porto.',
        type: 'landmark',
        lat: 41.1617,
        lng: -7.7869,
      },
    ],
  },
  {
    title: 'Peneda-Gerês | Braga > Caniçada > Gerês',
    description:
      'Volta pelo único parque nacional de Portugal. Saída de Braga pelo Bom Jesus, descida até à albufeira da Caniçada e subida à vila termal do Gerês, com vistas de cortar a respiração desde o miradouro da Pedra Bela. Estradas de montanha estreitas e sinuosas, com muita sombra e granito.',
    region: 'Norte',
    category: 'mountain',
    difficulty: 'challenging',
    route_type: 'loop',
    scenic_score: 9.5,
    road_quality_score: 7,
    fun_factor_score: 9,
    featured: true,
    waypoints: [
      [41.5454, -8.4265], // Braga
      [41.5545, -8.3772], // Bom Jesus
      [41.5759, -8.27], // Póvoa de Lanhoso
      [41.6803, -8.1883], // Rio Caldo (ponte sobre a Caniçada)
      [41.729, -8.1595], // Gerês
      [41.7165, -8.1505], // Pedra Bela
      [41.7553, -8.1975], // Campo do Gerês
      [41.7183, -8.309], // Terras de Bouro
      [41.5454, -8.4265], // Braga
    ],
    stops: [
      {
        name: 'Santuário do Bom Jesus do Monte',
        description: 'Escadório barroco classificado pela UNESCO, à saída de Braga.',
        type: 'landmark',
        lat: 41.5545,
        lng: -8.3772,
      },
      {
        name: 'Albufeira da Caniçada',
        description: 'Vista sobre a barragem e as encostas do Gerês.',
        type: 'viewpoint',
        lat: 41.6542,
        lng: -8.2205,
      },
      {
        name: 'Vila do Gerês',
        description: 'Vila termal com cafés e restaurantes de cozinha minhota.',
        type: 'cafe',
        lat: 41.729,
        lng: -8.1595,
      },
      {
        name: 'Miradouro da Pedra Bela',
        description: 'Um dos miradouros mais bonitos do parque, sobre a Caniçada.',
        type: 'viewpoint',
        lat: 41.7165,
        lng: -8.1505,
      },
    ],
  },
  {
    title: 'Alto Minho | Ponte de Lima > Soajo > Lindoso',
    description:
      'Volta pelas aldeias de montanha do Alto Minho e pela porta ocidental do Gerês. Saída da vila mais antiga de Portugal, passagem por Arcos de Valdevez, subida até aos espigueiros do Soajo e do Lindoso e regresso pelo vale do Lima por Ponte da Barca.',
    region: 'Norte',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'loop',
    scenic_score: 9,
    road_quality_score: 7,
    fun_factor_score: 8.5,
    waypoints: [
      [41.7672, -8.5835], // Ponte de Lima
      [41.8466, -8.4187], // Arcos de Valdevez
      [41.8724, -8.2633], // Soajo
      [41.8662, -8.2005], // Lindoso
      [41.8076, -8.417], // Ponte da Barca
      [41.7672, -8.5835], // Ponte de Lima
    ],
    stops: [
      {
        name: 'Ponte medieval de Ponte de Lima',
        description: 'Ponte romana e medieval sobre o rio Lima.',
        type: 'landmark',
        lat: 41.7684,
        lng: -8.5847,
      },
      {
        name: 'Espigueiros do Soajo',
        description: 'Conjunto de espigueiros de granito sobre a eira comunitária.',
        type: 'landmark',
        lat: 41.872,
        lng: -8.263,
      },
      {
        name: 'Castelo do Lindoso',
        description: 'Castelo de fronteira rodeado de espigueiros.',
        type: 'landmark',
        lat: 41.8661,
        lng: -8.1978,
      },
    ],
  },
  {
    title: 'Serra do Marão | Amarante > Vila Real pela estrada antiga',
    description:
      'A antiga travessia da Serra do Marão (N15 e o velho IP4), esquecida pelo trânsito desde que abriu o túnel da A4. Subida em curvas a partir de Amarante até ao Alto do Espinho, com vistas largas sobre o Minho e Trás-os-Montes, e descida rápida até Vila Real.',
    region: 'Norte',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    scenic_score: 8.5,
    road_quality_score: 7.5,
    fun_factor_score: 9,
    waypoints: [
      [41.2717, -8.082], // Amarante
      [41.2532, -8.0504], // Padronelo
      [41.2782, -7.9911], // Aboadela (N15)
      [41.2917, -7.878], // Campeã
      [41.3006, -7.7441], // Vila Real
    ],
    stops: [
      {
        name: 'Ponte de São Gonçalo',
        description: 'Ponte e igreja de São Gonçalo, centro histórico de Amarante.',
        type: 'landmark',
        lat: 41.2697,
        lng: -8.0782,
      },
      {
        name: 'Alto do Espinho',
        description: 'Topo da passagem do Marão, com vista sobre as duas vertentes.',
        type: 'viewpoint',
        lat: 41.2735,
        lng: -7.9145,
      },
    ],
  },
  {
    title: 'Douro Internacional | Miranda do Douro > Barca d’Alva',
    description:
      'A N221 acompanha a fronteira pelo planalto mirandês e pelas arribas do Douro Internacional, passando por Sendim, Bemposta, Lagoaça e Freixo de Espada à Cinta. Paisagens selvagens, pouco trânsito, amendoeiras e olivais, terminando na descida espetacular até Barca d’Alva, onde o Douro entra em Portugal.',
    region: 'Norte',
    category: 'adventure',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    scenic_score: 9,
    road_quality_score: 7.5,
    fun_factor_score: 8.5,
    waypoints: [
      [41.495, -6.274], // Miranda do Douro
      [41.3896, -6.4265], // Sendim
      [41.3143, -6.5013], // Bemposta
      [41.2107, -6.7585], // Lagoaça
      [41.1879, -6.7529], // Fornos
      [41.09, -6.806], // Freixo de Espada à Cinta
      [41.031, -6.933], // Barca d'Alva
    ],
    stops: [
      {
        name: 'Concatedral de Miranda do Douro',
        description: 'Centro histórico de Miranda, sobre as arribas do Douro.',
        type: 'landmark',
        lat: 41.4925,
        lng: -6.2735,
      },
      {
        name: 'Torre do Galo, Freixo de Espada à Cinta',
        description: 'Torre heptagonal no centro da vila manuelina.',
        type: 'landmark',
        lat: 41.0895,
        lng: -6.8073,
      },
      {
        name: 'Barca d’Alva',
        description: 'Fim de percurso junto ao rio, na fronteira com Espanha.',
        type: 'viewpoint',
        lat: 41.031,
        lng: -6.933,
      },
    ],
  },
  {
    title: 'Montesinho | Bragança > França > Rio de Onor',
    description:
      'Volta pelo Parque Natural de Montesinho, no extremo nordeste do país. Estradas estreitas entre carvalhais e aldeias de xisto e granito, terminando em Rio de Onor, a aldeia comunitária partilhada com Espanha.',
    region: 'Norte',
    category: 'adventure',
    difficulty: 'challenging',
    route_type: 'loop',
    scenic_score: 8.5,
    road_quality_score: 6,
    fun_factor_score: 8,
    waypoints: [
      [41.8061, -6.7567], // Bragança
      [41.9022, -6.736], // França
      [41.941, -6.615], // Rio de Onor
      [41.8061, -6.7567], // Bragança
    ],
    stops: [
      {
        name: 'Castelo de Bragança',
        description: 'Cidadela medieval e Domus Municipalis.',
        type: 'landmark',
        lat: 41.8031,
        lng: -6.7505,
      },
      {
        name: 'Rio de Onor',
        description: 'Aldeia comunitária dividida pela fronteira.',
        type: 'landmark',
        lat: 41.941,
        lng: -6.615,
      },
    ],
  },

  // ───────────────────────────── CENTRO ─────────────────────────────
  {
    title: 'Serra da Estrela | Covilhã > Torre > Seia',
    description:
      'A travessia clássica da Serra da Estrela pela N339, a estrada mais alta de Portugal continental. Subida desde a Covilhã pelas Penhas da Saúde até à Torre, a 1993 metros, e descida pela Lagoa Comprida e pelo Sabugueiro até Seia. Curvas em cotovelo, paisagem glaciar e mudanças rápidas de tempo — no inverno pode estar fechada por neve.',
    region: 'Centro',
    category: 'mountain',
    difficulty: 'challenging',
    route_type: 'out_and_back',
    scenic_score: 9.7,
    road_quality_score: 7.5,
    fun_factor_score: 9.5,
    featured: true,
    waypoints: [
      [40.2805, -7.5044], // Covilhã
      [40.3081, -7.5488], // Penhas da Saúde
      [40.3217, -7.6114], // Torre
      [40.3653, -7.6475], // Lagoa Comprida
      [40.3999, -7.6365], // Sabugueiro
      [40.4202, -7.7049], // Seia
    ],
    stops: [
      {
        name: 'Penhas da Saúde',
        description: 'Última paragem para café antes da subida final.',
        type: 'cafe',
        lat: 40.3081,
        lng: -7.5488,
      },
      {
        name: 'Torre',
        description: 'Ponto mais alto de Portugal continental (1993 m).',
        type: 'landmark',
        lat: 40.3217,
        lng: -7.6114,
      },
      {
        name: 'Lagoa Comprida',
        description: 'Maior lagoa da serra, com barragem e vistas sobre o planalto.',
        type: 'viewpoint',
        lat: 40.3653,
        lng: -7.6475,
      },
      {
        name: 'Sabugueiro',
        description: 'Aldeia mais alta de Portugal, famosa pelo queijo e pelos cães da serra.',
        type: 'landmark',
        lat: 40.3999,
        lng: -7.6365,
      },
    ],
  },
  {
    title: 'Serra da Estrela | Vale Glaciar do Zêzere a partir de Manteigas',
    description:
      'Volta pela face menos conhecida da serra. De Manteigas sobe-se pelo Vale Glaciar do Zêzere até ao Covão d’Ametade e à Torre, desce-se pela Lagoa Comprida e regressa-se por Gouveia e Penhas Douradas. Um dia inteiro de curvas com o vale em U sempre à vista.',
    region: 'Centro',
    category: 'mountain',
    difficulty: 'expert',
    route_type: 'loop',
    scenic_score: 9.6,
    road_quality_score: 7,
    fun_factor_score: 9.3,
    waypoints: [
      [40.4024, -7.5383], // Manteigas
      [40.329, -7.588], // Covão d'Ametade
      [40.3217, -7.6114], // Torre
      [40.3653, -7.6475], // Lagoa Comprida
      [40.4945, -7.5937], // Gouveia
      [40.4115, -7.559], // Penhas Douradas
      [40.4024, -7.5383], // Manteigas
    ],
    stops: [
      {
        name: 'Covão d’Ametade',
        description: 'Nascente do Zêzere, no fundo do vale glaciar.',
        type: 'viewpoint',
        lat: 40.329,
        lng: -7.588,
      },
      {
        name: 'Torre',
        description: 'Ponto mais alto de Portugal continental.',
        type: 'landmark',
        lat: 40.3217,
        lng: -7.6114,
      },
      {
        name: 'Gouveia',
        description: 'Boa paragem para almoço antes do regresso pelas Penhas Douradas.',
        type: 'restaurant',
        lat: 40.4945,
        lng: -7.5937,
      },
    ],
  },
  {
    title: 'Serra do Açor | Arganil > Piódão',
    description:
      'Estrada de montanha até ao Piódão, a aldeia de xisto que parece um presépio pendurado na encosta. A partir de Côja a estrada estreita e sobe pela Serra do Açor em curvas contínuas, com encostas cobertas de pinhal e socalcos. Exige atenção, mas a chegada compensa.',
    region: 'Centro',
    category: 'adventure',
    difficulty: 'challenging',
    route_type: 'out_and_back',
    scenic_score: 9.2,
    road_quality_score: 6.5,
    fun_factor_score: 9,
    waypoints: [
      [40.218, -8.054], // Arganil
      [40.269, -7.993], // Côja
      [40.2291, -7.8236], // Piódão
    ],
    stops: [
      {
        name: 'Côja',
        description: 'Vila junto ao rio Alva, com praia fluvial.',
        type: 'cafe',
        lat: 40.269,
        lng: -7.993,
      },
      {
        name: 'Piódão',
        description: 'Aldeia histórica de xisto, ponto final do percurso.',
        type: 'landmark',
        lat: 40.2291,
        lng: -7.8236,
      },
    ],
  },
  {
    title: 'Rota do Zêzere | Tomar > Castelo de Bode > Dornes',
    description:
      'Volta pelas margens da albufeira de Castelo de Bode, com saída e chegada a Tomar, a cidade dos Templários. Estradas sinuosas entre eucaliptal e pinhal, sempre com o azul da barragem por perto, e passagem pela península de Dornes e a sua torre templária.',
    region: 'Centro',
    category: 'weekend',
    difficulty: 'moderate',
    route_type: 'loop',
    scenic_score: 8.5,
    road_quality_score: 7.5,
    fun_factor_score: 8.5,
    waypoints: [
      [39.603, -8.415], // Tomar
      [39.544, -8.32], // Barragem de Castelo de Bode
      [39.6006, -8.3013], // Serra
      [39.713, -8.333], // Pias
      [39.772, -8.261], // Dornes
      [39.696, -8.29], // Ferreira do Zêzere
      [39.603, -8.415], // Tomar
    ],
    stops: [
      {
        name: 'Convento de Cristo',
        description: 'Castelo templário e convento classificado pela UNESCO.',
        type: 'landmark',
        lat: 39.6039,
        lng: -8.4193,
      },
      {
        name: 'Barragem de Castelo de Bode',
        description: 'Paredão da barragem com vista sobre a albufeira.',
        type: 'viewpoint',
        lat: 39.544,
        lng: -8.32,
      },
      {
        name: 'Torre de Dornes',
        description: 'Torre pentagonal templária numa península do Zêzere.',
        type: 'landmark',
        lat: 39.772,
        lng: -8.261,
      },
    ],
  },
  {
    title: 'Costa de Prata | Peniche > Foz do Arelho > Nazaré',
    description:
      'Percurso junto ao Atlântico entre Peniche e a Nazaré. Passagem pelo Cabo Carvoeiro, pela Lagoa de Óbidos na Foz do Arelho e pela concha de São Martinho do Porto, terminando no Sítio da Nazaré, sobre a praia das ondas gigantes.',
    region: 'Centro',
    category: 'coastal',
    difficulty: 'easy',
    route_type: 'out_and_back',
    scenic_score: 8.5,
    road_quality_score: 8,
    fun_factor_score: 7,
    waypoints: [
      [39.36, -9.408], // Cabo Carvoeiro
      [39.3558, -9.3811], // Peniche
      [39.375, -9.34], // Baleal
      [39.3644, -9.3161], // Ferrel
      [39.4237, -9.2345], // Bom Sucesso
      [39.433, -9.228], // Foz do Arelho
      [39.513, -9.138], // São Martinho do Porto
      [39.604, -9.073], // Sítio da Nazaré
    ],
    stops: [
      {
        name: 'Cabo Carvoeiro',
        description: 'Farol e Nau dos Corvos, sobre as falésias de Peniche.',
        type: 'viewpoint',
        lat: 39.36,
        lng: -9.408,
      },
      {
        name: 'Foz do Arelho',
        description: 'Onde a Lagoa de Óbidos encontra o mar.',
        type: 'cafe',
        lat: 39.433,
        lng: -9.228,
      },
      {
        name: 'Miradouro do Suberco',
        description: 'Vista sobre a praia da Nazaré a partir do Sítio.',
        type: 'viewpoint',
        lat: 39.605,
        lng: -9.0745,
      },
    ],
  },

  // ───────────────────────────── LISBOA ─────────────────────────────
  {
    title: 'Sintra e Cabo da Roca | Volta a partir de Cascais',
    description:
      'Clássico dos motociclistas de Lisboa. Estrada do Guincho junto ao mar, subida ao Cabo da Roca, o ponto mais ocidental da Europa continental, e travessia da Serra de Sintra por estradas estreitas e sombreadas até ao Palácio da Pena, regressando a Cascais pela Malveira da Serra.',
    region: 'Lisboa',
    category: 'coastal',
    difficulty: 'moderate',
    route_type: 'loop',
    scenic_score: 9.3,
    road_quality_score: 7.5,
    fun_factor_score: 9,
    featured: true,
    waypoints: [
      [38.6979, -9.4215], // Cascais
      [38.733, -9.473], // Guincho
      [38.7804, -9.4989], // Cabo da Roca
      [38.799, -9.447], // Colares
      [38.7976, -9.3907], // Sintra
      [38.7876, -9.3906], // Palácio da Pena
      [38.747, -9.439], // Malveira da Serra
      [38.6979, -9.4215], // Cascais
    ],
    stops: [
      {
        name: 'Boca do Inferno',
        description: 'Arriba esculpida pelo mar à saída de Cascais.',
        type: 'viewpoint',
        lat: 38.6913,
        lng: -9.431,
      },
      {
        name: 'Cabo da Roca',
        description: 'Ponto mais ocidental da Europa continental.',
        type: 'landmark',
        lat: 38.7804,
        lng: -9.4989,
      },
      {
        name: 'Piriquita',
        description: 'Travesseiros e queijadas no centro histórico de Sintra.',
        type: 'cafe',
        lat: 38.7978,
        lng: -9.3893,
      },
      {
        name: 'Palácio da Pena',
        description: 'Palácio romântico no topo da Serra de Sintra.',
        type: 'landmark',
        lat: 38.7876,
        lng: -9.3906,
      },
    ],
  },
  {
    title: 'Serra da Arrábida | Setúbal > Sesimbra > Cabo Espichel',
    description:
      'A estrada da Arrábida segue a crista da serra com o mar turquesa lá em baixo — uma das paisagens mais bonitas perto de Lisboa. Continua até Sesimbra e termina no Cabo Espichel, com o santuário sobre as falésias. Atenção a ciclistas e ao trânsito de praia no verão.',
    region: 'Lisboa',
    category: 'coastal',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    scenic_score: 9.5,
    road_quality_score: 7.5,
    fun_factor_score: 8.8,
    waypoints: [
      [38.5244, -8.8882], // Setúbal
      [38.4866, -8.9852], // Convento da Arrábida
      [38.4445, -9.1015], // Sesimbra
      [38.4155, -9.216], // Cabo Espichel
    ],
    stops: [
      {
        name: 'Miradouro do Portinho da Arrábida',
        description: 'Vista sobre a enseada do Portinho e o Creiro.',
        type: 'viewpoint',
        lat: 38.484,
        lng: -8.975,
      },
      {
        name: 'Convento da Arrábida',
        description: 'Convento franciscano do século XVI na encosta da serra.',
        type: 'landmark',
        lat: 38.4866,
        lng: -8.9852,
      },
      {
        name: 'Sesimbra',
        description: 'Vila piscatória — paragem obrigatória para peixe grelhado.',
        type: 'restaurant',
        lat: 38.4445,
        lng: -9.1015,
      },
      {
        name: 'Santuário do Cabo Espichel',
        description: 'Santuário de Nossa Senhora do Cabo sobre as falésias.',
        type: 'landmark',
        lat: 38.417,
        lng: -9.215,
      },
    ],
  },

  // ───────────────────────────── ALENTEJO ─────────────────────────────
  {
    title: 'Alqueva | Évora > Monsaraz > Portel',
    description:
      'Volta pelas planícies do Alentejo até ao grande lago do Alqueva. Retas longas e curvas abertas, montado de sobro e azinho, a vila medieval de Monsaraz no alto e a travessia junto à maior barragem da Europa Ocidental. Ideal para um fim de semana com bom vinho e bom ritmo.',
    region: 'Alentejo',
    category: 'weekend',
    difficulty: 'easy',
    route_type: 'loop',
    scenic_score: 8.5,
    road_quality_score: 8.5,
    fun_factor_score: 7,
    waypoints: [
      [38.5714, -7.9135], // Évora
      [38.4256, -7.5345], // Reguengos de Monsaraz
      [38.4433, -7.3804], // Monsaraz
      [38.3836, -7.3449], // Mourão
      [38.197, -7.496], // Barragem do Alqueva
      [38.3083, -7.7044], // Portel
      [38.5714, -7.9135], // Évora
    ],
    stops: [
      {
        name: 'Templo Romano de Évora',
        description: 'Centro histórico classificado pela UNESCO.',
        type: 'landmark',
        lat: 38.5727,
        lng: -7.9075,
      },
      {
        name: 'Monsaraz',
        description: 'Vila muralhada com vista sobre o lago do Alqueva.',
        type: 'viewpoint',
        lat: 38.443,
        lng: -7.38,
      },
      {
        name: 'Barragem do Alqueva',
        description: 'Paredão da maior barragem da Europa Ocidental.',
        type: 'landmark',
        lat: 38.1975,
        lng: -7.4965,
      },
      {
        name: 'Castelo de Portel',
        description: 'Castelo medieval sobre a vila.',
        type: 'landmark',
        lat: 38.308,
        lng: -7.702,
      },
    ],
  },
  {
    title: 'Serra de São Mamede | Portalegre > Marvão > Castelo de Vide',
    description:
      'Volta curta e intensa pelo Parque Natural da Serra de São Mamede. Estradas sinuosas entre castanheiros e carvalhos, subida até ao castelo de Marvão, empoleirado num rochedo a 860 metros, e passagem pela judiaria de Castelo de Vide.',
    region: 'Alentejo',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'loop',
    scenic_score: 9,
    road_quality_score: 7.5,
    fun_factor_score: 8.5,
    waypoints: [
      [39.2967, -7.4285], // Portalegre
      [39.394, -7.377], // Marvão
      [39.416, -7.456], // Castelo de Vide
      [39.2967, -7.4285], // Portalegre
    ],
    stops: [
      {
        name: 'Castelo de Marvão',
        description: 'Fortaleza no topo da serra com vista até Espanha.',
        type: 'viewpoint',
        lat: 39.3955,
        lng: -7.379,
      },
      {
        name: 'Judiaria de Castelo de Vide',
        description: 'Bairro medieval e sinagoga.',
        type: 'landmark',
        lat: 39.4166,
        lng: -7.4554,
      },
    ],
  },
  {
    title: 'Vale do Guadiana | Mértola > Alcoutim > Castro Marim',
    description:
      'Percurso ao longo do Guadiana, na fronteira entre o Baixo Alentejo e o Algarve. Serra algarvia quase deserta, curvas fluidas e três castelos a pontuar o caminho, de Mértola até Castro Marim, perto da foz do rio.',
    region: 'Alentejo',
    category: 'scenic',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    scenic_score: 8.5,
    road_quality_score: 8,
    fun_factor_score: 8.5,
    waypoints: [
      [37.638, -7.662], // Mértola
      [37.471, -7.472], // Alcoutim
      [37.3969, -7.4475], // Guerreiros do Rio
      [37.3542, -7.4422], // Foz de Odeleite
      [37.3342, -7.4888], // Odeleite
      [37.2848, -7.4642], // Azinhal
      [37.219, -7.443], // Castro Marim
    ],
    stops: [
      {
        name: 'Castelo de Mértola',
        description: 'Vila-museu sobre a confluência do Guadiana e da ribeira de Oeiras.',
        type: 'landmark',
        lat: 37.6405,
        lng: -7.6612,
      },
      {
        name: 'Alcoutim',
        description: 'Vila ribeirinha frente a Sanlúcar de Guadiana.',
        type: 'cafe',
        lat: 37.4706,
        lng: -7.4715,
      },
      {
        name: 'Castelo de Castro Marim',
        description: 'Castelo sobre o sapal e a reserva natural.',
        type: 'landmark',
        lat: 37.2185,
        lng: -7.4435,
      },
    ],
  },

  // ───────────────────────────── ALGARVE ─────────────────────────────
  {
    title: 'Costa Vicentina | Cabo de São Vicente > Vila Nova de Milfontes',
    description:
      'A costa selvagem do sudoeste português, do Cabo de São Vicente até Vila Nova de Milfontes. Falésias, praias desertas e a N120/N268 a cruzar charnecas abertas ao vento atlântico. Uma estrada para ir sem pressa, com muitas paragens para ver o mar.',
    region: 'Algarve',
    category: 'coastal',
    difficulty: 'easy',
    route_type: 'out_and_back',
    scenic_score: 9.5,
    road_quality_score: 8,
    fun_factor_score: 7.5,
    featured: true,
    waypoints: [
      [37.0227, -8.9965], // Cabo de São Vicente
      [37.0087, -8.9407], // Sagres
      [37.0826, -8.9113], // Vila do Bispo
      [37.1919, -8.9022], // Carrapateira
      [37.3184, -8.8031], // Aljezur
      [37.4329, -8.771], // Odeceixe
      [37.5243, -8.7848], // Zambujeira do Mar
      [37.7246, -8.7826], // Vila Nova de Milfontes
    ],
    stops: [
      {
        name: 'Farol do Cabo de São Vicente',
        description: 'O "fim do mundo" da Europa, com pôr do sol inesquecível.',
        type: 'landmark',
        lat: 37.0227,
        lng: -8.9965,
      },
      {
        name: 'Fortaleza de Sagres',
        description: 'Promontório ligado à escola de navegação do Infante D. Henrique.',
        type: 'landmark',
        lat: 36.9999,
        lng: -8.9475,
      },
      {
        name: 'Pontal da Carrapateira',
        description: 'Miradouros sobre as praias da Bordeira e do Amado.',
        type: 'viewpoint',
        lat: 37.196,
        lng: -8.903,
      },
      {
        name: 'Castelo de Aljezur',
        description: 'Ruínas do castelo com vista sobre a vila e o vale.',
        type: 'viewpoint',
        lat: 37.3195,
        lng: -8.8044,
      },
      {
        name: 'Vila Nova de Milfontes',
        description: 'Foz do Mira — fim de percurso com praias e restaurantes.',
        type: 'restaurant',
        lat: 37.7246,
        lng: -8.7826,
      },
    ],
  },
  {
    title: 'Serra de Monchique | Portimão > Fóia > Aljezur > Lagos',
    description:
      'Volta pelo Algarve longe das praias. Subida de Portimão às Caldas de Monchique e à Fóia, o ponto mais alto do Algarve, descida pela serra até Marmelete e Aljezur e regresso ao litoral por Bensafrim e Lagos. Curvas de serra, eucaliptos e medronheiros, com o mar sempre no horizonte.',
    region: 'Algarve',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'loop',
    scenic_score: 8.8,
    road_quality_score: 8,
    fun_factor_score: 9,
    waypoints: [
      [37.1366, -8.5377], // Portimão
      [37.287, -8.553], // Caldas de Monchique
      [37.3176, -8.5559], // Monchique
      [37.315, -8.5956], // Fóia
      [37.31, -8.668], // Marmelete
      [37.3184, -8.8031], // Aljezur
      [37.1556, -8.7375], // Bensafrim
      [37.1028, -8.6742], // Lagos
      [37.1366, -8.5377], // Portimão
    ],
    stops: [
      {
        name: 'Caldas de Monchique',
        description: 'Termas históricas no meio da serra, boa paragem para café.',
        type: 'cafe',
        lat: 37.287,
        lng: -8.553,
      },
      {
        name: 'Fóia',
        description: 'Ponto mais alto do Algarve (902 m), com vista até ao mar.',
        type: 'viewpoint',
        lat: 37.315,
        lng: -8.5956,
      },
      {
        name: 'Ponta da Piedade',
        description: 'Falésias e grutas douradas à saída de Lagos.',
        type: 'viewpoint',
        lat: 37.0811,
        lng: -8.6695,
      },
    ],
  },
];
