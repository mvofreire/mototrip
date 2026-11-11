/**
 * Curated motorcycle routes in Spain.
 *
 * Same format as curated_routes_pt.ts: waypoints are [lat, lng] and force the
 * router onto the intended roads. Geometry, distance, duration and elevation
 * are computed by jobs/import_curated_routes.ts (run with --dataset=es).
 */

import type { CuratedRoute } from './curated_routes_pt';

export const CURATED_ROUTES_ES: CuratedRoute[] = [
  // ─────────────────────────── PICOS DE EUROPA ───────────────────────────
  {
    title: 'Picos de Europa | Desfiladeiro de La Hermida > Potes > Fuente Dé',
    description:
      'A N-621 entra nos Picos de Europa pelo Desfiladeiro de La Hermida, um canhão estreito de 20 km escavado pelo rio Deva, com paredes de calcário de centenas de metros de cada lado. Depois de Potes, capital da Liébana, a CA-185 sobe pelo vale até Fuente Dé, onde a estrada termina ao pé de um circo glaciar e do teleférico que sobe aos 1.800 m.',
    region: 'Picos de Europa',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    featured: true,
    waypoints: [
      [43.3234, -4.584], // Panes
      [43.2549, -4.6148], // La Hermida
      [43.2153, -4.5903], // Lebeña
      [43.1537, -4.6234], // Potes
      [43.1278, -4.787], // Espinama
      [43.1488, -4.8088], // Fuente Dé
    ],
    stops: [
      {
        name: 'Mirador del Salmón',
        description: 'Paragem no coração do desfiladeiro, sobre o rio Deva.',
        type: 'viewpoint',
        lat: 43.2633,
        lng: -4.6215,
      },
      {
        name: 'Santa María de Lebeña',
        description: 'Igreja moçárabe do século X, a poucos metros da estrada.',
        type: 'landmark',
        lat: 43.2153,
        lng: -4.5903,
      },
      {
        name: 'Torre del Infantado',
        description: 'Torre medieval no centro de Potes — boa paragem para almoçar um cozido lebaniego.',
        type: 'restaurant',
        lat: 43.1541,
        lng: -4.6236,
      },
      {
        name: 'Teleférico de Fuente Dé',
        description: 'Fim da estrada e subida de teleférico ao miradouro do Cable, a 1.823 m.',
        type: 'viewpoint',
        lat: 43.1488,
        lng: -4.8088,
      },
    ],
  },
  {
    title: 'Grande Volta dos Picos | Cangas de Onís > Los Beyos > San Glorio > Potes',
    description:
      'A volta clássica aos Picos de Europa, por três comunidades autónomas. Desce o Desfiladeiro de Los Beyos pela N-625, sobe ao Puerto del Pontón e passa pela albufeira de Riaño. Segue-se o Puerto de San Glorio, a 1.609 m, uma das subidas mais bonitas do norte de Espanha, e a descida até Potes. Fecha pelo Desfiladeiro de La Hermida e pelo vale do Cares até Cangas de Onís. Um dia inteiro de curvas.',
    region: 'Picos de Europa',
    category: 'mountain',
    difficulty: 'challenging',
    route_type: 'loop',
    featured: true,
    waypoints: [
      [43.3507, -5.129], // Cangas de Onís
      [43.1502, -5.0701], // Desfiladero de los Beyos
      [43.137, -5.0389], // Oseja de Sajambre
      [43.0999, -5.0189], // Puerto del Pontón
      [42.9756, -5.0057], // Riaño
      [42.973, -4.9254], // Boca de Huérgano
      [43.0668, -4.7665], // Puerto de San Glorio
      [43.1537, -4.6234], // Potes
      [43.2549, -4.6148], // La Hermida
      [43.3234, -4.584], // Panes
      [43.3034, -4.8147], // Arenas de Cabrales
      [43.3507, -5.129], // Cangas de Onís
    ],
    stops: [
      {
        name: 'Puente Romano de Cangas de Onís',
        description: 'Ponto de partida junto à ponte medieval sobre o rio Sella.',
        type: 'landmark',
        lat: 43.3502,
        lng: -5.1321,
      },
      {
        name: 'Mirador de Oseja de Sajambre',
        description: 'Vista sobre o vale de Sajambre logo à saída do desfiladeiro.',
        type: 'viewpoint',
        lat: 43.1291,
        lng: -5.0318,
      },
      {
        name: 'Riaño',
        description: 'Vila reconstruída junto à albufeira — paragem para café e combustível.',
        type: 'gas_station',
        lat: 42.9756,
        lng: -5.0057,
      },
      {
        name: 'Puerto de San Glorio',
        description: 'Ponto mais alto da volta, a 1.609 m, com vista para o maciço oriental dos Picos.',
        type: 'viewpoint',
        lat: 43.0668,
        lng: -4.7665,
      },
      {
        name: 'Potes',
        description: 'Almoço na capital da Liébana antes de descer o desfiladeiro.',
        type: 'restaurant',
        lat: 43.1541,
        lng: -4.6236,
      },
      {
        name: 'Arenas de Cabrales',
        description: 'Terra do queijo de Cabrales, à entrada do vale do Cares.',
        type: 'cafe',
        lat: 43.3034,
        lng: -4.8147,
      },
    ],
  },

  // ────────────────────────────── PIRENÉUS ──────────────────────────────
  {
    title: 'Pirenéus Aragoneses | Jaca > Vale de Tena > Col du Pourtalet',
    description:
      'Subida pelo Vale de Tena desde Jaca até à fronteira francesa no Col du Pourtalet, a 1.794 m. A A-136 acompanha o rio Gállego, passa pelas albufeiras de Búbal e de Lanuza e pela vila de Sallent de Gállego, sempre com os picos pirenaicos à frente. Os últimos quilómetros até ao colo são abertos e rápidos, com vista para o Pic du Midi d’Ossau.',
    region: 'Pirenéus',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    waypoints: [
      [42.5693, -0.5494], // Jaca
      [42.5184, -0.3648], // Sabiñánigo
      [42.6286, -0.3216], // Biescas
      [42.7014, -0.3135], // Embalse de Búbal
      [42.775, -0.3591], // Sallent de Gállego
      [42.8059, -0.4185], // Col du Pourtalet
    ],
    stops: [
      {
        name: 'Ciudadela de Jaca',
        description: 'Fortaleza pentagonal do século XVI no ponto de partida.',
        type: 'landmark',
        lat: 42.5723,
        lng: -0.5521,
      },
      {
        name: 'Embalse de Búbal',
        description: 'Albufeira turquesa no meio do vale, com várias zonas para parar.',
        type: 'viewpoint',
        lat: 42.7014,
        lng: -0.3135,
      },
      {
        name: 'Sallent de Gállego',
        description: 'Vila de montanha com ponte medieval — último café antes da fronteira.',
        type: 'cafe',
        lat: 42.775,
        lng: -0.3591,
      },
      {
        name: 'Col du Pourtalet',
        description: 'Fronteira com França a 1.794 m, de frente para o Pic du Midi d’Ossau.',
        type: 'viewpoint',
        lat: 42.8059,
        lng: -0.4185,
      },
    ],
  },
  {
    title: 'Ordesa e Sobrarbe | Biescas > Cotefablo > Torla > Aínsa',
    description:
      'Travessia do Alto Aragão pela N-260, que sobe ao Puerto de Cotefablo por uma sequência de ganchos e desce até Broto e Torla, porta de entrada do Parque Nacional de Ordesa y Monte Perdido. Segue depois pelo vale do Ara, estreito e cheio de curvas, até à vila medieval de Aínsa, uma das mais bonitas de Espanha.',
    region: 'Pirenéus',
    category: 'mountain',
    difficulty: 'challenging',
    route_type: 'out_and_back',
    waypoints: [
      [42.6286, -0.3216], // Biescas
      [42.6163, -0.21], // Puerto de Cotefablo
      [42.6189, -0.1703], // Linás de Broto
      [42.6277, -0.1121], // Torla
      [42.6033, -0.1218], // Broto
      [42.4955, -0.1198], // Fiscal
      [42.4172, 0.1386], // Aínsa
    ],
    stops: [
      {
        name: 'Puerto de Cotefablo',
        description: 'Passagem a 1.423 m entre o Vale de Tena e o vale do Ara.',
        type: 'viewpoint',
        lat: 42.6163,
        lng: -0.21,
      },
      {
        name: 'Torla',
        description: 'Aldeia de pedra à entrada do Parque Nacional de Ordesa, com o Mondarruego por trás.',
        type: 'landmark',
        lat: 42.6277,
        lng: -0.1121,
      },
      {
        name: 'Fiscal',
        description: 'Paragem a meio do vale do Ara, com ponte medieval sobre o rio.',
        type: 'cafe',
        lat: 42.4955,
        lng: -0.1198,
      },
      {
        name: 'Plaza Mayor de Aínsa',
        description: 'Chegada à praça porticada da vila medieval, com castelo e vista para a Peña Montañesa.',
        type: 'restaurant',
        lat: 42.4185,
        lng: 0.1388,
      },
    ],
  },
  {
    title: 'Pirenéus Catalães | Sort > Port de la Bonaigua > Vielha',
    description:
      'Uma das grandes subidas dos Pirenéus. A C-28 sai do Pallars Sobirà, passa por Esterri d’Àneu e sobe ao Port de la Bonaigua, a 2.072 m, por uma estrada larga e bem asfaltada com ganchos encadeados. Do outro lado desce-se ao Val d’Aran, passando por Baqueira, até Vielha.',
    region: 'Pirenéus',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    featured: true,
    waypoints: [
      [42.4115, 1.1298], // Sort
      [42.6275, 1.1229], // Esterri d'Àneu
      [42.6635, 0.9825], // Port de la Bonaigua
      [42.6993, 0.9316], // Baqueira
      [42.7018, 0.7955], // Vielha
    ],
    stops: [
      {
        name: 'Esterri d’Àneu',
        description: 'Última vila do Pallars antes da subida — bom sítio para abastecer.',
        type: 'gas_station',
        lat: 42.6275,
        lng: 1.1229,
      },
      {
        name: 'Port de la Bonaigua',
        description: 'Colo a 2.072 m, com refúgio e vista sobre os dois vales.',
        type: 'viewpoint',
        lat: 42.6635,
        lng: 0.9825,
      },
      {
        name: 'Vielha',
        description: 'Capital do Val d’Aran, com igreja românica e boa oferta de restaurantes.',
        type: 'restaurant',
        lat: 42.7018,
        lng: 0.7955,
      },
    ],
  },

  // ───────────────────────────── ANDALUZIA ─────────────────────────────
  {
    title: 'Serra de Grazalema | Ronda > Puerto de las Palomas > Zahara > Setenil',
    description:
      'Volta pelos pueblos blancos da Serra de Cádiz a partir de Ronda. A estrada até Grazalema atravessa a serra entre azinheiras, e a subida ao Puerto de las Palomas, a 1.357 m, é uma sucessão de ganchos sobre a albufeira de Zahara-El Gastor. O regresso passa por Olvera e por Setenil de las Bodegas, com as casas construídas debaixo da rocha.',
    region: 'Andaluzia',
    category: 'scenic',
    difficulty: 'challenging',
    route_type: 'loop',
    featured: true,
    waypoints: [
      [36.7421, -5.1666], // Ronda
      [36.7584, -5.3661], // Grazalema
      [36.7975, -5.3826], // Puerto de las Palomas
      [36.8406, -5.3905], // Zahara de la Sierra
      [36.9349, -5.2601], // Olvera
      [36.8622, -5.1787], // Setenil de las Bodegas
      [36.7421, -5.1666], // Ronda
    ],
    stops: [
      {
        name: 'Puente Nuevo',
        description: 'A ponte sobre o Tajo de Ronda, ponto de partida e chegada.',
        type: 'landmark',
        lat: 36.7407,
        lng: -5.1659,
      },
      {
        name: 'Grazalema',
        description: 'Pueblo blanco no coração do parque natural — café na praça.',
        type: 'cafe',
        lat: 36.7584,
        lng: -5.3661,
      },
      {
        name: 'Puerto de las Palomas',
        description: 'Ponto alto da volta, com vista sobre Zahara e a albufeira.',
        type: 'viewpoint',
        lat: 36.7975,
        lng: -5.3826,
      },
      {
        name: 'Setenil de las Bodegas',
        description: 'Ruas com casas escavadas na rocha — boa paragem para almoçar.',
        type: 'restaurant',
        lat: 36.8622,
        lng: -5.1787,
      },
    ],
  },
  {
    title: 'Alpujarras | Lanjarón > Barranco de Poqueira > Trevélez',
    description:
      'Estrada de montanha pela vertente sul da Serra Nevada, entre aldeias brancas de origem moura penduradas na encosta. De Lanjarón a Órgiva o vale é largo; depois a estrada sobe ao Barranco de Poqueira, com Pampaneira, Bubión e Capileira umas por cima das outras, e segue a meia encosta até Trevélez, uma das aldeias mais altas de Espanha, famosa pelo presunto.',
    region: 'Andaluzia',
    category: 'mountain',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    waypoints: [
      [36.9181, -3.4802], // Lanjarón
      [36.899, -3.424], // Órgiva
      [36.9406, -3.361], // Pampaneira
      [36.9615, -3.3585], // Capileira
      [36.943, -3.311], // Pórtugos
      [37.0024, -3.2666], // Trevélez
    ],
    stops: [
      {
        name: 'Lanjarón',
        description: 'Vila termal à entrada das Alpujarras.',
        type: 'cafe',
        lat: 36.9181,
        lng: -3.4802,
      },
      {
        name: 'Barranco de Poqueira',
        description: 'Pampaneira, Bubión e Capileira empilhadas na encosta do barranco.',
        type: 'viewpoint',
        lat: 36.9406,
        lng: -3.361,
      },
      {
        name: 'Trevélez',
        description: 'Chegada a 1.476 m — almoço com presunto de Trevélez.',
        type: 'restaurant',
        lat: 37.0024,
        lng: -3.2666,
      },
    ],
  },

  // ─────────────────────────────── GALIZA ───────────────────────────────
  {
    title: 'Serra da Capelada | Cedeira > Santo André de Teixido > Cabo Ortegal',
    description:
      'Uma das estradas mais espetaculares da costa galega. A partir de Cedeira, a estrada sobe à Serra da Capelada e corre pelo topo das falésias mais altas da Europa continental, com o Atlântico centenas de metros abaixo. Passa pelo santuário de Santo André de Teixido e pela Vixía da Herbeira antes de descer a Cariño e ao farol do Cabo Ortegal.',
    region: 'Galiza',
    category: 'coastal',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    featured: true,
    waypoints: [
      [43.661, -8.056], // Cedeira
      [43.7027, -7.9908], // Santo André de Teixido
      [43.7235, -7.9458], // Garita da Herbeira
      [43.74, -7.868], // Cariño
      [43.7737, -7.8685], // Cabo Ortegal
    ],
    stops: [
      {
        name: 'Santo André de Teixido',
        description: 'Santuário e aldeia sobre o mar — "vai de morto quem não foi de vivo".',
        type: 'landmark',
        lat: 43.7027,
        lng: -7.9908,
      },
      {
        name: 'Vixía da Herbeira',
        description: 'Miradouro no topo das falésias, a mais de 600 m sobre o Atlântico.',
        type: 'viewpoint',
        lat: 43.7236,
        lng: -7.9458,
      },
      {
        name: 'Cariño',
        description: 'Vila piscatória para almoçar marisco antes do cabo.',
        type: 'restaurant',
        lat: 43.74,
        lng: -7.868,
      },
      {
        name: 'Cabo Ortegal',
        description: 'Farol sobre os ilhéus dos Aguillóns, onde o Cantábrico encontra o Atlântico.',
        type: 'viewpoint',
        lat: 43.7737,
        lng: -7.8685,
      },
    ],
  },

  // ──────────────────────────── COSTA BRAVA ────────────────────────────
  {
    title: 'Costa Brava | Lloret de Mar > Tossa de Mar > Sant Feliu pela GI-682',
    description:
      'A GI-682 entre Tossa de Mar e Sant Feliu de Guíxols é conhecida pelas suas centenas de curvas, coladas às falésias sobre o Mediterrâneo. A estrada é estreita e quase sempre com vista para enseadas de água transparente. Começa em Lloret de Mar e passa pela Vila Vella de Tossa, a única vila medieval fortificada da costa catalã.',
    region: 'Costa Brava',
    category: 'coastal',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    waypoints: [
      [41.6974, 2.8392], // Lloret de Mar
      [41.7198, 2.9312], // Tossa de Mar
      [41.7554, 2.9739], // GI-682, a meio da costa
      [41.7839, 3.0283], // Sant Feliu de Guíxols
    ],
    stops: [
      {
        name: 'Vila Vella de Tossa',
        description: 'Muralhas medievais sobre a praia — paragem obrigatória.',
        type: 'landmark',
        lat: 41.7168,
        lng: 2.934,
      },
      {
        name: 'Ermita de Sant Elm',
        description: 'Miradouro sobre Sant Feliu e a costa, no fim da GI-682.',
        type: 'viewpoint',
        lat: 41.7746,
        lng: 3.0274,
      },
      {
        name: 'Passeig del Mar de Sant Feliu',
        description: 'Chegada à marginal de Sant Feliu de Guíxols, com esplanadas para descansar.',
        type: 'cafe',
        lat: 41.7805,
        lng: 3.0315,
      },
    ],
  },
  {
    title: 'Cap de Creus | Llançà > Sant Pere de Rodes > Roses > Cadaqués',
    description:
      'Volta pela península do Cap de Creus, o extremo oriental da Península Ibérica. Sai de Llançà pela costa até El Port de la Selva e sobe por uma estrada estreita e sinuosa até ao mosteiro de Sant Pere de Rodes, com vista sobre todo o golfo. Desce a Vilajuïga e Roses e segue pela GI-614, que sobe ao colo de Perafita em curvas largas antes de cair sobre Cadaqués, a vila branca que inspirou Dalí.',
    region: 'Costa Brava',
    category: 'coastal',
    difficulty: 'moderate',
    route_type: 'out_and_back',
    waypoints: [
      [42.364, 3.153], // Llançà
      [42.337, 3.204], // El Port de la Selva
      [42.3233, 3.1663], // Sant Pere de Rodes
      [42.326, 3.093], // Vilajuïga
      [42.2632, 3.1755], // Roses
      [42.2893, 3.2752], // Cadaqués
      [42.294, 3.2864], // Portlligat
    ],
    stops: [
      {
        name: 'El Port de la Selva',
        description: 'Vila piscatória na baía, boa paragem para café antes da subida.',
        type: 'cafe',
        lat: 42.337,
        lng: 3.204,
      },
      {
        name: 'Monestir de Sant Pere de Rodes',
        description: 'Mosteiro românico a 500 m de altitude, com vista sobre o Cap de Creus e o golfo de Roses.',
        type: 'viewpoint',
        lat: 42.3233,
        lng: 3.1663,
      },
      {
        name: 'Cadaqués',
        description: 'Vila branca à beira-mar — almoço na marginal.',
        type: 'restaurant',
        lat: 42.2893,
        lng: 3.2752,
      },
      {
        name: 'Casa-Museu Dalí de Portlligat',
        description: 'A casa onde Salvador Dalí viveu, numa pequena baía de pescadores. O farol do Cap de Creus fica a 4 km (acesso condicionado no verão).',
        type: 'landmark',
        lat: 42.294,
        lng: 3.2864,
      },
    ],
  },
];
