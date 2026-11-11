/**
 * Curated motorcycle routes in France.
 *
 * Same format as curated_routes_pt.ts: waypoints are [lat, lng] and force the
 * router onto the intended roads. Geometry, distance, duration and elevation
 * are computed by jobs/import_curated_routes.ts (run with --dataset=fr).
 * The original text is Portuguese; `i18n` holds the en/es/fr/de versions.
 */

import type { CuratedRoute } from "./curated_routes_pt";

export const CURATED_ROUTES_FR: CuratedRoute[] = [
  // ─────────────────────────────── ALPES ───────────────────────────────
  {
    title: "Col de l'Iseran | Bourg-Saint-Maurice > Val d'Isère > Bonneval-sur-Arc",
    description:
      "A estrada pavimentada mais alta dos Alpes: a D902 sobe de Bourg-Saint-Maurice, passa pela barragem de Tignes e por Val d'Isère e chega aos 2.764 m do Col de l'Iseran, entre neve e glaciares. A descida para Bonneval-sur-Arc, uma das aldeias mais bonitas de França, é estreita e sem proteções. Aberto apenas de junho a outubro.",
    region: "Alpes",
    category: "mountain",
    difficulty: "challenging",
    route_type: "out_and_back",
    featured: true,
    waypoints: [
      [45.6186, 6.769], // Bourg-Saint-Maurice
      [45.4963, 6.9378], // Lac du Chevril (Tignes)
      [45.4486, 6.98], // Val d'Isère
      [45.417, 7.0306], // Col de l'Iseran
      [45.3717, 7.0458], // Bonneval-sur-Arc
    ],
    stops: [
      {
        name: "Barrage de Tignes",
        description: "Paragem sobre o lago do Chevril, com o fresco gigante pintado na parede da barragem.",
        type: "viewpoint",
        lat: 45.4963,
        lng: 6.9378,
        i18n: {
          en: { description: "Stop above the Chevril lake, with the giant mural painted on the dam wall." },
          es: { description: "Parada sobre el lago del Chevril, con el fresco gigante pintado en el muro de la presa." },
          fr: { description: "Arrêt au-dessus du lac du Chevril, avec la fresque géante peinte sur le mur du barrage." },
          de: { description: "Halt über dem Lac du Chevril mit dem riesigen Wandbild auf der Staumauer." },
        },
      },
      {
        name: "Col de l'Iseran (2.764 m)",
        description: "A placa do colo mais alto dos Alpes, com a capela e o refúgio ao lado.",
        type: "viewpoint",
        lat: 45.417,
        lng: 7.0306,
        i18n: {
          en: { name: "Col de l'Iseran (2,764 m)", description: "The sign of the highest pass in the Alps, with the chapel and refuge next to it." },
          es: { description: "El cartel del puerto más alto de los Alpes, con la capilla y el refugio al lado." },
          fr: { name: "Col de l'Iseran (2 764 m)", description: "Le panneau du plus haut col des Alpes, avec la chapelle et le refuge à côté." },
          de: { name: "Col de l'Iseran (2.764 m)", description: "Das Schild des höchsten Alpenpasses, daneben Kapelle und Hütte." },
        },
      },
      {
        name: "Bonneval-sur-Arc",
        description: "Aldeia de pedra e lousa no fundo do vale — bom sítio para almoçar.",
        type: "restaurant",
        lat: 45.3717,
        lng: 7.0458,
        i18n: {
          en: { description: "Stone and slate village at the bottom of the valley — a good place for lunch." },
          es: { description: "Pueblo de piedra y pizarra al fondo del valle, buen sitio para comer." },
          fr: { description: "Village de pierre et de lauze au fond de la vallée — une bonne étape pour déjeuner." },
          de: { description: "Dorf aus Stein und Schiefer am Talende – gut zum Mittagessen." },
        },
      },
    ],
    i18n: {
      en: { description: "The highest paved road in the Alps: the D902 climbs from Bourg-Saint-Maurice past the Tignes dam and Val d'Isère to the 2,764 m Col de l'Iseran, between snow and glaciers. The descent to Bonneval-sur-Arc, one of the prettiest villages in France, is narrow and has no barriers. Open from June to October only." },
      es: { description: "La carretera asfaltada más alta de los Alpes: la D902 sube desde Bourg-Saint-Maurice, pasa por la presa de Tignes y por Val d'Isère y llega a los 2.764 m del Col de l'Iseran, entre nieve y glaciares. La bajada a Bonneval-sur-Arc, uno de los pueblos más bonitos de Francia, es estrecha y sin quitamiedos. Abierto solo de junio a octubre." },
      fr: { description: "La plus haute route goudronnée des Alpes : la D902 monte de Bourg-Saint-Maurice, longe le barrage de Tignes et Val d'Isère, puis atteint les 2 764 m du col de l'Iseran, entre neige et glaciers. La descente vers Bonneval-sur-Arc, l'un des plus beaux villages de France, est étroite et sans glissières. Ouvert de juin à octobre seulement." },
      de: { description: "Die höchste asphaltierte Straße der Alpen: Die D902 steigt von Bourg-Saint-Maurice vorbei an der Staumauer von Tignes und Val d'Isère auf die 2.764 m des Col de l'Iseran, zwischen Schnee und Gletschern. Die Abfahrt nach Bonneval-sur-Arc, einem der schönsten Dörfer Frankreichs, ist schmal und ohne Leitplanken. Nur von Juni bis Oktober geöffnet." },
    },
  },
  {
    title: "Col du Galibier | Saint-Michel-de-Maurienne > Télégraphe > Galibier > La Grave",
    description:
      "Dois colos lendários do Tour de France numa só subida: o Col du Télégraphe, com curvas em floresta, e depois de Valloire os 2.642 m do Galibier, numa paisagem lunar de rocha e neve. A descida pelo Col du Lautaret abre para os glaciares de La Meije, frente à aldeia de La Grave. Estrada estreita no topo e fechada no inverno.",
    region: "Alpes",
    category: "mountain",
    difficulty: "challenging",
    route_type: "out_and_back",
    featured: true,
    waypoints: [
      [45.2203, 6.47], // Saint-Michel-de-Maurienne
      [45.203, 6.4446], // Col du Télégraphe
      [45.165, 6.429], // Valloire
      [45.0641, 6.4078], // Col du Galibier
      [45.0353, 6.4049], // Col du Lautaret
      [45.0456, 6.306], // La Grave
    ],
    stops: [
      {
        name: "Valloire",
        description: "Estância de montanha entre os dois colos — café e combustível antes do Galibier.",
        type: "gas_station",
        lat: 45.165,
        lng: 6.429,
        i18n: {
          en: { description: "Mountain resort between the two passes — coffee and fuel before the Galibier." },
          es: { description: "Estación de montaña entre los dos puertos: café y gasolina antes del Galibier." },
          fr: { description: "Station entre les deux cols — café et carburant avant le Galibier." },
          de: { description: "Bergort zwischen den beiden Pässen – Kaffee und Tanken vor dem Galibier." },
        },
      },
      {
        name: "Col du Galibier (2.642 m)",
        description: "Topo do colo com vista sobre o maciço dos Écrins e o monumento a Henri Desgrange.",
        type: "viewpoint",
        lat: 45.0641,
        lng: 6.4078,
        i18n: {
          en: { name: "Col du Galibier (2,642 m)", description: "Top of the pass with views over the Écrins massif and the Henri Desgrange monument." },
          es: { description: "Cima del puerto con vistas al macizo de los Écrins y el monumento a Henri Desgrange." },
          fr: { name: "Col du Galibier (2 642 m)", description: "Sommet du col avec vue sur le massif des Écrins et le monument Henri Desgrange." },
          de: { name: "Col du Galibier (2.642 m)", description: "Passhöhe mit Blick auf das Écrins-Massiv und das Henri-Desgrange-Denkmal." },
        },
      },
      {
        name: "La Grave",
        description: "Terraços com vista direta para os glaciares de La Meije.",
        type: "cafe",
        lat: 45.0456,
        lng: 6.306,
        i18n: {
          en: { description: "Terraces looking straight at the glaciers of La Meije." },
          es: { description: "Terrazas con vistas directas a los glaciares de La Meije." },
          fr: { description: "Des terrasses face aux glaciers de la Meije." },
          de: { description: "Terrassen mit direktem Blick auf die Gletscher der Meije." },
        },
      },
    ],
    i18n: {
      en: { description: "Two legendary Tour de France passes in one climb: the Col du Télégraphe, with bends through the forest, and after Valloire the 2,642 m Galibier, in a lunar landscape of rock and snow. The descent via the Col du Lautaret opens onto the glaciers of La Meije, opposite the village of La Grave. Narrow road at the top and closed in winter." },
      es: { description: "Dos puertos legendarios del Tour de Francia en una sola subida: el Col du Télégraphe, con curvas entre bosque, y después de Valloire los 2.642 m del Galibier, en un paisaje lunar de roca y nieve. La bajada por el Col du Lautaret se abre a los glaciares de La Meije, frente al pueblo de La Grave. Carretera estrecha arriba y cerrada en invierno." },
      fr: { description: "Deux cols mythiques du Tour de France en une seule montée : le col du Télégraphe, en lacets dans la forêt, puis après Valloire les 2 642 m du Galibier, dans un paysage lunaire de roche et de neige. La descente par le col du Lautaret s'ouvre sur les glaciers de la Meije, face au village de La Grave. Route étroite au sommet et fermée l'hiver." },
      de: { description: "Zwei legendäre Tour-de-France-Pässe in einem Anstieg: der Col du Télégraphe mit Kurven durch den Wald und nach Valloire der 2.642 m hohe Galibier in einer Mondlandschaft aus Fels und Schnee. Die Abfahrt über den Col du Lautaret öffnet den Blick auf die Gletscher der Meije gegenüber von La Grave. Oben schmale Straße, im Winter gesperrt." },
    },
  },
  {
    title: "Col d'Izoard | Briançon > Casse Déserte > Guillestre",
    description:
      "De Briançon, a cidade fortificada mais alta da Europa, a D902 sobe em ganchos pela floresta até aos 2.360 m do Col d'Izoard. Do outro lado fica a Casse Déserte, um vale de rochas e cascalho que parece outro planeta. A descida segue pela Combe du Queyras, um desfiladeiro estreito que termina em Guillestre.",
    region: "Alpes",
    category: "mountain",
    difficulty: "challenging",
    route_type: "out_and_back",
    waypoints: [
      [44.8986, 6.6436], // Briançon
      [44.8686, 6.7236], // Cervières
      [44.8203, 6.735], // Col d'Izoard
      [44.7655, 6.7323], // Arvieux
      [44.6597, 6.6489], // Guillestre
    ],
    stops: [
      {
        name: "Cidade fortificada de Briançon",
        description: "Muralhas de Vauban classificadas pela UNESCO, no ponto de partida.",
        type: "landmark",
        lat: 44.8986,
        lng: 6.6436,
        i18n: {
          en: { name: "Briançon walled town", description: "UNESCO-listed Vauban fortifications at the start." },
          es: { name: "Ciudad fortificada de Briançon", description: "Murallas de Vauban declaradas Patrimonio de la UNESCO, en el punto de salida." },
          fr: { name: "Cité Vauban de Briançon", description: "Fortifications de Vauban classées à l'UNESCO, au point de départ." },
          de: { name: "Festungsstadt Briançon", description: "Vauban-Befestigungen (UNESCO-Welterbe) am Startpunkt." },
        },
      },
      {
        name: "Casse Déserte",
        description: "Paisagem de rocha e cascalho logo abaixo do colo, com placa a Fausto Coppi.",
        type: "viewpoint",
        lat: 44.807,
        lng: 6.742,
        i18n: {
          en: { description: "Rock and scree landscape just below the pass, with a plaque to Fausto Coppi." },
          es: { description: "Paisaje de roca y pedregal justo debajo del puerto, con una placa a Fausto Coppi." },
          fr: { description: "Paysage de roche et d'éboulis juste sous le col, avec la stèle de Fausto Coppi." },
          de: { description: "Fels- und Gerölllandschaft knapp unter dem Pass, mit Gedenktafel für Fausto Coppi." },
        },
      },
    ],
    i18n: {
      en: { description: "From Briançon, the highest walled town in Europe, the D902 climbs in hairpins through the forest to the 2,360 m Col d'Izoard. On the other side lies the Casse Déserte, a valley of rocks and scree that looks like another planet. The descent continues through the Combe du Queyras, a narrow gorge that ends in Guillestre." },
      es: { description: "Desde Briançon, la ciudad fortificada más alta de Europa, la D902 sube en horquillas por el bosque hasta los 2.360 m del Col d'Izoard. Al otro lado está la Casse Déserte, un valle de rocas y pedregal que parece otro planeta. La bajada sigue por la Combe du Queyras, un desfiladero estrecho que termina en Guillestre." },
      fr: { description: "Depuis Briançon, la plus haute ville fortifiée d'Europe, la D902 monte en lacets dans la forêt jusqu'aux 2 360 m du col d'Izoard. De l'autre côté, la Casse Déserte, un vallon de rochers et d'éboulis qui semble venu d'une autre planète. La descente continue par la Combe du Queyras, une gorge étroite qui débouche sur Guillestre." },
      de: { description: "Von Briançon, der höchstgelegenen Festungsstadt Europas, windet sich die D902 in Kehren durch den Wald auf den 2.360 m hohen Col d'Izoard. Auf der anderen Seite liegt die Casse Déserte, ein Tal aus Fels und Geröll wie auf einem anderen Planeten. Die Abfahrt führt durch die enge Combe du Queyras nach Guillestre." },
    },
  },
  {
    title: "Col de la Bonette | Jausiers > Cime de la Bonette > Saint-Étienne-de-Tinée",
    description:
      "A D64 sobe de Jausiers até à Cime de la Bonette, onde um anel de asfalto contorna o pico a 2.802 m — o ponto mais alto de estrada asfaltada em França. Pouco trânsito, ruínas de quartéis militares e vistas até aos Alpes italianos. A descida para o vale da Tinée é longa e cheia de ganchos.",
    region: "Alpes",
    category: "mountain",
    difficulty: "expert",
    route_type: "out_and_back",
    waypoints: [
      [44.417, 6.73], // Jausiers
      [44.3266, 6.8063], // Cime de la Bonette
      [44.2564, 6.9244], // Saint-Étienne-de-Tinée
    ],
    stops: [
      {
        name: "Cime de la Bonette (2.802 m)",
        description: "Deixe a moto no anel e suba a pé cinco minutos até ao miradouro do pico.",
        type: "viewpoint",
        lat: 44.3266,
        lng: 6.8063,
        i18n: {
          en: { name: "Cime de la Bonette (2,802 m)", description: "Park on the loop and walk five minutes up to the summit viewpoint." },
          es: { description: "Deja la moto en el anillo y sube a pie cinco minutos hasta el mirador de la cima." },
          fr: { name: "Cime de la Bonette (2 802 m)", description: "Garez la moto sur la boucle et montez à pied cinq minutes jusqu'à la table d'orientation." },
          de: { name: "Cime de la Bonette (2.802 m)", description: "Motorrad an der Schleife abstellen und in fünf Minuten zum Gipfelaussichtspunkt laufen." },
        },
      },
      {
        name: "Saint-Étienne-de-Tinée",
        description: "Vila de montanha no fim da descida, com cafés e bomba de combustível.",
        type: "gas_station",
        lat: 44.2564,
        lng: 6.9244,
        i18n: {
          en: { description: "Mountain town at the end of the descent, with cafés and a fuel station." },
          es: { description: "Pueblo de montaña al final de la bajada, con cafés y gasolinera." },
          fr: { description: "Village de montagne au bas de la descente, avec cafés et station-service." },
          de: { description: "Bergort am Ende der Abfahrt mit Cafés und Tankstelle." },
        },
      },
    ],
    i18n: {
      en: { description: "The D64 climbs from Jausiers to the Cime de la Bonette, where a ring of tarmac circles the peak at 2,802 m — the highest point of paved road in France. Little traffic, ruined army barracks and views as far as the Italian Alps. The descent into the Tinée valley is long and full of hairpins." },
      es: { description: "La D64 sube desde Jausiers hasta la Cime de la Bonette, donde un anillo de asfalto rodea la cima a 2.802 m, el punto asfaltado más alto de Francia. Poco tráfico, ruinas de cuarteles militares y vistas hasta los Alpes italianos. La bajada al valle del Tinée es larga y llena de horquillas." },
      fr: { description: "La D64 monte de Jausiers à la cime de la Bonette, où une boucle de bitume fait le tour du sommet à 2 802 m — le point routier goudronné le plus haut de France. Peu de circulation, des ruines de casernes et une vue jusqu'aux Alpes italiennes. La descente vers la vallée de la Tinée est longue et pleine de lacets." },
      de: { description: "Die D64 führt von Jausiers zur Cime de la Bonette, wo eine Asphaltschleife den Gipfel auf 2.802 m umrundet – der höchste asphaltierte Straßenpunkt Frankreichs. Wenig Verkehr, verfallene Kasernen und Blick bis zu den italienischen Alpen. Die Abfahrt ins Tinée-Tal ist lang und voller Kehren." },
    },
  },
  {
    title: "Lago de Annecy | Annecy > Talloires > Col de la Forclaz > Duingt",
    description:
      "Volta curta ao lago mais limpo da Europa. A margem leste passa por Talloires e sobe ao Col de la Forclaz, onde os parapentes descolam sobre a água azul-turquesa. Regresso pela margem oeste, por Duingt e Sévrier. Ideal para meio dia, mas evite os fins de semana de verão.",
    region: "Alpes",
    category: "scenic",
    difficulty: "easy",
    route_type: "loop",
    waypoints: [
      [45.8992, 6.1294], // Annecy
      [45.8406, 6.2135], // Talloires
      [45.8138, 6.2464], // Col de la Forclaz
      [45.775, 6.2236], // Doussard
      [45.8275, 6.1981], // Duingt
      [45.8644, 6.1414], // Sévrier
      [45.8992, 6.1294], // Annecy
    ],
    stops: [
      {
        name: "Col de la Forclaz",
        description: "Miradouro sobre o lago com descolagens de parapente e cafés com esplanada.",
        type: "viewpoint",
        lat: 45.8138,
        lng: 6.2464,
        i18n: {
          en: { description: "Viewpoint over the lake with paragliders taking off and café terraces." },
          es: { description: "Mirador sobre el lago con despegues de parapente y cafés con terraza." },
          fr: { description: "Belvédère sur le lac, décollages de parapente et cafés en terrasse." },
          de: { description: "Aussichtspunkt über dem See mit startenden Gleitschirmen und Café-Terrassen." },
        },
      },
      {
        name: "Château de Duingt",
        description: "Castelo numa península no ponto mais estreito do lago.",
        type: "landmark",
        lat: 45.8275,
        lng: 6.1981,
        i18n: {
          en: { description: "Castle on a peninsula at the narrowest point of the lake." },
          es: { description: "Castillo en una península en el punto más estrecho del lago." },
          fr: { description: "Château sur une presqu'île, au point le plus étroit du lac." },
          de: { description: "Schloss auf einer Halbinsel an der engsten Stelle des Sees." },
        },
      },
    ],
    i18n: {
      en: { title: "Lake Annecy | Annecy > Talloires > Col de la Forclaz > Duingt", description: "A short loop around the cleanest lake in Europe. The east shore runs through Talloires and climbs to the Col de la Forclaz, where paragliders take off over the turquoise water. Back along the west shore via Duingt and Sévrier. Ideal for half a day, but avoid summer weekends." },
      es: { title: "Lago de Annecy | Annecy > Talloires > Col de la Forclaz > Duingt", description: "Vuelta corta al lago más limpio de Europa. La orilla este pasa por Talloires y sube al Col de la Forclaz, donde despegan los parapentes sobre el agua turquesa. Regreso por la orilla oeste, por Duingt y Sévrier. Ideal para media jornada, pero evita los fines de semana de verano." },
      fr: { title: "Lac d'Annecy | Annecy > Talloires > Col de la Forclaz > Duingt", description: "Une courte boucle autour du lac le plus pur d'Europe. La rive est passe par Talloires et monte au col de la Forclaz, d'où les parapentes s'élancent au-dessus de l'eau turquoise. Retour par la rive ouest, via Duingt et Sévrier. Idéal pour une demi-journée, mais évitez les week-ends d'été." },
      de: { title: "Lac d'Annecy | Annecy > Talloires > Col de la Forclaz > Duingt", description: "Kurze Runde um den saubersten See Europas. Das Ostufer führt durch Talloires hinauf zum Col de la Forclaz, wo Gleitschirmflieger über dem türkisfarbenen Wasser starten. Zurück über das Westufer via Duingt und Sévrier. Ideal für einen halben Tag, Sommerwochenenden aber meiden." },
    },
  },

  // ────────────────────────────── PROVENÇA ──────────────────────────────
  {
    title: "Gorges du Verdon | Castellane > Point Sublime > La Palud > Moustiers-Sainte-Marie",
    description:
      "O maior desfiladeiro da Europa, com paredes de 700 m sobre a água verde-esmeralda do Verdon. A D952 segue a margem norte com miradouros a cada curva, do Point Sublime a La Palud. Quem tiver tempo deve fazer o desvio pela Route des Crêtes (D23) antes de descer a Moustiers-Sainte-Marie, vila pendurada na falésia.",
    region: "Provença",
    category: "scenic",
    difficulty: "moderate",
    route_type: "out_and_back",
    featured: true,
    waypoints: [
      [43.8467, 6.5133], // Castellane
      [43.7967, 6.3989], // Point Sublime
      [43.7806, 6.3433], // La Palud-sur-Verdon
      [43.846, 6.2216], // Moustiers-Sainte-Marie
    ],
    stops: [
      {
        name: "Point Sublime",
        description: "O miradouro mais famoso da entrada do desfiladeiro.",
        type: "viewpoint",
        lat: 43.7967,
        lng: 6.3989,
        i18n: {
          en: { description: "The most famous viewpoint at the mouth of the gorge." },
          es: { description: "El mirador más famoso de la entrada del cañón." },
          fr: { description: "Le belvédère le plus célèbre à l'entrée des gorges." },
          de: { description: "Der berühmteste Aussichtspunkt am Eingang der Schlucht." },
        },
      },
      {
        name: "La Palud-sur-Verdon",
        description: "Aldeia no meio do percurso, início da Route des Crêtes.",
        type: "cafe",
        lat: 43.7806,
        lng: 6.3433,
        i18n: {
          en: { description: "Village halfway along, start of the Route des Crêtes." },
          es: { description: "Pueblo a mitad de camino, inicio de la Route des Crêtes." },
          fr: { description: "Village à mi-parcours, départ de la route des Crêtes." },
          de: { description: "Dorf auf halber Strecke, Beginn der Route des Crêtes." },
        },
      },
      {
        name: "Moustiers-Sainte-Marie",
        description: "Vila da faiança, com a estrela suspensa entre as falésias.",
        type: "restaurant",
        lat: 43.846,
        lng: 6.2216,
        i18n: {
          en: { description: "The faience village, with its star hanging between the cliffs." },
          es: { description: "El pueblo de la loza, con la estrella colgada entre los acantilados." },
          fr: { description: "Le village de la faïence, avec son étoile suspendue entre les falaises." },
          de: { description: "Das Fayence-Dorf mit dem zwischen den Felsen aufgehängten Stern." },
        },
      },
    ],
    i18n: {
      en: { description: "The largest canyon in Europe, with 700 m walls above the emerald-green Verdon river. The D952 follows the north rim with a viewpoint at every bend, from Point Sublime to La Palud. If you have time, take the detour along the Route des Crêtes (D23) before dropping down to Moustiers-Sainte-Marie, a village clinging to the cliff." },
      es: { description: "El mayor cañón de Europa, con paredes de 700 m sobre el agua verde esmeralda del Verdon. La D952 sigue el borde norte con un mirador en cada curva, del Point Sublime a La Palud. Si tienes tiempo, haz el desvío por la Route des Crêtes (D23) antes de bajar a Moustiers-Sainte-Marie, un pueblo colgado del acantilado." },
      fr: { description: "Le plus grand canyon d'Europe, avec des parois de 700 m au-dessus de l'eau vert émeraude du Verdon. La D952 suit la rive nord avec un belvédère à chaque virage, du Point Sublime à La Palud. Si vous avez le temps, faites le détour par la route des Crêtes (D23) avant de descendre à Moustiers-Sainte-Marie, village accroché à la falaise." },
      de: { description: "Die größte Schlucht Europas mit 700 m hohen Wänden über dem smaragdgrünen Verdon. Die D952 folgt dem Nordrand mit einem Aussichtspunkt in jeder Kurve, vom Point Sublime bis La Palud. Wer Zeit hat, nimmt den Abstecher über die Route des Crêtes (D23), bevor es hinunter nach Moustiers-Sainte-Marie geht, einem an die Felswand geklebten Dorf." },
    },
  },
  {
    title: "Mont Ventoux | Bédoin > Chalet Reynard > Cume > Malaucène",
    description:
      "O \"gigante da Provença\" sobe de Bédoin por 21 km de floresta até ao Chalet Reynard, onde as árvores desaparecem e começa a paisagem de pedra branca até ao observatório dos 1.909 m. Do topo vê-se dos Alpes ao Mediterrâneo. O vento pode ser muito forte; a descida para Malaucène é rápida e com bom asfalto.",
    region: "Provença",
    category: "mountain",
    difficulty: "moderate",
    route_type: "out_and_back",
    waypoints: [
      [44.125, 5.1797], // Bédoin
      [44.1741, 5.2789], // Summit
      [44.1736, 5.1325], // Malaucène
    ],
    stops: [
      {
        name: "Chalet Reynard",
        description: "Restaurante no limite da floresta, a 6 km do cume.",
        type: "restaurant",
        lat: 44.1647,
        lng: 5.3133,
        i18n: {
          en: { description: "Restaurant at the tree line, 6 km from the summit." },
          es: { description: "Restaurante en el límite del bosque, a 6 km de la cima." },
          fr: { description: "Restaurant à la limite de la forêt, à 6 km du sommet." },
          de: { description: "Restaurant an der Baumgrenze, 6 km unterhalb des Gipfels." },
        },
      },
      {
        name: "Cume do Mont Ventoux (1.909 m)",
        description: "Observatório meteorológico e vista de 360° sobre a Provença.",
        type: "viewpoint",
        lat: 44.1741,
        lng: 5.2789,
        i18n: {
          en: { name: "Mont Ventoux summit (1,909 m)", description: "Weather observatory and a 360° view over Provence." },
          es: { name: "Cima del Mont Ventoux (1.909 m)", description: "Observatorio meteorológico y vista de 360° sobre la Provenza." },
          fr: { name: "Sommet du mont Ventoux (1 909 m)", description: "Observatoire météo et vue à 360° sur la Provence." },
          de: { name: "Gipfel des Mont Ventoux (1.909 m)", description: "Wetterstation und 360°-Blick über die Provence." },
        },
      },
    ],
    i18n: {
      en: { title: "Mont Ventoux | Bédoin > Chalet Reynard > Summit > Malaucène", description: "The \"giant of Provence\" climbs from Bédoin through 21 km of forest to the Chalet Reynard, where the trees disappear and the white stone landscape begins, up to the observatory at 1,909 m. From the top you can see from the Alps to the Mediterranean. The wind can be very strong; the descent to Malaucène is fast with good tarmac." },
      es: { title: "Mont Ventoux | Bédoin > Chalet Reynard > Cima > Malaucène", description: "El \"gigante de la Provenza\" sube desde Bédoin por 21 km de bosque hasta el Chalet Reynard, donde desaparecen los árboles y empieza el paisaje de piedra blanca hasta el observatorio de los 1.909 m. Desde arriba se ve de los Alpes al Mediterráneo. El viento puede ser muy fuerte; la bajada a Malaucène es rápida y con buen asfalto." },
      fr: { title: "Mont Ventoux | Bédoin > Chalet Reynard > Sommet > Malaucène", description: "Le « Géant de Provence » monte de Bédoin par 21 km de forêt jusqu'au Chalet Reynard, où les arbres disparaissent et laissent place aux pierres blanches jusqu'à l'observatoire, à 1 909 m. Du sommet, la vue porte des Alpes à la Méditerranée. Le vent peut être très fort ; la descente vers Malaucène est rapide, sur un bon revêtement." },
      de: { title: "Mont Ventoux | Bédoin > Chalet Reynard > Gipfel > Malaucène", description: "Der „Riese der Provence“ führt von Bédoin über 21 km durch Wald zum Chalet Reynard, wo die Bäume enden und die weiße Steinlandschaft bis zum Observatorium auf 1.909 m beginnt. Oben reicht der Blick von den Alpen bis zum Mittelmeer. Der Wind kann sehr stark sein; die Abfahrt nach Malaucène ist schnell und gut asphaltiert." },
    },
  },
  {
    title: "Route Napoléon | Grasse > Castellane > Digne-les-Bains",
    description:
      "A N85 segue o caminho que Napoleão fez em 1815 ao regressar do exílio em Elba. Sai de Grasse, a capital do perfume, e sobe pelos planaltos calcários com curvas largas e rápidas, asfalto excelente e pouco trânsito fora do verão. Uma das estradas preferidas dos motociclistas franceses.",
    region: "Provença",
    category: "scenic",
    difficulty: "moderate",
    route_type: "out_and_back",
    waypoints: [
      [43.6589, 6.9236], // Grasse
      [43.6981, 6.8483], // Saint-Vallier-de-Thiey
      [43.7744, 6.7036], // Séranon
      [43.8467, 6.5133], // Castellane
      [43.9564, 6.3681], // Barrême
      [44.0925, 6.2356], // Digne-les-Bains
    ],
    stops: [
      {
        name: "Grasse",
        description: "Capital mundial do perfume — vale a visita a uma das perfumarias históricas.",
        type: "landmark",
        lat: 43.6589,
        lng: 6.9236,
        i18n: {
          en: { description: "World capital of perfume — worth visiting one of the historic perfume houses." },
          es: { description: "Capital mundial del perfume; merece la pena visitar una de las perfumerías históricas." },
          fr: { description: "Capitale mondiale du parfum — une parfumerie historique vaut la visite." },
          de: { description: "Welthauptstadt des Parfums – der Besuch einer historischen Parfümerie lohnt sich." },
        },
      },
      {
        name: "Castellane",
        description: "Paragem a meio, aos pés do rochedo de Notre-Dame du Roc. Porta de entrada do Verdon.",
        type: "cafe",
        lat: 43.8467,
        lng: 6.5133,
        i18n: {
          en: { description: "Halfway stop below the Notre-Dame du Roc rock. Gateway to the Verdon." },
          es: { description: "Parada a mitad de camino, al pie de la roca de Notre-Dame du Roc. Puerta del Verdon." },
          fr: { description: "Étape à mi-chemin, au pied du rocher de Notre-Dame du Roc. Porte du Verdon." },
          de: { description: "Halt auf halber Strecke unterhalb des Felsens Notre-Dame du Roc. Tor zum Verdon." },
        },
      },
    ],
    i18n: {
      en: { description: "The N85 follows the path Napoleon took in 1815 on his return from exile on Elba. It leaves Grasse, the capital of perfume, and climbs over the limestone plateaus with wide, fast bends, excellent tarmac and little traffic outside summer. One of French riders' favourite roads." },
      es: { description: "La N85 sigue el camino que hizo Napoleón en 1815 al volver del exilio en Elba. Sale de Grasse, la capital del perfume, y sube por las mesetas calizas con curvas amplias y rápidas, asfalto excelente y poco tráfico fuera del verano. Una de las carreteras favoritas de los moteros franceses." },
      fr: { description: "La N85 suit le chemin emprunté par Napoléon en 1815 à son retour de l'île d'Elbe. Elle quitte Grasse, capitale du parfum, et grimpe sur les plateaux calcaires en grandes courbes rapides, sur un excellent revêtement et avec peu de circulation hors saison. L'une des routes préférées des motards français." },
      de: { description: "Die N85 folgt dem Weg, den Napoleon 1815 bei seiner Rückkehr aus dem Exil auf Elba nahm. Sie verlässt Grasse, die Hauptstadt des Parfums, und steigt über Kalkhochebenen mit weiten, schnellen Kurven, hervorragendem Asphalt und außerhalb des Sommers wenig Verkehr. Eine der Lieblingsstraßen französischer Motorradfahrer." },
    },
  },
  {
    title: "Col de Turini | Sospel > Moulinet > Col de Turini > Lantosque",
    description:
      "Famoso pelo Rali de Monte Carlo, o Col de Turini sobe de Sospel por dezenas de ganchos em floresta de pinheiros e lariços até aos 1.607 m. A estrada é estreita e técnica, mas o asfalto é bom. Do colo desce-se para o vale da Vésubie, passando pela aldeia de La Bollène. A uma hora de Nice.",
    region: "Provença",
    category: "mountain",
    difficulty: "challenging",
    route_type: "out_and_back",
    waypoints: [
      [43.8775, 7.4486], // Sospel
      [43.9433, 7.4067], // Moulinet
      [43.9775, 7.3911], // Col de Turini
      [43.9919, 7.3364], // La Bollène-Vésubie
      [43.9744, 7.3114], // Lantosque
    ],
    stops: [
      {
        name: "Sospel",
        description: "Vila medieval com ponte velha sobre o rio Bévéra.",
        type: "landmark",
        lat: 43.8775,
        lng: 7.4486,
        i18n: {
          en: { description: "Medieval town with an old bridge over the Bévéra river." },
          es: { description: "Pueblo medieval con puente viejo sobre el río Bévéra." },
          fr: { description: "Bourg médiéval avec son vieux pont sur la Bévéra." },
          de: { description: "Mittelalterliches Städtchen mit alter Brücke über die Bévéra." },
        },
      },
      {
        name: "Col de Turini (1.607 m)",
        description: "Hotéis e restaurantes no colo, ponto de encontro de motociclistas.",
        type: "restaurant",
        lat: 43.9775,
        lng: 7.3911,
        i18n: {
          en: { name: "Col de Turini (1,607 m)", description: "Hotels and restaurants at the pass, a meeting point for riders." },
          es: { description: "Hoteles y restaurantes en el puerto, punto de encuentro de moteros." },
          fr: { name: "Col de Turini (1 607 m)", description: "Hôtels et restaurants au col, lieu de rendez-vous des motards." },
          de: { name: "Col de Turini (1.607 m)", description: "Hotels und Restaurants auf der Passhöhe, Treffpunkt der Motorradfahrer." },
        },
      },
    ],
    i18n: {
      en: { description: "Famous from the Monte Carlo Rally, the Col de Turini climbs from Sospel through dozens of hairpins in pine and larch forest to 1,607 m. The road is narrow and technical, but the tarmac is good. From the pass you drop into the Vésubie valley through the village of La Bollène. One hour from Nice." },
      es: { description: "Famoso por el Rally de Montecarlo, el Col de Turini sube desde Sospel por decenas de horquillas entre pinos y alerces hasta los 1.607 m. La carretera es estrecha y técnica, pero el asfalto es bueno. Desde el puerto se baja al valle de la Vésubie, pasando por el pueblo de La Bollène. A una hora de Niza." },
      fr: { description: "Célèbre grâce au Rallye de Monte-Carlo, le col de Turini monte de Sospel par des dizaines de lacets dans les pins et les mélèzes jusqu'à 1 607 m. La route est étroite et technique, mais le revêtement est bon. Du col, on descend vers la vallée de la Vésubie par le village de La Bollène. À une heure de Nice." },
      de: { description: "Bekannt aus der Rallye Monte Carlo: Der Col de Turini steigt von Sospel über Dutzende Kehren durch Kiefern- und Lärchenwald auf 1.607 m. Die Straße ist schmal und technisch, der Asphalt aber gut. Vom Pass geht es durch das Dorf La Bollène hinunter ins Vésubie-Tal. Eine Stunde von Nizza." },
    },
  },
  {
    title: "Corniches da Riviera | Nice > Èze > La Turbie > Menton",
    description:
      "As três corniches ligam Nice a Menton por cima do Mediterrâneo. Esta rota usa a Moyenne Corniche até Èze, aldeia medieval empoleirada a 400 m sobre o mar, e depois a Grande Corniche por La Turbie, com vista sobre o Mónaco, antes de descer a Menton, junto à fronteira italiana. Muito trânsito no verão.",
    region: "Provença",
    category: "coastal",
    difficulty: "easy",
    route_type: "out_and_back",
    waypoints: [
      [43.695, 7.285], // Nice, port
      [43.7192, 7.3289], // Col de Villefranche (Moyenne Corniche)
      [43.728, 7.361], // Èze village
      [43.745, 7.4], // La Turbie
      [43.7606, 7.4644], // Roquebrune village
      [43.776, 7.504], // Menton
    ],
    stops: [
      {
        name: "Èze",
        description: "Aldeia medieval com jardim exótico no topo e vista sobre a costa.",
        type: "viewpoint",
        lat: 43.728,
        lng: 7.361,
        i18n: {
          en: { description: "Medieval village with an exotic garden at the top and views along the coast." },
          es: { description: "Pueblo medieval con jardín exótico en lo alto y vistas a la costa." },
          fr: { description: "Village médiéval avec jardin exotique au sommet et vue sur la côte." },
          de: { description: "Mittelalterliches Dorf mit exotischem Garten oben und Blick über die Küste." },
        },
      },
      {
        name: "Trophée d'Auguste",
        description: "Monumento romano em La Turbie, sobre o Mónaco.",
        type: "landmark",
        lat: 43.7458,
        lng: 7.4003,
        i18n: {
          en: { name: "Trophy of Augustus", description: "Roman monument in La Turbie, above Monaco." },
          es: { name: "Trofeo de Augusto", description: "Monumento romano en La Turbie, sobre Mónaco." },
          fr: { description: "Monument romain de La Turbie, au-dessus de Monaco." },
          de: { name: "Tropaeum Alpium", description: "Römisches Monument in La Turbie über Monaco." },
        },
      },
    ],
    i18n: {
      en: { title: "Riviera Corniches | Nice > Èze > La Turbie > Menton", description: "The three corniches link Nice and Menton high above the Mediterranean. This route takes the Moyenne Corniche to Èze, a medieval village perched 400 m above the sea, then the Grande Corniche via La Turbie, overlooking Monaco, before dropping to Menton by the Italian border. Heavy traffic in summer." },
      es: { title: "Corniches de la Riviera | Niza > Èze > La Turbie > Menton", description: "Las tres corniches unen Niza y Menton por encima del Mediterráneo. Esta ruta toma la Moyenne Corniche hasta Èze, un pueblo medieval encaramado a 400 m sobre el mar, y luego la Grande Corniche por La Turbie, con vistas a Mónaco, antes de bajar a Menton, junto a la frontera italiana. Mucho tráfico en verano." },
      fr: { title: "Corniches de la Riviera | Nice > Èze > La Turbie > Menton", description: "Les trois corniches relient Nice à Menton au-dessus de la Méditerranée. Cet itinéraire prend la Moyenne Corniche jusqu'à Èze, village médiéval perché à 400 m au-dessus de la mer, puis la Grande Corniche par La Turbie, avec vue sur Monaco, avant de descendre sur Menton, à la frontière italienne. Beaucoup de circulation en été." },
      de: { title: "Corniches der Riviera | Nizza > Èze > La Turbie > Menton", description: "Die drei Corniches verbinden Nizza und Menton hoch über dem Mittelmeer. Diese Route nimmt die Moyenne Corniche nach Èze, einem mittelalterlichen Dorf 400 m über dem Meer, dann die Grande Corniche über La Turbie mit Blick auf Monaco, bevor es hinunter nach Menton an der italienischen Grenze geht. Im Sommer viel Verkehr." },
    },
  },

  // ────────────────────────────── PIRENÉUS ──────────────────────────────
  {
    title: "Col du Tourmalet | Luz-Saint-Sauveur > Tourmalet > La Mongie > Sainte-Marie-de-Campan",
    description:
      "O colo mais célebre dos Pirenéus e o mais subido na história do Tour de France. De Luz-Saint-Sauveur, a D918 sobe por Barèges até aos 2.115 m, onde a estátua do Géant du Tourmalet vigia os ciclistas e os motociclistas. A descida passa pela estância de La Mongie até ao vale de Campan.",
    region: "Pirenéus",
    category: "mountain",
    difficulty: "challenging",
    route_type: "out_and_back",
    featured: true,
    waypoints: [
      [42.8717, -0.0028], // Luz-Saint-Sauveur
      [42.8964, 0.0636], // Barèges
      [42.9081, 0.1453], // Col du Tourmalet
      [42.91, 0.1814], // La Mongie
      [42.9842, 0.2269], // Sainte-Marie-de-Campan
    ],
    stops: [
      {
        name: "Col du Tourmalet (2.115 m)",
        description: "Estátua do Géant e bar no topo do colo.",
        type: "viewpoint",
        lat: 42.9081,
        lng: 0.1453,
        i18n: {
          en: { name: "Col du Tourmalet (2,115 m)", description: "The Géant statue and a bar at the top of the pass." },
          es: { description: "Estatua del Géant y bar en lo alto del puerto." },
          fr: { name: "Col du Tourmalet (2 115 m)", description: "La statue du Géant et un bar au sommet du col." },
          de: { name: "Col du Tourmalet (2.115 m)", description: "Die Géant-Statue und eine Bar auf der Passhöhe." },
        },
      },
      {
        name: "Sainte-Marie-de-Campan",
        description: "Fim da descida e ligação ao Col d'Aspin.",
        type: "cafe",
        lat: 42.9842,
        lng: 0.2269,
        i18n: {
          en: { description: "End of the descent and link to the Col d'Aspin." },
          es: { description: "Final de la bajada y enlace con el Col d'Aspin." },
          fr: { description: "Bas de la descente et départ vers le col d'Aspin." },
          de: { description: "Ende der Abfahrt und Anschluss an den Col d'Aspin." },
        },
      },
    ],
    i18n: {
      en: { description: "The most famous pass in the Pyrenees and the most climbed in Tour de France history. From Luz-Saint-Sauveur, the D918 climbs through Barèges to 2,115 m, where the Géant du Tourmalet statue watches over cyclists and riders. The descent runs through the La Mongie ski resort to the Campan valley." },
      es: { description: "El puerto más célebre de los Pirineos y el más subido en la historia del Tour de Francia. Desde Luz-Saint-Sauveur, la D918 sube por Barèges hasta los 2.115 m, donde la estatua del Géant du Tourmalet vigila a ciclistas y moteros. La bajada pasa por la estación de La Mongie hasta el valle de Campan." },
      fr: { description: "Le col le plus célèbre des Pyrénées et le plus emprunté de l'histoire du Tour de France. Depuis Luz-Saint-Sauveur, la D918 monte par Barèges jusqu'à 2 115 m, où la statue du Géant du Tourmalet veille sur cyclistes et motards. La descente traverse la station de La Mongie jusqu'à la vallée de Campan." },
      de: { description: "Der berühmteste Pass der Pyrenäen und der meistbefahrene der Tour-de-France-Geschichte. Von Luz-Saint-Sauveur führt die D918 über Barèges auf 2.115 m, wo die Statue des Géant du Tourmalet über Rad- und Motorradfahrer wacht. Die Abfahrt geht durch den Skiort La Mongie ins Tal von Campan." },
    },
  },
  {
    title: "Col d'Aubisque | Laruns > Aubisque > Cirque du Litor > Col du Soulor > Argelès-Gazost",
    description:
      "De Laruns, a D918 sobe por Eaux-Bonnes e Gourette até ao Col d'Aubisque (1.709 m). O melhor vem a seguir: a estrada estreita escavada na falésia do Cirque du Litor, sem proteções e com vacas e cavalos soltos, até ao Col du Soulor. Desce-se depois pelo vale de Arrens até Argelès-Gazost.",
    region: "Pirenéus",
    category: "mountain",
    difficulty: "challenging",
    route_type: "out_and_back",
    waypoints: [
      [42.9886, -0.4256], // Laruns
      [42.9725, -0.3911], // Eaux-Bonnes
      [42.9772, -0.3389], // Col d'Aubisque
      [42.9586, -0.2589], // Col du Soulor
      [42.96, -0.21], // Arrens-Marsous
      [43.0036, -0.0981], // Argelès-Gazost
    ],
    stops: [
      {
        name: "Col d'Aubisque (1.709 m)",
        description: "As bicicletas gigantes do Tour e vista sobre o vale de Ossau.",
        type: "viewpoint",
        lat: 42.9772,
        lng: -0.3389,
        i18n: {
          en: { name: "Col d'Aubisque (1,709 m)", description: "The giant Tour bikes and views over the Ossau valley." },
          es: { description: "Las bicicletas gigantes del Tour y vistas al valle de Ossau." },
          fr: { name: "Col d'Aubisque (1 709 m)", description: "Les vélos géants du Tour et la vue sur la vallée d'Ossau." },
          de: { name: "Col d'Aubisque (1.709 m)", description: "Die riesigen Tour-Fahrräder und Blick über das Ossau-Tal." },
        },
      },
      {
        name: "Cirque du Litor",
        description: "Estrada cortada na rocha sobre o circo — vá devagar.",
        type: "viewpoint",
        lat: 42.97,
        lng: -0.3,
        i18n: {
          en: { description: "Road cut into the rock above the cirque — take it slow." },
          es: { description: "Carretera tallada en la roca sobre el circo: ve despacio." },
          fr: { description: "Route taillée dans la roche au-dessus du cirque — roulez doucement." },
          de: { description: "In den Fels gehauene Straße über dem Talkessel – langsam fahren." },
        },
      },
    ],
    i18n: {
      en: { description: "From Laruns, the D918 climbs via Eaux-Bonnes and Gourette to the Col d'Aubisque (1,709 m). The best comes next: the narrow road cut into the cliff of the Cirque du Litor, with no barriers and free-roaming cows and horses, up to the Col du Soulor. Then down the Arrens valley to Argelès-Gazost." },
      es: { description: "Desde Laruns, la D918 sube por Eaux-Bonnes y Gourette hasta el Col d'Aubisque (1.709 m). Lo mejor viene después: la carretera estrecha excavada en el acantilado del Cirque du Litor, sin quitamiedos y con vacas y caballos sueltos, hasta el Col du Soulor. Luego se baja por el valle de Arrens hasta Argelès-Gazost." },
      fr: { description: "Depuis Laruns, la D918 monte par Eaux-Bonnes et Gourette jusqu'au col d'Aubisque (1 709 m). Le meilleur vient ensuite : la route étroite taillée dans la falaise du cirque du Litor, sans glissières, avec vaches et chevaux en liberté, jusqu'au col du Soulor. On descend ensuite par le val d'Azun jusqu'à Argelès-Gazost." },
      de: { description: "Von Laruns steigt die D918 über Eaux-Bonnes und Gourette auf den Col d'Aubisque (1.709 m). Das Beste folgt danach: die schmale, in die Felswand des Cirque du Litor gehauene Straße ohne Leitplanken, mit frei laufenden Kühen und Pferden, bis zum Col du Soulor. Dann hinunter durch das Arrens-Tal nach Argelès-Gazost." },
    },
  },
  {
    title: "Peyresourde e Aspin | Bagnères-de-Luchon > Col de Peyresourde > Arreau > Col d'Aspin",
    description:
      "Dois colos clássicos dos Pirenéus centrais, perfeitos para juntar ao Tourmalet num dia. O Peyresourde sobe de Luchon com curvas abertas e vistas para os picos da fronteira; o Aspin, depois de Arreau, é mais curto e termina num prado com cavalos e vacas. Acaba em Sainte-Marie-de-Campan, aos pés do Tourmalet.",
    region: "Pirenéus",
    category: "mountain",
    difficulty: "moderate",
    route_type: "out_and_back",
    waypoints: [
      [42.79, 0.5933], // Bagnères-de-Luchon
      [42.7967, 0.4483], // Col de Peyresourde
      [42.9061, 0.3592], // Arreau
      [42.9411, 0.3283], // Col d'Aspin
      [42.9842, 0.2269], // Sainte-Marie-de-Campan
    ],
    stops: [
      {
        name: "Bagnères-de-Luchon",
        description: "Vila termal com avenidas e cafés da Belle Époque.",
        type: "cafe",
        lat: 42.79,
        lng: 0.5933,
        i18n: {
          en: { description: "Spa town with Belle Époque avenues and cafés." },
          es: { description: "Villa termal con avenidas y cafés de la Belle Époque." },
          fr: { description: "Ville thermale aux allées et cafés Belle Époque." },
          de: { description: "Kurort mit Alleen und Cafés aus der Belle Époque." },
        },
      },
      {
        name: "Col d'Aspin (1.489 m)",
        description: "Prado no topo com vista sobre o Pic du Midi.",
        type: "viewpoint",
        lat: 42.9411,
        lng: 0.3283,
        i18n: {
          en: { name: "Col d'Aspin (1,489 m)", description: "Meadow at the top with views of the Pic du Midi." },
          es: { description: "Prado en lo alto con vistas al Pic du Midi." },
          fr: { name: "Col d'Aspin (1 489 m)", description: "Prairie au sommet avec vue sur le pic du Midi." },
          de: { name: "Col d'Aspin (1.489 m)", description: "Wiese auf der Passhöhe mit Blick auf den Pic du Midi." },
        },
      },
    ],
    i18n: {
      en: { title: "Peyresourde and Aspin | Bagnères-de-Luchon > Col de Peyresourde > Arreau > Col d'Aspin", description: "Two classic passes in the central Pyrenees, perfect to combine with the Tourmalet in one day. The Peyresourde climbs from Luchon with open bends and views of the border peaks; the Aspin, after Arreau, is shorter and ends in a meadow with horses and cows. It finishes in Sainte-Marie-de-Campan, at the foot of the Tourmalet." },
      es: { title: "Peyresourde y Aspin | Bagnères-de-Luchon > Col de Peyresourde > Arreau > Col d'Aspin", description: "Dos puertos clásicos del Pirineo central, perfectos para combinar con el Tourmalet en un día. El Peyresourde sube desde Luchon con curvas abiertas y vistas a los picos de la frontera; el Aspin, después de Arreau, es más corto y termina en un prado con caballos y vacas. Acaba en Sainte-Marie-de-Campan, al pie del Tourmalet." },
      fr: { title: "Peyresourde et Aspin | Bagnères-de-Luchon > Col de Peyresourde > Arreau > Col d'Aspin", description: "Deux cols classiques des Pyrénées centrales, parfaits à enchaîner avec le Tourmalet dans la journée. Le Peyresourde monte de Luchon en courbes ouvertes face aux sommets de la frontière ; l'Aspin, après Arreau, est plus court et se termine dans une prairie avec chevaux et vaches. Arrivée à Sainte-Marie-de-Campan, au pied du Tourmalet." },
      de: { title: "Peyresourde und Aspin | Bagnères-de-Luchon > Col de Peyresourde > Arreau > Col d'Aspin", description: "Zwei klassische Pässe der Zentralpyrenäen, ideal mit dem Tourmalet an einem Tag zu kombinieren. Der Peyresourde steigt von Luchon mit offenen Kurven und Blick auf die Grenzgipfel; der Aspin nach Arreau ist kürzer und endet auf einer Wiese mit Pferden und Kühen. Ziel ist Sainte-Marie-de-Campan am Fuß des Tourmalet." },
    },
  },

  // ─────────────────────────── MACIÇO CENTRAL ───────────────────────────
  {
    title: "Puy Mary | Salers > Pas de Peyrol > Dienne > Murat",
    description:
      "No coração dos vulcões da Auvergne, a D680 sai de Salers, vila de pedra negra, e sobe por pastagens verdes até ao Pas de Peyrol (1.589 m), o colo rodoviário mais alto do Maciço Central, aos pés do Puy Mary. A descida para Dienne e Murat atravessa um dos vales glaciares mais bonitos de França. Aberto de maio a novembro.",
    region: "Maciço Central",
    category: "mountain",
    difficulty: "moderate",
    route_type: "out_and_back",
    waypoints: [
      [45.1394, 2.495], // Salers
      [45.1097, 2.6728], // Pas de Peyrol
      [45.1103, 2.8681], // Murat
    ],
    stops: [
      {
        name: "Salers",
        description: "Vila medieval de pedra vulcânica — prove o queijo Salers.",
        type: "restaurant",
        lat: 45.1394,
        lng: 2.495,
        i18n: {
          en: { description: "Medieval village of volcanic stone — try the Salers cheese." },
          es: { description: "Pueblo medieval de piedra volcánica: prueba el queso Salers." },
          fr: { description: "Cité médiévale en pierre volcanique — goûtez le fromage de Salers." },
          de: { description: "Mittelalterliches Dorf aus Vulkanstein – unbedingt den Salers-Käse probieren." },
        },
      },
      {
        name: "Pas de Peyrol (1.589 m)",
        description: "Colo aos pés do Puy Mary; a subida a pé ao cume demora 30 minutos.",
        type: "viewpoint",
        lat: 45.1097,
        lng: 2.6728,
        i18n: {
          en: { name: "Pas de Peyrol (1,589 m)", description: "Pass at the foot of the Puy Mary; the walk up to the summit takes 30 minutes." },
          es: { description: "Puerto al pie del Puy Mary; la subida a pie a la cima lleva 30 minutos." },
          fr: { name: "Pas de Peyrol (1 589 m)", description: "Col au pied du puy Mary ; la montée à pied au sommet prend 30 minutes." },
          de: { name: "Pas de Peyrol (1.589 m)", description: "Pass am Fuß des Puy Mary; der Fußweg zum Gipfel dauert 30 Minuten." },
        },
      },
    ],
    i18n: {
      en: { description: "In the heart of the Auvergne volcanoes, the D680 leaves Salers, a village of dark stone, and climbs through green pastures to the Pas de Peyrol (1,589 m), the highest road pass in the Massif Central, below the Puy Mary. The descent to Dienne and Murat crosses one of the most beautiful glacial valleys in France. Open from May to November." },
      es: { description: "En el corazón de los volcanes de Auvernia, la D680 sale de Salers, pueblo de piedra negra, y sube entre pastos verdes hasta el Pas de Peyrol (1.589 m), el puerto de carretera más alto del Macizo Central, al pie del Puy Mary. La bajada a Dienne y Murat cruza uno de los valles glaciares más bonitos de Francia. Abierto de mayo a noviembre." },
      fr: { description: "Au cœur des volcans d'Auvergne, la D680 quitte Salers, cité de pierre sombre, et monte à travers les pâturages jusqu'au Pas de Peyrol (1 589 m), le plus haut col routier du Massif central, au pied du puy Mary. La descente vers Dienne et Murat traverse l'une des plus belles vallées glaciaires de France. Ouvert de mai à novembre." },
      de: { description: "Im Herzen der Vulkane der Auvergne verlässt die D680 Salers, ein Dorf aus dunklem Stein, und steigt durch grüne Weiden zum Pas de Peyrol (1.589 m), dem höchsten Straßenpass des Zentralmassivs, unterhalb des Puy Mary. Die Abfahrt nach Dienne und Murat führt durch eines der schönsten Gletschertäler Frankreichs. Von Mai bis November geöffnet." },
    },
  },
  {
    title: "Gorges du Tarn | Ispagnac > Sainte-Énimie > La Malène > Millau",
    description:
      "A D907bis segue o rio Tarn no fundo de um desfiladeiro de calcário com 400 m de profundidade, passando por aldeias de pedra agarradas às margens, como Sainte-Énimie e La Malène. Curvas suaves, túneis escavados na rocha e paragens para banhos no rio. Termina em Millau, com vista para o viaduto mais alto do mundo.",
    region: "Maciço Central",
    category: "scenic",
    difficulty: "easy",
    route_type: "out_and_back",
    waypoints: [
      [44.3714, 3.5333], // Ispagnac
      [44.3653, 3.4114], // Sainte-Énimie
      [44.3011, 3.3192], // La Malène
      [44.2803, 3.2286], // Les Vignes
      [44.1897, 3.2081], // Le Rozier
      [44.098, 3.078], // Millau
    ],
    stops: [
      {
        name: "Sainte-Énimie",
        description: "Uma das mais belas aldeias de França, em socalcos sobre o Tarn.",
        type: "cafe",
        lat: 44.3653,
        lng: 3.4114,
        i18n: {
          en: { description: "One of the most beautiful villages in France, terraced above the Tarn." },
          es: { description: "Uno de los pueblos más bonitos de Francia, en terrazas sobre el Tarn." },
          fr: { description: "L'un des plus beaux villages de France, en terrasses au-dessus du Tarn." },
          de: { description: "Eines der schönsten Dörfer Frankreichs, terrassenförmig über dem Tarn." },
        },
      },
      {
        name: "Point Sublime (Tarn)",
        description: "Desvio de 10 km desde Les Vignes até ao miradouro sobre o desfiladeiro.",
        type: "viewpoint",
        lat: 44.2822,
        lng: 3.2392,
        i18n: {
          en: { description: "10 km detour from Les Vignes to the viewpoint above the gorge." },
          es: { description: "Desvío de 10 km desde Les Vignes hasta el mirador sobre el cañón." },
          fr: { description: "Détour de 10 km depuis Les Vignes jusqu'au belvédère sur les gorges." },
          de: { description: "10 km Abstecher von Les Vignes zum Aussichtspunkt über der Schlucht." },
        },
      },
      {
        name: "Viaduto de Millau",
        description: "A ponte de tirantes mais alta do mundo; há uma área de visita sob o tabuleiro.",
        type: "landmark",
        lat: 44.0775,
        lng: 3.0225,
        i18n: {
          en: { name: "Millau Viaduct", description: "The tallest cable-stayed bridge in the world; there is a visitor area below the deck." },
          es: { name: "Viaducto de Millau", description: "El puente atirantado más alto del mundo; hay una zona de visita bajo el tablero." },
          fr: { name: "Viaduc de Millau", description: "Le plus haut pont à haubans du monde ; un espace d'accueil se trouve sous le tablier." },
          de: { name: "Viadukt von Millau", description: "Die höchste Schrägseilbrücke der Welt; unter der Fahrbahn gibt es einen Besucherbereich." },
        },
      },
    ],
    i18n: {
      en: { description: "The D907bis follows the Tarn river at the bottom of a 400 m deep limestone gorge, through stone villages clinging to the banks such as Sainte-Énimie and La Malène. Gentle bends, tunnels cut into the rock and stops for a swim in the river. It ends in Millau, with views of the tallest viaduct in the world." },
      es: { description: "La D907bis sigue el río Tarn por el fondo de un cañón de caliza de 400 m de profundidad, pasando por pueblos de piedra pegados a las orillas, como Sainte-Énimie y La Malène. Curvas suaves, túneles excavados en la roca y paradas para bañarse en el río. Termina en Millau, con vistas al viaducto más alto del mundo." },
      fr: { description: "La D907bis suit le Tarn au fond d'un canyon calcaire de 400 m de profondeur, à travers des villages de pierre accrochés aux berges comme Sainte-Énimie et La Malène. Des virages doux, des tunnels creusés dans la roche et des haltes baignade dans la rivière. Arrivée à Millau, avec vue sur le plus haut viaduc du monde." },
      de: { description: "Die D907bis folgt dem Tarn am Grund einer 400 m tiefen Kalkschlucht, vorbei an Steindörfern an den Ufern wie Sainte-Énimie und La Malène. Sanfte Kurven, in den Fels gehauene Tunnel und Badestopps am Fluss. Ziel ist Millau mit Blick auf das höchste Viadukt der Welt." },
    },
  },
  {
    title: "Gorges de l'Ardèche | Vallon-Pont-d'Arc > Pont d'Arc > Saint-Martin-d'Ardèche",
    description:
      "A Route des Gorges (D290) percorre 30 km pela borda do desfiladeiro da Ardèche, com mais de uma dezena de miradouros sobre os meandros do rio e as canoas lá em baixo. Começa no Pont d'Arc, um arco natural de pedra sobre o rio, e termina na aldeia de Saint-Martin-d'Ardèche.",
    region: "Maciço Central",
    category: "scenic",
    difficulty: "easy",
    route_type: "out_and_back",
    waypoints: [
      [44.4069, 4.3947], // Vallon-Pont-d'Arc
      [44.3833, 4.4161], // Pont d'Arc
      [44.3439, 4.4719], // Belvédère de la Madeleine
      [44.3017, 4.5644], // Saint-Martin-d'Ardèche
    ],
    stops: [
      {
        name: "Pont d'Arc",
        description: "Arco natural de 54 m sobre a Ardèche.",
        type: "landmark",
        lat: 44.3833,
        lng: 4.4161,
        i18n: {
          en: { description: "A 54 m natural stone arch over the Ardèche." },
          es: { description: "Arco natural de 54 m sobre el Ardèche." },
          fr: { description: "Arche naturelle de 54 m au-dessus de l'Ardèche." },
          de: { description: "54 m hoher natürlicher Felsbogen über der Ardèche." },
        },
      },
      {
        name: "Belvédère de la Madeleine",
        description: "O miradouro mais impressionante da Route des Gorges.",
        type: "viewpoint",
        lat: 44.3439,
        lng: 4.4719,
        i18n: {
          en: { description: "The most spectacular viewpoint on the Route des Gorges." },
          es: { description: "El mirador más impresionante de la Route des Gorges." },
          fr: { description: "Le belvédère le plus impressionnant de la route des Gorges." },
          de: { description: "Der eindrucksvollste Aussichtspunkt der Route des Gorges." },
        },
      },
    ],
    i18n: {
      en: { description: "The Route des Gorges (D290) runs 30 km along the rim of the Ardèche gorge, with more than a dozen viewpoints over the river's meanders and the canoes far below. It starts at the Pont d'Arc, a natural stone arch over the river, and ends in the village of Saint-Martin-d'Ardèche." },
      es: { description: "La Route des Gorges (D290) recorre 30 km por el borde del cañón del Ardèche, con más de una decena de miradores sobre los meandros del río y las canoas allá abajo. Empieza en el Pont d'Arc, un arco natural de piedra sobre el río, y termina en el pueblo de Saint-Martin-d'Ardèche." },
      fr: { description: "La route des Gorges (D290) parcourt 30 km au bord du canyon de l'Ardèche, avec plus d'une dizaine de belvédères sur les méandres de la rivière et les canoës tout en bas. Elle commence au Pont d'Arc, arche naturelle au-dessus de la rivière, et se termine au village de Saint-Martin-d'Ardèche." },
      de: { description: "Die Route des Gorges (D290) führt 30 km am Rand der Ardèche-Schlucht entlang, mit mehr als einem Dutzend Aussichtspunkten über die Flussschleifen und die Kanus tief unten. Sie beginnt am Pont d'Arc, einem natürlichen Felsbogen über dem Fluss, und endet im Dorf Saint-Martin-d'Ardèche." },
    },
  },

  // ─────────────────────────── VOSGES E ALSÁCIA ───────────────────────────
  {
    title: "Route des Crêtes | Cernay > Grand Ballon > Col de la Schlucht > Col du Bonhomme",
    description:
      "Construída na Primeira Guerra Mundial para abastecer a frente, a Route des Crêtes segue o cume dos Vosges durante cerca de 80 km, com a planície da Alsácia de um lado e a Lorena do outro. Passa pelo Grand Ballon (1.424 m), o ponto mais alto da cadeia, e por fermes-auberges onde se come a tradicional refeição marcaire. Fechada no inverno.",
    region: "Vosges e Alsácia",
    category: "mountain",
    difficulty: "moderate",
    route_type: "out_and_back",
    waypoints: [
      [47.8064, 7.1764], // Cernay
      [47.9017, 7.0983], // Grand Ballon
      [47.9264, 7.0336], // Le Markstein
      [48.0636, 7.0233], // Col de la Schlucht
      [48.1683, 7.0989], // Col du Bonhomme
    ],
    stops: [
      {
        name: "Grand Ballon (1.424 m)",
        description: "O ponto mais alto dos Vosges, com vista até aos Alpes em dias limpos.",
        type: "viewpoint",
        lat: 47.9017,
        lng: 7.0983,
        i18n: {
          en: { name: "Grand Ballon (1,424 m)", description: "The highest point of the Vosges, with views to the Alps on clear days." },
          es: { description: "El punto más alto de los Vosgos, con vistas hasta los Alpes en días despejados." },
          fr: { name: "Grand Ballon (1 424 m)", description: "Le point culminant des Vosges, avec vue jusqu'aux Alpes par temps clair." },
          de: { name: "Grand Ballon (1.424 m)", description: "Der höchste Punkt der Vogesen, an klaren Tagen mit Blick bis zu den Alpen." },
        },
      },
      {
        name: "Ferme-auberge do Markstein",
        description: "Refeição marcaire: tarte de carne, batatas e queijo Munster.",
        type: "restaurant",
        lat: 47.9264,
        lng: 7.0336,
        i18n: {
          en: { name: "Markstein ferme-auberge", description: "Marcaire meal: meat pie, potatoes and Munster cheese." },
          es: { name: "Ferme-auberge del Markstein", description: "Comida marcaire: pastel de carne, patatas y queso Munster." },
          fr: { name: "Ferme-auberge du Markstein", description: "Repas marcaire : tourte à la viande, roïgabrageldi et munster." },
          de: { name: "Ferme-Auberge am Markstein", description: "Melkermahlzeit: Fleischpastete, Kartoffeln und Munsterkäse." },
        },
      },
    ],
    i18n: {
      en: { description: "Built in the First World War to supply the front, the Route des Crêtes follows the ridge of the Vosges for about 80 km, with the Alsace plain on one side and Lorraine on the other. It passes the Grand Ballon (1,424 m), the highest point of the range, and farm inns serving the traditional marcaire meal. Closed in winter." },
      es: { description: "Construida en la Primera Guerra Mundial para abastecer el frente, la Route des Crêtes sigue la cresta de los Vosgos durante unos 80 km, con la llanura de Alsacia a un lado y Lorena al otro. Pasa por el Grand Ballon (1.424 m), el punto más alto de la cordillera, y por fermes-auberges donde se come la tradicional comida marcaire. Cerrada en invierno." },
      fr: { description: "Construite pendant la Première Guerre mondiale pour ravitailler le front, la route des Crêtes suit la ligne de crête des Vosges sur environ 80 km, avec la plaine d'Alsace d'un côté et la Lorraine de l'autre. Elle passe par le Grand Ballon (1 424 m), point culminant du massif, et par des fermes-auberges qui servent le repas marcaire. Fermée l'hiver." },
      de: { description: "Im Ersten Weltkrieg zur Versorgung der Front gebaut, folgt die Route des Crêtes rund 80 km dem Kamm der Vogesen, mit der elsässischen Ebene auf der einen und Lothringen auf der anderen Seite. Sie führt über den Grand Ballon (1.424 m), den höchsten Punkt des Gebirges, und an Fermes-Auberges mit traditioneller Melkermahlzeit vorbei. Im Winter gesperrt." },
    },
  },
  {
    title: "Rota dos Vinhos da Alsácia | Obernai > Ribeauvillé > Riquewihr > Colmar > Eguisheim",
    description:
      "Passeio tranquilo pelo sopé dos Vosges, entre vinhas e aldeias de casas com enxaimel e flores nas janelas. Obernai, Riquewihr, Kaysersberg e Eguisheim estão entre as mais bonitas de França, e Colmar tem a \"Pequena Veneza\". Estradas estreitas e lentas: é para parar, provar um Riesling e seguir.",
    region: "Vosges e Alsácia",
    category: "weekend",
    difficulty: "easy",
    route_type: "out_and_back",
    waypoints: [
      [48.4622, 7.4817], // Obernai
      [48.4083, 7.4492], // Barr
      [48.3247, 7.425], // Dambach-la-Ville
      [48.2061, 7.3647], // Bergheim
      [48.1953, 7.3197], // Ribeauvillé
      [48.1667, 7.2978], // Riquewihr
      [48.1394, 7.2636], // Kaysersberg
      [48.0794, 7.3585], // Colmar
      [48.0428, 7.3058], // Eguisheim
    ],
    stops: [
      {
        name: "Riquewihr",
        description: "Aldeia medieval intacta no meio das vinhas.",
        type: "landmark",
        lat: 48.1667,
        lng: 7.2978,
        i18n: {
          en: { description: "Intact medieval village in the middle of the vineyards." },
          es: { description: "Pueblo medieval intacto en medio de los viñedos." },
          fr: { description: "Village médiéval intact au milieu des vignes." },
          de: { description: "Unversehrtes mittelalterliches Dorf mitten in den Weinbergen." },
        },
      },
      {
        name: "Petite Venise (Colmar)",
        description: "Canais e casas coloridas no centro de Colmar.",
        type: "cafe",
        lat: 48.0733,
        lng: 7.3603,
        i18n: {
          en: { name: "Little Venice (Colmar)", description: "Canals and colourful houses in the centre of Colmar." },
          es: { name: "Pequeña Venecia (Colmar)", description: "Canales y casas de colores en el centro de Colmar." },
          fr: { description: "Canaux et maisons colorées au cœur de Colmar." },
          de: { name: "Klein-Venedig (Colmar)", description: "Kanäle und bunte Häuser im Zentrum von Colmar." },
        },
      },
    ],
    i18n: {
      en: { title: "Alsace Wine Route | Obernai > Ribeauvillé > Riquewihr > Colmar > Eguisheim", description: "An easy-going ride along the foot of the Vosges, through vineyards and villages of half-timbered houses with flowers at every window. Obernai, Riquewihr, Kaysersberg and Eguisheim are among the prettiest in France, and Colmar has its \"Little Venice\". Narrow, slow roads: this one is for stopping, tasting a Riesling and moving on." },
      es: { title: "Ruta del Vino de Alsacia | Obernai > Ribeauvillé > Riquewihr > Colmar > Eguisheim", description: "Paseo tranquilo por el pie de los Vosgos, entre viñedos y pueblos de casas con entramado de madera y flores en las ventanas. Obernai, Riquewihr, Kaysersberg y Eguisheim están entre los más bonitos de Francia, y Colmar tiene su \"Pequeña Venecia\". Carreteras estrechas y lentas: es para parar, probar un Riesling y seguir." },
      fr: { title: "Route des Vins d'Alsace | Obernai > Ribeauvillé > Riquewihr > Colmar > Eguisheim", description: "Une balade tranquille au pied des Vosges, entre vignes et villages de maisons à colombages fleuries. Obernai, Riquewihr, Kaysersberg et Eguisheim comptent parmi les plus beaux de France, et Colmar a sa « Petite Venise ». Routes étroites et lentes : on s'arrête, on goûte un riesling et on repart." },
      de: { title: "Elsässische Weinstraße | Obernai > Ribeauvillé > Riquewihr > Colmar > Eguisheim", description: "Gemütliche Fahrt am Fuß der Vogesen durch Weinberge und Dörfer mit Fachwerkhäusern und Blumen an jedem Fenster. Obernai, Riquewihr, Kaysersberg und Eguisheim gehören zu den schönsten Frankreichs, und Colmar hat sein „Klein-Venedig“. Schmale, langsame Straßen: anhalten, einen Riesling probieren, weiterfahren." },
    },
  },

  // ─────────────────────────────── CÓRSEGA ───────────────────────────────
  {
    title: "Calanques de Piana | Porto > Calanques > Piana > Cargèse",
    description:
      "A D81 entre Porto e Piana atravessa as Calanques, falésias de granito vermelho esculpidas pelo vento sobre o golfo de Porto, Património da UNESCO. A estrada é estreita, com curvas cegas e autocarros no verão, mas cada curva tem uma vista melhor que a anterior. Continua pela costa até Cargèse, a aldeia grega da Córsega.",
    region: "Córsega",
    category: "coastal",
    difficulty: "moderate",
    route_type: "out_and_back",
    waypoints: [
      [42.2653, 8.7031], // Porto
      [42.25, 8.655], // Les Calanches
      [42.2386, 8.6378], // Piana
      [42.135, 8.5961], // Cargèse
    ],
    stops: [
      {
        name: "Tête de Chien",
        description: "Rocha em forma de cabeça de cão no meio das Calanques, com pequeno parque.",
        type: "viewpoint",
        lat: 42.2531,
        lng: 8.6631,
        i18n: {
          en: { description: "Dog's-head rock in the middle of the Calanques, with a small parking area." },
          es: { description: "Roca con forma de cabeza de perro en medio de las Calanques, con pequeño aparcamiento." },
          fr: { description: "Rocher en forme de tête de chien au milieu des Calanques, avec un petit parking." },
          de: { description: "Hundekopf-Felsen mitten in den Calanques, mit kleinem Parkplatz." },
        },
      },
      {
        name: "Cargèse",
        description: "Aldeia fundada por gregos, com duas igrejas frente a frente sobre o mar.",
        type: "cafe",
        lat: 42.135,
        lng: 8.5961,
        i18n: {
          en: { description: "Village founded by Greeks, with two churches facing each other above the sea." },
          es: { description: "Pueblo fundado por griegos, con dos iglesias frente a frente sobre el mar." },
          fr: { description: "Village fondé par des Grecs, avec deux églises qui se font face au-dessus de la mer." },
          de: { description: "Von Griechen gegründetes Dorf mit zwei sich gegenüberstehenden Kirchen über dem Meer." },
        },
      },
    ],
    i18n: {
      en: { description: "The D81 between Porto and Piana crosses the Calanques, red granite cliffs sculpted by the wind above the Gulf of Porto, a UNESCO World Heritage site. The road is narrow, with blind bends and coaches in summer, but every corner has a better view than the last. It carries on along the coast to Cargèse, Corsica's Greek village." },
      es: { description: "La D81 entre Porto y Piana atraviesa las Calanques, acantilados de granito rojo esculpidos por el viento sobre el golfo de Porto, Patrimonio de la UNESCO. La carretera es estrecha, con curvas ciegas y autobuses en verano, pero cada curva tiene mejor vista que la anterior. Sigue por la costa hasta Cargèse, el pueblo griego de Córcega." },
      fr: { description: "La D81 entre Porto et Piana traverse les Calanques, falaises de granit rouge sculptées par le vent au-dessus du golfe de Porto, classées à l'UNESCO. La route est étroite, avec des virages sans visibilité et des cars l'été, mais chaque virage offre une vue plus belle que le précédent. Elle continue le long de la côte jusqu'à Cargèse, le village grec de la Corse." },
      de: { description: "Die D81 zwischen Porto und Piana durchquert die Calanques, vom Wind geformte rote Granitklippen über dem Golf von Porto (UNESCO-Welterbe). Die Straße ist schmal, mit unübersichtlichen Kurven und im Sommer Reisebussen, doch jede Kurve bietet einen schöneren Blick als die vorige. Weiter geht es entlang der Küste nach Cargèse, dem griechischen Dorf Korsikas." },
    },
  },
  {
    title: "Col de Bavella | Solenzara > Col de Bavella > Zonza",
    description:
      "Da costa leste, a D268 sobe ao longo do rio Solenzara, com piscinas naturais, até ao Col de Bavella (1.218 m), dominado pelas Aiguilles de Bavella, agulhas de granito vermelho entre pinheiros-larícios. Curvas constantes, porcos e vacas na estrada e uma das paisagens mais selvagens da Córsega. Termina na aldeia de montanha de Zonza.",
    region: "Córsega",
    category: "mountain",
    difficulty: "challenging",
    route_type: "out_and_back",
    waypoints: [
      [41.8572, 9.4019], // Solenzara
      [41.8217, 9.3058], // Vallée de la Solenzara
      [41.7956, 9.2264], // Col de Bavella
      [41.7494, 9.1714], // Zonza
    ],
    stops: [
      {
        name: "Col de Bavella (1.218 m)",
        description: "Vista sobre as Aiguilles de Bavella e a Notre-Dame-des-Neiges.",
        type: "viewpoint",
        lat: 41.7956,
        lng: 9.2264,
        i18n: {
          en: { name: "Col de Bavella (1,218 m)", description: "View of the Aiguilles de Bavella and Notre-Dame-des-Neiges." },
          es: { description: "Vista de las Aiguilles de Bavella y Notre-Dame-des-Neiges." },
          fr: { name: "Col de Bavella (1 218 m)", description: "Vue sur les aiguilles de Bavella et Notre-Dame-des-Neiges." },
          de: { name: "Col de Bavella (1.218 m)", description: "Blick auf die Aiguilles de Bavella und Notre-Dame-des-Neiges." },
        },
      },
      {
        name: "Zonza",
        description: "Aldeia de montanha com restaurantes de cozinha corsa.",
        type: "restaurant",
        lat: 41.7494,
        lng: 9.1714,
        i18n: {
          en: { description: "Mountain village with Corsican restaurants." },
          es: { description: "Pueblo de montaña con restaurantes de cocina corsa." },
          fr: { description: "Village de montagne avec des restaurants de cuisine corse." },
          de: { description: "Bergdorf mit Restaurants für korsische Küche." },
        },
      },
    ],
    i18n: {
      en: { description: "From the east coast, the D268 climbs along the Solenzara river, with natural pools, to the Col de Bavella (1,218 m), dominated by the Aiguilles de Bavella, red granite needles among Corsican pines. Constant bends, pigs and cows on the road and one of the wildest landscapes in Corsica. It ends in the mountain village of Zonza." },
      es: { description: "Desde la costa este, la D268 sube junto al río Solenzara, con pozas naturales, hasta el Col de Bavella (1.218 m), dominado por las Aiguilles de Bavella, agujas de granito rojo entre pinos laricios. Curvas constantes, cerdos y vacas en la carretera y uno de los paisajes más salvajes de Córcega. Termina en el pueblo de montaña de Zonza." },
      fr: { description: "Depuis la côte est, la D268 remonte la Solenzara et ses piscines naturelles jusqu'au col de Bavella (1 218 m), dominé par les aiguilles de Bavella, flèches de granit rouge au milieu des pins laricios. Des virages en continu, des cochons et des vaches sur la route et l'un des paysages les plus sauvages de Corse. Arrivée au village de montagne de Zonza." },
      de: { description: "Von der Ostküste steigt die D268 entlang der Solenzara mit ihren Naturbecken zum Col de Bavella (1.218 m), überragt von den Aiguilles de Bavella, roten Granitnadeln zwischen Korsischen Schwarzkiefern. Ständige Kurven, Schweine und Kühe auf der Straße und eine der wildesten Landschaften Korsikas. Ziel ist das Bergdorf Zonza." },
    },
  },
  {
    title: "Volta ao Cap Corse | Bastia > Macinaggio > Centuri > Nonza > Saint-Florent",
    description:
      "Volta completa à península do Cap Corse, o \"dedo\" da Córsega. A costa leste é suave, com portos de pesca e torres genovesas; a oeste a estrada sobe para a falésia, com vista sobre o mar a 100 m de altura, passando por Centuri e Nonza. Regressa a Bastia pelo Col de Teghime. Estrada estreita e lenta, conte com um dia inteiro.",
    region: "Córsega",
    category: "coastal",
    difficulty: "moderate",
    route_type: "loop",
    waypoints: [
      [42.6975, 9.4508], // Bastia
      [42.7742, 9.4747], // Erbalunga
      [42.9625, 9.4511], // Macinaggio
      [42.9658, 9.3511], // Centuri
      [42.8956, 9.3375], // Pino
      [42.7853, 9.3436], // Nonza
      [42.6814, 9.3031], // Saint-Florent
      [42.6975, 9.4508], // Bastia
    ],
    stops: [
      {
        name: "Centuri",
        description: "Porto de pesca famoso pela lagosta.",
        type: "restaurant",
        lat: 42.9658,
        lng: 9.3511,
        i18n: {
          en: { description: "Fishing harbour famous for its lobster." },
          es: { description: "Puerto pesquero famoso por la langosta." },
          fr: { description: "Port de pêche réputé pour sa langouste." },
          de: { description: "Fischerhafen, berühmt für seine Langusten." },
        },
      },
      {
        name: "Nonza",
        description: "Aldeia sobre a falésia com torre genovesa e praia de seixos negros.",
        type: "viewpoint",
        lat: 42.7853,
        lng: 9.3436,
        i18n: {
          en: { description: "Clifftop village with a Genoese tower and a black pebble beach." },
          es: { description: "Pueblo sobre el acantilado con torre genovesa y playa de cantos negros." },
          fr: { description: "Village perché avec tour génoise et plage de galets noirs." },
          de: { description: "Dorf auf der Klippe mit Genueserturm und schwarzem Kieselstrand." },
        },
      },
    ],
    i18n: {
      en: { title: "Cap Corse loop | Bastia > Macinaggio > Centuri > Nonza > Saint-Florent", description: "A full loop of the Cap Corse peninsula, Corsica's \"finger\". The east coast is gentle, with fishing harbours and Genoese towers; on the west the road climbs onto the cliffs, 100 m above the sea, through Centuri and Nonza. Back to Bastia over the Col de Teghime. Narrow, slow road: allow a full day." },
      es: { title: "Vuelta al Cap Corse | Bastia > Macinaggio > Centuri > Nonza > Saint-Florent", description: "Vuelta completa a la península del Cap Corse, el \"dedo\" de Córcega. La costa este es suave, con puertos pesqueros y torres genovesas; al oeste la carretera sube al acantilado, a 100 m sobre el mar, pasando por Centuri y Nonza. Regreso a Bastia por el Col de Teghime. Carretera estrecha y lenta: cuenta con un día entero." },
      fr: { title: "Tour du Cap Corse | Bastia > Macinaggio > Centuri > Nonza > Saint-Florent", description: "Le tour complet du Cap Corse, le « doigt » de la Corse. La côte est est douce, avec ports de pêche et tours génoises ; à l'ouest, la route grimpe sur les falaises, à 100 m au-dessus de la mer, par Centuri et Nonza. Retour à Bastia par le col de Teghime. Route étroite et lente : comptez une journée entière." },
      de: { title: "Rund um das Cap Corse | Bastia > Macinaggio > Centuri > Nonza > Saint-Florent", description: "Eine komplette Runde um die Halbinsel Cap Corse, den „Finger“ Korsikas. Die Ostküste ist sanft, mit Fischerhäfen und Genuesertürmen; im Westen klettert die Straße auf die Klippen, 100 m über dem Meer, durch Centuri und Nonza. Zurück nach Bastia über den Col de Teghime. Schmale, langsame Straße: einen ganzen Tag einplanen." },
    },
  },

  // ────────────────────────────── NORMANDIA ──────────────────────────────
  {
    title: "Costa de Alabastro | Étretat > Fécamp > Saint-Valery-en-Caux > Dieppe",
    description:
      "A D940 acompanha as falésias brancas da Normandia, de Étretat, com os seus arcos de pedra sobre o mar, até Dieppe. Pelo caminho, Fécamp e o Palácio Bénédictine, Veules-les-Roses e pequenos vales que descem até às praias de seixos. Estrada fácil e cénica, ideal para um dia a partir de Paris ou Rouen.",
    region: "Normandia",
    category: "coastal",
    difficulty: "easy",
    route_type: "out_and_back",
    waypoints: [
      [49.7075, 0.2047], // Étretat
      [49.7578, 0.3747], // Fécamp
      [49.8697, 0.7128], // Saint-Valery-en-Caux
      [49.8706, 0.8028], // Veules-les-Roses
      [49.9225, 1.0781], // Dieppe
    ],
    stops: [
      {
        name: "Falésias de Étretat",
        description: "A Porte d'Aval e a Agulha, o postal mais famoso da Normandia.",
        type: "viewpoint",
        lat: 49.7075,
        lng: 0.2047,
        i18n: {
          en: { name: "Étretat cliffs", description: "The Porte d'Aval and the Needle, Normandy's most famous postcard." },
          es: { name: "Acantilados de Étretat", description: "La Porte d'Aval y la Aguja, la postal más famosa de Normandía." },
          fr: { name: "Falaises d'Étretat", description: "La porte d'Aval et l'Aiguille, la carte postale la plus célèbre de Normandie." },
          de: { name: "Klippen von Étretat", description: "Die Porte d'Aval und die Felsnadel, Normandies berühmteste Postkarte." },
        },
      },
      {
        name: "Palais Bénédictine",
        description: "Palácio neogótico onde se produz o licor Bénédictine, em Fécamp.",
        type: "landmark",
        lat: 49.7578,
        lng: 0.3747,
        i18n: {
          en: { description: "Neo-Gothic palace in Fécamp where Bénédictine liqueur is made." },
          es: { description: "Palacio neogótico donde se produce el licor Bénédictine, en Fécamp." },
          fr: { description: "Palais néogothique de Fécamp où est produite la liqueur Bénédictine." },
          de: { description: "Neugotischer Palast in Fécamp, in dem der Bénédictine-Likör hergestellt wird." },
        },
      },
    ],
    i18n: {
      en: { title: "Alabaster Coast | Étretat > Fécamp > Saint-Valery-en-Caux > Dieppe", description: "The D940 follows Normandy's white cliffs from Étretat, with its stone arches over the sea, to Dieppe. Along the way: Fécamp and the Bénédictine Palace, Veules-les-Roses and small valleys running down to pebble beaches. An easy, scenic road, ideal for a day out from Paris or Rouen." },
      es: { title: "Costa de Alabastro | Étretat > Fécamp > Saint-Valery-en-Caux > Dieppe", description: "La D940 sigue los acantilados blancos de Normandía, desde Étretat, con sus arcos de piedra sobre el mar, hasta Dieppe. Por el camino, Fécamp y el Palacio Bénédictine, Veules-les-Roses y pequeños valles que bajan hasta playas de cantos rodados. Carretera fácil y panorámica, ideal para un día desde París o Ruan." },
      fr: { title: "Côte d'Albâtre | Étretat > Fécamp > Saint-Valery-en-Caux > Dieppe", description: "La D940 longe les falaises blanches de Normandie, d'Étretat et ses arches au-dessus de la mer jusqu'à Dieppe. En chemin : Fécamp et le Palais Bénédictine, Veules-les-Roses et de petites valleuses qui descendent vers les plages de galets. Une route facile et panoramique, idéale pour une journée au départ de Paris ou de Rouen." },
      de: { title: "Alabasterküste | Étretat > Fécamp > Saint-Valery-en-Caux > Dieppe", description: "Die D940 folgt den weißen Klippen der Normandie von Étretat mit seinen Felsbögen über dem Meer bis Dieppe. Unterwegs: Fécamp mit dem Palais Bénédictine, Veules-les-Roses und kleine Täler, die zu Kieselstränden hinabführen. Eine leichte, landschaftlich schöne Straße – ideal für einen Tagesausflug von Paris oder Rouen." },
    },
  },
];
