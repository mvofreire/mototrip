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
  // ───────────────────────────── CASCATAS ─────────────────────────────
  {
    title: 'Cascatas do Gerês | Portela do Homem > Leonte > Gerês > Fecha de Barjas',
    description:
      'Três quedas de água do Parque Nacional da Peneda-Gerês numa só estrada. Da fronteira na Portela do Homem desce-se pela Mata da Albergaria, ao lado dos marcos miliários da Geira romana, até à Cascata de Leonte e à vila do Gerês. Depois segue-se pela EM 308 até ao miradouro de Fecha de Barjas, as lagoas conhecidas por "Tahiti". Na Mata da Albergaria não é permitido parar nem estacionar: para ver a cascata da Portela do Homem, deixe a mota junto à antiga fronteira.',
    region: 'Norte',
    category: 'scenic',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    waypoints: [
      [41.8091, -8.1315], // Portela do Homem
      [41.7607, -8.1494], // Cascata de Leonte
      [41.729, -8.1595], // Gerês
      [41.7042, -8.1101], // Miradouro de Fecha de Barjas (EM 308)
      [41.7137, -8.036], // Cabril
    ],
    stops: [
      {
        name: 'Portela do Homem',
        description: 'Fronteira com a Galiza, com uma cascata e poços de água junto à ponte.',
        type: 'viewpoint',
        lat: 41.8091,
        lng: -8.1315,
        i18n: {
          en: { description: 'The border with Galicia, with a waterfall and pools by the bridge.' },
          es: { description: 'Frontera con Galicia, con una cascada y pozas junto al puente.' },
          fr: { description: 'La frontière avec la Galice, avec une cascade et des vasques près du pont.' },
          de: { description: 'Grenze zu Galicien, mit einem Wasserfall und Gumpen an der Brücke.' },
        },
      },
      {
        name: 'Cascata de Leonte',
        description: 'Queda de água à beira da estrada, no meio do carvalhal da Mata da Albergaria.',
        type: 'viewpoint',
        lat: 41.7607,
        lng: -8.1494,
        i18n: {
          en: { name: 'Leonte Waterfall', description: 'A roadside waterfall in the oak woods of the Mata da Albergaria.' },
          es: { name: 'Cascada de Leonte', description: 'Cascada junto a la carretera, en el robledal de la Mata da Albergaria.' },
          fr: { name: 'Cascade de Leonte', description: 'Une cascade en bord de route, dans la chênaie de la Mata da Albergaria.' },
          de: { name: 'Wasserfall von Leonte', description: 'Wasserfall direkt an der Straße im Eichenwald der Mata da Albergaria.' },
        },
      },
      {
        name: 'Miradouro de Fecha de Barjas',
        description: 'Vista sobre as cascatas e lagoas do rio Arado, conhecidas por "Tahiti".',
        type: 'viewpoint',
        lat: 41.7042,
        lng: -8.1101,
        i18n: {
          en: { name: 'Fecha de Barjas viewpoint', description: 'View over the waterfalls and pools known as "Tahiti".' },
          es: { name: 'Mirador de Fecha de Barjas', description: 'Vista sobre las cascadas y pozas conocidas como "Tahiti".' },
          fr: { name: 'Belvédère de Fecha de Barjas', description: 'Vue sur les cascades et les vasques surnommées « Tahiti ».' },
          de: { name: 'Aussichtspunkt Fecha de Barjas', description: 'Blick auf die Wasserfälle und Gumpen, die „Tahiti“ genannt werden.' },
        },
      },
    ],
    i18n: {
      en: { title: 'Gerês waterfalls | Portela do Homem > Leonte > Gerês > Fecha de Barjas', description: 'Three waterfalls of the Peneda-Gerês National Park on a single road. From the border at Portela do Homem you ride down through the Mata da Albergaria, past the milestones of the Roman Geira road, to the Leonte waterfall and the village of Gerês. Then the EM 308 takes you to the Fecha de Barjas viewpoint, above the pools known as "Tahiti". Stopping and parking are not allowed inside the Mata da Albergaria: to see the Portela do Homem waterfall, leave the bike by the old border post.' },
      es: { title: 'Cascadas del Gerês | Portela do Homem > Leonte > Gerês > Fecha de Barjas', description: 'Tres cascadas del Parque Nacional de Peneda-Gerês en una sola carretera. Desde la frontera en Portela do Homem se baja por la Mata da Albergaria, junto a los miliarios de la vía romana Geira, hasta la cascada de Leonte y el pueblo de Gerês. Después la EM 308 lleva al mirador de Fecha de Barjas, sobre las pozas conocidas como "Tahiti". En la Mata da Albergaria no se permite parar ni aparcar: para ver la cascada de Portela do Homem, deja la moto junto a la antigua frontera.' },
      fr: { title: 'Cascades du Gerês | Portela do Homem > Leonte > Gerês > Fecha de Barjas', description: "Trois cascades du parc national de Peneda-Gerês sur une seule route. Depuis la frontière à Portela do Homem, on descend par la Mata da Albergaria, le long des bornes milliaires de la voie romaine Geira, jusqu'à la cascade de Leonte et au village de Gerês. La EM 308 mène ensuite au belvédère de Fecha de Barjas, au-dessus des vasques surnommées « Tahiti ». Dans la Mata da Albergaria, il est interdit de s'arrêter et de stationner : pour voir la cascade de Portela do Homem, laissez la moto près de l'ancienne frontière." },
      de: { title: 'Wasserfälle des Gerês | Portela do Homem > Leonte > Gerês > Fecha de Barjas', description: 'Drei Wasserfälle des Nationalparks Peneda-Gerês an einer einzigen Straße. Von der Grenze an der Portela do Homem geht es durch die Mata da Albergaria, vorbei an den Meilensteinen der römischen Geira, zum Wasserfall von Leonte und ins Dorf Gerês. Danach führt die EM 308 zum Aussichtspunkt Fecha de Barjas über den Gumpen, die „Tahiti“ genannt werden. In der Mata da Albergaria ist Halten und Parken verboten: Für den Wasserfall an der Portela do Homem das Motorrad am alten Grenzposten abstellen.' },
    },
  },
  {
    title: 'Fisgas de Ermelo | Mondim de Basto > Ermelo > Lamas de Olo > Vila Real',
    description:
      'Travessia do Parque Natural do Alvão pela zona das Fisgas de Ermelo, uma das maiores quedas de água de Portugal, formada pelo rio Olo. Para as ver de perto, o trilho PR3 parte da aldeia de Ermelo. De Mondim de Basto sobe-se a Ermelo e ao planalto, passa-se pela aldeia de Lamas de Olo, com casas de granito e colmo, e desce-se até Vila Real. Estrada estreita e com pouco trânsito no planalto.',
    region: 'Norte',
    category: 'scenic',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    waypoints: [
      [41.4103, -7.9534], // Mondim de Basto
      [41.3602, -7.8892], // Ermelo
      [41.3764, -7.8535], // Varzigueto
      [41.3709, -7.7951], // Lamas de Olo
      [41.2977, -7.7458], // Vila Real
    ],
    stops: [
      {
        name: 'Ermelo',
        description: 'Aldeia ao pé da serra, de onde parte o trilho pedestre das Fisgas.',
        type: 'landmark',
        lat: 41.3602,
        lng: -7.8892,
        i18n: {
          en: { description: 'A village at the foot of the range, where the Fisgas hiking trail starts.' },
          es: { description: 'Pueblo al pie de la sierra, donde empieza el sendero de las Fisgas.' },
          fr: { description: 'Village au pied de la montagne, départ du sentier des Fisgas.' },
          de: { description: 'Dorf am Fuß des Gebirges, Ausgangspunkt des Wanderwegs zu den Fisgas.' },
        },
      },
      {
        name: 'Miradouro das Fisgas de Ermelo',
        description: 'Vista sobre os saltos do rio Olo, no trilho PR3 que parte de Ermelo (só a pé).',
        type: 'viewpoint',
        lat: 41.3764,
        lng: -7.8703,
        i18n: {
          en: { name: 'Fisgas de Ermelo viewpoint', description: 'View over the falls of the Olo river, on the PR3 trail from Ermelo (on foot only).' },
          es: { name: 'Mirador de las Fisgas de Ermelo', description: 'Vista sobre los saltos del río Olo, en el sendero PR3 que sale de Ermelo (solo a pie).' },
          fr: { name: 'Belvédère des Fisgas de Ermelo', description: "Vue sur les chutes de l'Olo, sur le sentier PR3 depuis Ermelo (à pied uniquement)." },
          de: { name: 'Aussichtspunkt Fisgas de Ermelo', description: 'Blick auf die Fälle des Olo, am Wanderweg PR3 ab Ermelo (nur zu Fuß).' },
        },
      },
      {
        name: 'Lamas de Olo',
        description: 'Aldeia de montanha no planalto do Alvão, com casas de granito e telhados de colmo.',
        type: 'landmark',
        lat: 41.3709,
        lng: -7.7951,
        i18n: {
          en: { description: 'A mountain village on the Alvão plateau, with granite houses and thatched roofs.' },
          es: { description: 'Aldea de montaña en la meseta del Alvão, con casas de granito y tejados de paja.' },
          fr: { description: "Village de montagne sur le plateau de l'Alvão, aux maisons de granit et toits de chaume." },
          de: { description: 'Bergdorf auf der Hochebene des Alvão mit Granithäusern und Strohdächern.' },
        },
      },
    ],
    i18n: {
      en: { description: 'A crossing of the Alvão Natural Park through the Fisgas de Ermelo area, one of the largest waterfalls in Portugal, formed by the Olo river. To see it up close, the PR3 trail starts in the village of Ermelo. From Mondim de Basto you climb to Ermelo and the plateau, pass the village of Lamas de Olo, with its granite and thatch houses, and ride down to Vila Real. A narrow road with little traffic on the plateau.' },
      es: { description: 'Travesía del Parque Natural del Alvão por la zona de las Fisgas de Ermelo, una de las mayores cascadas de Portugal, formada por el río Olo. Para verlas de cerca, el sendero PR3 sale del pueblo de Ermelo. Desde Mondim de Basto se sube a Ermelo y a la meseta, se pasa por la aldea de Lamas de Olo, con casas de granito y paja, y se baja a Vila Real. Carretera estrecha y con poco tráfico en la meseta.' },
      fr: { description: "Une traversée du parc naturel de l'Alvão par le secteur des Fisgas de Ermelo, l'une des plus grandes cascades du Portugal, formée par l'Olo. Pour les voir de près, le sentier PR3 part du village d'Ermelo. De Mondim de Basto, on monte à Ermelo et sur le plateau, on traverse le village de Lamas de Olo, aux maisons de granit et de chaume, puis on descend vers Vila Real. Route étroite et peu fréquentée sur le plateau." },
      de: { description: 'Eine Durchquerung des Naturparks Alvão durch das Gebiet der Fisgas de Ermelo, eines der größten Wasserfälle Portugals, gebildet vom Olo. Aus der Nähe sieht man sie über den Wanderweg PR3, der im Dorf Ermelo beginnt. Von Mondim de Basto geht es hinauf nach Ermelo und auf die Hochebene, durch das Dorf Lamas de Olo mit Granithäusern und Strohdächern und hinunter nach Vila Real. Schmale Straße mit wenig Verkehr auf der Hochebene.' },
    },
  },
  {
    title: 'Serra da Freita | Arouca > Frecha da Mizarela > Cascata da Cabreia > Sever do Vouga',
    description:
      'Duas cascatas numa volta pelo Arouca Geopark, classificado pela UNESCO. De Arouca sobe-se à Serra da Freita pelo Merujal até à Frecha da Mizarela, uma das quedas de água mais altas de Portugal continental, que se vê de um miradouro a poucos minutos a pé da estrada. Depois desce-se para o vale do Vouga até à Cascata da Cabreia, no meio da mata, antes de terminar em Sever do Vouga.',
    region: 'Centro',
    category: 'scenic',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    waypoints: [
      [40.9289, -8.2442], // Arouca
      [40.8753, -8.2989], // Merujal
      [40.8685, -8.2753], // Albergaria da Serra
      [40.7582, -8.3907], // Silva Escura (Cabreia)
      [40.7342, -8.37], // Sever do Vouga
    ],
    stops: [
      {
        name: 'Mosteiro de Arouca',
        description: 'Mosteiro cisterciense no centro da vila, ponto de partida para a serra.',
        type: 'landmark',
        lat: 40.9279,
        lng: -8.2466,
        i18n: {
          en: { name: 'Arouca Monastery', description: 'A Cistercian monastery in the centre of town, the starting point for the climb.' },
          es: { name: 'Monasterio de Arouca', description: 'Monasterio cisterciense en el centro del pueblo, punto de partida hacia la sierra.' },
          fr: { name: "Monastère d'Arouca", description: 'Monastère cistercien au centre de la ville, point de départ vers la montagne.' },
          de: { name: 'Kloster Arouca', description: 'Zisterzienserkloster im Ortszentrum, Ausgangspunkt für die Auffahrt in die Berge.' },
        },
      },
      {
        name: 'Frecha da Mizarela',
        description: 'Miradouro sobre a queda de água, a poucos minutos a pé do estacionamento.',
        type: 'viewpoint',
        lat: 40.8638,
        lng: -8.2858,
        i18n: {
          en: { description: 'Viewpoint over the waterfall, a few minutes on foot from the car park.' },
          es: { description: 'Mirador sobre la cascada, a pocos minutos a pie del aparcamiento.' },
          fr: { description: 'Belvédère sur la cascade, à quelques minutes à pied du parking.' },
          de: { description: 'Aussichtspunkt über dem Wasserfall, wenige Gehminuten vom Parkplatz.' },
        },
      },
      {
        name: 'Cascata da Cabreia',
        description: 'Queda de água rodeada de mata, com parque de merendas junto ao rio.',
        type: 'viewpoint',
        lat: 40.7534,
        lng: -8.3896,
        i18n: {
          en: { name: 'Cabreia Waterfall', description: 'A waterfall surrounded by woods, with a picnic area by the river.' },
          es: { name: 'Cascada de la Cabreia', description: 'Cascada rodeada de bosque, con merendero junto al río.' },
          fr: { name: 'Cascade de la Cabreia', description: 'Une cascade entourée de bois, avec une aire de pique-nique au bord de la rivière.' },
          de: { name: 'Wasserfall von Cabreia', description: 'Wasserfall im Wald mit Picknickplatz am Fluss.' },
        },
      },
    ],
    i18n: {
      en: { description: 'Two waterfalls on a ride through the UNESCO-listed Arouca Geopark. From Arouca you climb the Serra da Freita via Merujal to the Frecha da Mizarela, one of the highest waterfalls in mainland Portugal, seen from a viewpoint a few minutes on foot from the road. Then you drop towards the Vouga valley to the Cabreia waterfall, hidden in the woods, before finishing in Sever do Vouga.' },
      es: { description: 'Dos cascadas en una ruta por el Arouca Geopark, reconocido por la UNESCO. Desde Arouca se sube a la Serra da Freita por Merujal hasta la Frecha da Mizarela, una de las cascadas más altas del Portugal continental, que se ve desde un mirador a pocos minutos a pie de la carretera. Después se baja hacia el valle del Vouga hasta la cascada de la Cabreia, en medio del bosque, para terminar en Sever do Vouga.' },
      fr: { description: "Deux cascades sur un itinéraire à travers l'Arouca Geopark, labellisé par l'UNESCO. D'Arouca, on monte dans la Serra da Freita par Merujal jusqu'à la Frecha da Mizarela, l'une des plus hautes cascades du Portugal continental, visible depuis un belvédère à quelques minutes à pied de la route. On redescend ensuite vers la vallée du Vouga jusqu'à la cascade de la Cabreia, en pleine forêt, avant de finir à Sever do Vouga." },
      de: { description: 'Zwei Wasserfälle auf einer Tour durch den von der UNESCO ausgezeichneten Arouca Geopark. Von Arouca geht es über Merujal hinauf in die Serra da Freita zur Frecha da Mizarela, einem der höchsten Wasserfälle des portugiesischen Festlands, den man von einem Aussichtspunkt wenige Gehminuten von der Straße sieht. Danach geht es hinunter ins Vouga-Tal zum Wasserfall von Cabreia im Wald und weiter bis Sever do Vouga.' },
    },
  },
  {
    title: 'Fraga da Pena e Piódão | Arganil > Benfeita > Mata da Margaraça > Piódão',
    description:
      'Estrada de montanha pela Paisagem Protegida da Serra do Açor até à aldeia histórica do Piódão. Saindo de Arganil, passa-se pela Benfeita e pela Mata da Margaraça, onde um trilho curto desce até à cascata da Fraga da Pena. Daí a estrada sobe pela serra com curvas apertadas e vistas sobre vales de xisto até ao Piódão, com as casas em anfiteatro na encosta. Estrada estreita: abasteça em Arganil antes de subir a serra.',
    region: 'Centro',
    category: 'mountain',
    difficulty: 'challenging',
    route_type: 'out_and_back',
    waypoints: [
      [40.2202, -7.9807], // Arganil
      [40.2301, -7.9444], // Benfeita
      [40.2251, -7.9324], // Pardieiros
      [40.2296, -7.8248], // Piódão
    ],
    stops: [
      {
        name: 'Fraga da Pena',
        description: 'Cascata na Mata da Margaraça, a poucos minutos a pé por um trilho a partir da estrada.',
        type: 'viewpoint',
        lat: 40.2184,
        lng: -7.935,
        i18n: {
          en: { description: 'A waterfall in the Mata da Margaraça, a short walk along a trail from the road.' },
          es: { description: 'Cascada en la Mata da Margaraça, a pocos minutos a pie por un sendero desde la carretera.' },
          fr: { description: 'Une cascade dans la Mata da Margaraça, à quelques minutes de marche par un sentier depuis la route.' },
          de: { description: 'Wasserfall in der Mata da Margaraça, wenige Gehminuten über einen Pfad von der Straße.' },
        },
      },
      {
        name: 'Mata da Margaraça',
        description: 'Floresta de carvalhos e castanheiros, uma das últimas manchas de mata original da região.',
        type: 'viewpoint',
        lat: 40.2163,
        lng: -7.919,
        i18n: {
          en: { description: 'Oak and chestnut woodland, one of the last stretches of native forest in the area.' },
          es: { description: 'Bosque de robles y castaños, una de las últimas manchas de bosque original de la zona.' },
          fr: { description: "Forêt de chênes et de châtaigniers, l'un des derniers îlots de forêt d'origine de la région." },
          de: { description: 'Eichen- und Kastanienwald, eines der letzten Stücke ursprünglichen Waldes der Gegend.' },
        },
      },
      {
        name: 'Piódão',
        description: 'Aldeia histórica de xisto, com cafés e restaurantes na praça junto à igreja.',
        type: 'restaurant',
        lat: 40.2296,
        lng: -7.8248,
        i18n: {
          en: { description: 'A historic schist village, with cafés and restaurants on the square by the church.' },
          es: { description: 'Aldea histórica de pizarra, con cafés y restaurantes en la plaza junto a la iglesia.' },
          fr: { description: "Village historique de schiste, avec cafés et restaurants sur la place près de l'église." },
          de: { description: 'Historisches Schieferdorf mit Cafés und Restaurants am Platz bei der Kirche.' },
        },
      },
    ],
    i18n: {
      en: { title: 'Fraga da Pena and Piódão | Arganil > Benfeita > Mata da Margaraça > Piódão', description: 'A mountain road through the Serra do Açor Protected Landscape to the historic village of Piódão. Leaving Arganil, you pass Benfeita and the Mata da Margaraça, where a short trail leads down to the Fraga da Pena waterfall. From there the road climbs with tight bends and views over schist valleys to Piódão, its houses stacked up the hillside. A narrow road: fill up in Arganil before heading into the hills.' },
      es: { description: 'Carretera de montaña por el Paisaje Protegido de la Serra do Açor hasta la aldea histórica de Piódão. Saliendo de Arganil se pasa por Benfeita y la Mata da Margaraça, donde un sendero corto baja hasta la cascada de la Fraga da Pena. Desde allí la carretera sube por la sierra con curvas cerradas y vistas sobre valles de pizarra hasta Piódão, con sus casas en anfiteatro en la ladera. Carretera estrecha: reposta en Arganil antes de subir a la sierra.' },
      fr: { description: "Une route de montagne à travers le paysage protégé de la Serra do Açor jusqu'au village historique de Piódão. En quittant Arganil, on passe par Benfeita et la Mata da Margaraça, d'où un court sentier descend à la cascade de la Fraga da Pena. La route grimpe ensuite en lacets serrés, avec des vues sur les vallées de schiste, jusqu'à Piódão et ses maisons en amphithéâtre. Route étroite : faites le plein à Arganil avant de monter dans la montagne." },
      de: { description: 'Eine Bergstraße durch das Landschaftsschutzgebiet der Serra do Açor bis zum historischen Dorf Piódão. Hinter Arganil geht es durch Benfeita und die Mata da Margaraça, wo ein kurzer Pfad zum Wasserfall Fraga da Pena hinunterführt. Danach steigt die Straße mit engen Kehren und Blick auf Schiefertäler bis Piódão, dessen Häuser sich am Hang stapeln. Schmale Straße: vor der Auffahrt in Arganil volltanken.' },
    },
  },
];
