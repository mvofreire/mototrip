/**
 * Blog guides. Written in Portuguese, English and Spanish; French and German
 * readers get the English version. Blocks reference site routes by slug so
 * each guide links to (and shows cards of) the routes it talks about.
 */

export type BlogLocale = 'pt' | 'en' | 'es'

export type Block =
  | { h2: string }
  | { p: string }
  | { list: string[] }
  | { tip: string }
  | { route: string } // route slug → route card

export interface PostContent {
  title: string
  description: string
  blocks: Block[]
}

export interface Post {
  slug: string
  date: string // ISO date
  /** Route whose map is the cover image */
  coverRoute: string
  content: Record<BlogLocale, PostContent>
}

export function blogLocale(locale: string): BlogLocale {
  return locale === 'pt' || locale === 'es' ? locale : 'en'
}

export const POSTS: Post[] = [
  {
    slug: 'nacional-2-de-moto-em-4-dias',
    date: '2026-11-09',
    coverRoute: 'nacional-2-chaves-faro',
    content: {
      pt: {
        title: 'Nacional 2 de moto em 4 dias: roteiro de Chaves a Faro',
        description:
          'Como fazer a EN2 de moto em quatro dias: onde parar, onde dormir, o desvio da Aguieira, o passaporte e a melhor época para ir.',
        blocks: [
          { p: 'A Estrada Nacional 2 é a viagem de moto mais icónica de Portugal: cerca de 738 km pelo interior, do marco do km 0 em Chaves ao km 738 em Faro, atravessando 35 concelhos. Dá para a fazer em dois dias, mas em quatro há tempo para parar nas vilas, nos miradouros e à mesa. Este é o roteiro que propomos, com as paradas que estão no mapa da rota no MotoTrip.' },
          { route: 'nacional-2-chaves-faro' },
          { h2: 'Dia 1: Chaves → Viseu (cerca de 155 km)' },
          { p: 'Foto no marco do km 0 em Chaves e saída para sul. As primeiras paragens são termais: o parque de Vidago e o de Pedras Salgadas. Depois de Vila Real, a estrada desce ao Douro vinhateiro em Peso da Régua, sobe a Lamego (o escadório do Santuário dos Remédios merece a paragem) e atravessa a serra até Viseu, uma boa cidade para dormir e jantar.' },
          { h2: 'Dia 2: Viseu → Abrantes (cerca de 200 km)' },
          { p: 'É o dia mais sinuoso. Entre Santa Comba Dão e Penacova a EN2 desaparece debaixo da albufeira da Aguieira e o desvio faz-se pelo IP3. Em Penacova, o miradouro da Livraria do Mondego; depois Góis, a barragem do Cabril, onde a estrada cruza o Zêzere, e o Centro Geodésico de Portugal, no alto da Melriça. Termina-se no Tejo, em Abrantes.' },
          { h2: 'Dia 3: Abrantes → Ferreira do Alentejo (cerca de 190 km)' },
          { p: 'O ritmo muda: retas longas, montado de sobro e vilas brancas. Ponte de Sor e Montargil têm marcos dos 75 anos da EN2, em Ciborro está o marco do km 500 e Montemor-o-Novo tem castelo com vista sobre a planície. Ferreira do Alentejo, com a capela cilíndrica do Calvário, é uma boa paragem para a noite.' },
          { h2: 'Dia 4: Ferreira do Alentejo → Faro (cerca de 135 km)' },
          { p: 'Aljustrel e Almodôvar são as últimas vilas alentejanas antes da serra do Caldeirão, o troço mais divertido da EN2: cerca de 60 km de curvas até São Brás de Alportel. Depois é descer até ao marco do km 738, na entrada de Faro.' },
          { h2: 'Dicas para a viagem' },
          { list: [
            'Melhor época: primavera e outono. No verão o Alentejo passa facilmente dos 35 °C.',
            'Passaporte da EN2: os postos de turismo dos municípios da rota carimbam o passaporte; é uma boa desculpa para parar em cada vila.',
            'Combustível: no Alentejo e na serra do Caldeirão há troços longos sem bombas. Abasteça sempre que puder.',
            'Ao fim de semana, sobretudo na primavera, há muitos grupos de motas: reserve dormida com antecedência.',
            'Baixe o GPX no MotoTrip e leve-o no GPS. A sinalização da EN2 nem sempre é clara nas cidades.',
          ] },
          { tip: 'Já fez a Nacional 2? Marque "Já fiz esta rota" na página da rota e deixe a sua avaliação para ajudar quem vai a seguir.' },
        ],
      },
      en: {
        title: 'Portugal’s N2 by motorcycle in 4 days: Chaves to Faro itinerary',
        description:
          'How to ride the N2 in four days: where to stop and sleep, the Aguieira detour, the N2 passport and the best time to go.',
        blocks: [
          { p: 'National Road 2 is Portugal’s most iconic motorcycle trip: about 738 km through the interior, from the km 0 marker in Chaves to km 738 in Faro, crossing 35 municipalities. You can ride it in two days, but four gives you time to stop in the towns, at the viewpoints and at the table. This is the itinerary we suggest, using the stops on the route map on MotoTrip.' },
          { route: 'nacional-2-chaves-faro' },
          { h2: 'Day 1: Chaves → Viseu (about 155 km)' },
          { p: 'Photo at the km 0 marker in Chaves and head south. The first stops are spa towns: the parks of Vidago and Pedras Salgadas. After Vila Real the road drops into the Douro wine region at Peso da Régua, climbs to Lamego (the stairway of the Remédios sanctuary is worth the stop) and crosses the hills to Viseu, a good city to sleep and eat.' },
          { h2: 'Day 2: Viseu → Abrantes (about 200 km)' },
          { p: 'The twistiest day. Between Santa Comba Dão and Penacova the N2 disappears under the Aguieira reservoir and you detour on the IP3. In Penacova, the Livraria do Mondego viewpoint; then Góis, the Cabril dam, where the road crosses the Zêzere, and the Geodesic Centre of Portugal on top of the Melriça hill. You finish on the Tagus, in Abrantes.' },
          { h2: 'Day 3: Abrantes → Ferreira do Alentejo (about 190 km)' },
          { p: 'The rhythm changes: long straights, cork oak country and white villages. Ponte de Sor and Montargil have N2 75th anniversary markers, Ciborro has the km 500 marker and Montemor-o-Novo has a castle overlooking the plain. Ferreira do Alentejo, with its round Calvário chapel, is a good place for the night.' },
          { h2: 'Day 4: Ferreira do Alentejo → Faro (about 135 km)' },
          { p: 'Aljustrel and Almodôvar are the last Alentejo towns before the Caldeirão hills, the most fun stretch of the N2: about 60 km of bends to São Brás de Alportel. Then it’s downhill to the km 738 marker on the way into Faro.' },
          { h2: 'Tips for the trip' },
          { list: [
            'Best time: spring and autumn. In summer the Alentejo easily goes above 35 °C.',
            'N2 passport: the tourist offices of the towns on the route stamp the passport, a good excuse to stop in each one.',
            'Fuel: the Alentejo and the Caldeirão hills have long stretches without petrol stations. Fill up whenever you can.',
            'At weekends, especially in spring, there are lots of riding groups: book your accommodation ahead.',
            'Download the GPX from MotoTrip and load it on your GPS. N2 signposting is not always clear in towns.',
          ] },
          { tip: 'Already ridden the N2? Tap "I rode this route" on the route page and leave your rating to help the next riders.' },
        ],
      },
      es: {
        title: 'La Nacional 2 de Portugal en moto en 4 días: ruta de Chaves a Faro',
        description:
          'Cómo hacer la N2 en moto en cuatro días: dónde parar y dormir, el desvío de Aguieira, el pasaporte y la mejor época para ir.',
        blocks: [
          { p: 'La Nacional 2 es el viaje en moto más icónico de Portugal: unos 738 km por el interior, del hito del km 0 en Chaves al km 738 en Faro, atravesando 35 municipios. Se puede hacer en dos días, pero en cuatro hay tiempo para parar en los pueblos, en los miradores y en la mesa. Esta es la ruta que proponemos, con las paradas que aparecen en el mapa de la ruta en MotoTrip.' },
          { route: 'nacional-2-chaves-faro' },
          { h2: 'Día 1: Chaves → Viseu (unos 155 km)' },
          { p: 'Foto en el hito del km 0 en Chaves y salida hacia el sur. Las primeras paradas son termales: los parques de Vidago y Pedras Salgadas. Después de Vila Real, la carretera baja al Duero vinícola en Peso da Régua, sube a Lamego (la escalinata del santuario de los Remédios merece la parada) y cruza la sierra hasta Viseu, buena ciudad para dormir y cenar.' },
          { h2: 'Día 2: Viseu → Abrantes (unos 200 km)' },
          { p: 'Es el día más revirado. Entre Santa Comba Dão y Penacova la N2 desaparece bajo el embalse de Aguieira y el desvío se hace por la IP3. En Penacova, el mirador de la Livraria do Mondego; después Góis, la presa de Cabril, donde la carretera cruza el Zêzere, y el Centro Geodésico de Portugal en lo alto de la Melriça. Se termina en el Tajo, en Abrantes.' },
          { h2: 'Día 3: Abrantes → Ferreira do Alentejo (unos 190 km)' },
          { p: 'El ritmo cambia: rectas largas, dehesas de alcornoques y pueblos blancos. Ponte de Sor y Montargil tienen hitos de los 75 años de la N2, en Ciborro está el hito del km 500 y Montemor-o-Novo tiene un castillo con vistas a la llanura. Ferreira do Alentejo, con su capilla cilíndrica del Calvario, es buena parada para la noche.' },
          { h2: 'Día 4: Ferreira do Alentejo → Faro (unos 135 km)' },
          { p: 'Aljustrel y Almodôvar son los últimos pueblos del Alentejo antes de la sierra de Caldeirão, el tramo más divertido de la N2: unos 60 km de curvas hasta São Brás de Alportel. Después solo queda bajar hasta el hito del km 738, a la entrada de Faro.' },
          { h2: 'Consejos para el viaje' },
          { list: [
            'Mejor época: primavera y otoño. En verano el Alentejo pasa con facilidad de los 35 °C.',
            'Pasaporte de la N2: las oficinas de turismo de los municipios de la ruta sellan el pasaporte, una buena excusa para parar en cada pueblo.',
            'Combustible: en el Alentejo y en la sierra de Caldeirão hay tramos largos sin gasolineras. Reposta siempre que puedas.',
            'Los fines de semana, sobre todo en primavera, hay muchos grupos de moteros: reserva el alojamiento con antelación.',
            'Descarga el GPX en MotoTrip y llévalo en el GPS. La señalización de la N2 no siempre es clara en las ciudades.',
          ] },
          { tip: '¿Ya hiciste la Nacional 2? Marca "Ya hice esta ruta" en la página de la ruta y deja tu valoración para ayudar a los siguientes.' },
        ],
      },
    },
  },
  {
    slug: 'melhores-rotas-de-moto-em-portugal',
    date: '2026-11-09',
    coverRoute: 'n222-peso-da-regua-pinhao-sao-joao-da-pesqueira',
    content: {
      pt: {
        title: 'As 10 melhores rotas de moto em Portugal',
        description:
          'Do Douro à Serra da Estrela e à Costa Vicentina: dez estradas portuguesas que todo o motociclista devia fazer, com mapa, paradas e GPX.',
        blocks: [
          { p: 'Portugal é pequeno no mapa e enorme em curvas. Em poucas horas passa-se de vales de vinha para serras de granito e falésias sobre o Atlântico. Escolhemos dez rotas do MotoTrip para começar, do norte ao sul. Todas têm mapa, paradas recomendadas e GPX grátis.' },
          { h2: '1. N222 no Douro' },
          { p: 'Considerada uma das melhores estradas do mundo para conduzir: curvas bem desenhadas entre socalcos de vinha, sempre com o rio por perto.' },
          { route: 'n222-peso-da-regua-pinhao-sao-joao-da-pesqueira' },
          { h2: '2. Serra da Estrela pela N339' },
          { p: 'A estrada mais alta de Portugal continental, da Covilhã à Torre (1.993 m) e a Seia. No inverno pode fechar por neve.' },
          { route: 'serra-da-estrela-covilha-torre-seia' },
          { h2: '3. Nacional 2' },
          { p: 'A travessia do país pelo interior, de Chaves a Faro. Para fazer em vários dias.' },
          { route: 'nacional-2-chaves-faro' },
          { h2: '4. Peneda-Gerês' },
          { p: 'O único parque nacional do país: estradas estreitas, granito, sombra e a albufeira da Caniçada lá em baixo.' },
          { route: 'peneda-geres-braga-canicada-geres' },
          { h2: '5. Costa Vicentina' },
          { p: 'Falésias, praias desertas e vento atlântico, do Cabo de São Vicente a Vila Nova de Milfontes.' },
          { route: 'costa-vicentina-cabo-de-sao-vicente-vila-nova-de-milfontes' },
          { h2: '6. Serra da Arrábida' },
          { p: 'A crista da serra com o mar turquesa por baixo, a meia hora de Lisboa.' },
          { route: 'serra-da-arrabida-setubal-sesimbra-cabo-espichel' },
          { h2: '7. Serra do Marão pela estrada antiga' },
          { p: 'Desde que abriu o túnel da A4, a velha travessia do Marão ficou quase só para quem gosta de curvas.' },
          { route: 'serra-do-marao-amarante-vila-real-pela-estrada-antiga' },
          { h2: '8. Douro Internacional' },
          { p: 'A N221 pela fronteira, com arribas, amendoeiras, pouco trânsito e a descida final até Barca d’Alva.' },
          { route: 'douro-internacional-miranda-do-douro-barca-dalva' },
          { h2: '9. Serra de Monchique' },
          { p: 'O Algarve longe das praias, até à Fóia, o ponto mais alto da região, com o mar sempre no horizonte.' },
          { route: 'serra-de-monchique-portimao-foia-aljezur-lagos' },
          { h2: '10. Serra do Açor até ao Piódão' },
          { p: 'Curvas contínuas até à aldeia de xisto mais famosa do país. Exige atenção, mas a chegada compensa.' },
          { route: 'serra-do-acor-arganil-piodao' },
          { tip: 'Conhece uma rota que devia estar nesta lista? Envie-a no MotoTrip. Depois de revista pela equipa, fica disponível para toda a comunidade.' },
        ],
      },
      en: {
        title: 'The 10 best motorcycle routes in Portugal',
        description:
          'From the Douro to the Serra da Estrela and the Costa Vicentina: ten Portuguese roads every rider should do, with map, stops and GPX.',
        blocks: [
          { p: 'Portugal is small on the map and huge on bends. In a few hours you go from vineyard valleys to granite mountains and cliffs above the Atlantic. We picked ten MotoTrip routes to get you started, from north to south. Each one has a map, recommended stops and a free GPX.' },
          { h2: '1. The N222 in the Douro' },
          { p: 'Rated one of the best driving roads in the world: well-shaped bends between vineyard terraces, always close to the river.' },
          { route: 'n222-peso-da-regua-pinhao-sao-joao-da-pesqueira' },
          { h2: '2. Serra da Estrela on the N339' },
          { p: 'The highest road in mainland Portugal, from Covilhã to Torre (1,993 m) and Seia. It can close for snow in winter.' },
          { route: 'serra-da-estrela-covilha-torre-seia' },
          { h2: '3. National Road 2' },
          { p: 'The crossing of the country through the interior, from Chaves to Faro. One to ride over several days.' },
          { route: 'nacional-2-chaves-faro' },
          { h2: '4. Peneda-Gerês' },
          { p: 'The country’s only national park: narrow roads, granite, shade and the Caniçada reservoir below.' },
          { route: 'peneda-geres-braga-canicada-geres' },
          { h2: '5. Costa Vicentina' },
          { p: 'Cliffs, empty beaches and Atlantic wind, from Cape St. Vincent to Vila Nova de Milfontes.' },
          { route: 'costa-vicentina-cabo-de-sao-vicente-vila-nova-de-milfontes' },
          { h2: '6. Arrábida hills' },
          { p: 'The ridge of the hills with a turquoise sea below, half an hour from Lisbon.' },
          { route: 'serra-da-arrabida-setubal-sesimbra-cabo-espichel' },
          { h2: '7. The old road over the Marão' },
          { p: 'Since the A4 tunnel opened, the old Marão crossing has been left almost entirely to people who love bends.' },
          { route: 'serra-do-marao-amarante-vila-real-pela-estrada-antiga' },
          { h2: '8. Douro International' },
          { p: 'The N221 along the border, with cliffs, almond trees, little traffic and a final descent to Barca d’Alva.' },
          { route: 'douro-internacional-miranda-do-douro-barca-dalva' },
          { h2: '9. Monchique hills' },
          { p: 'The Algarve away from the beaches, up to Fóia, the region’s highest point, with the sea always on the horizon.' },
          { route: 'serra-de-monchique-portimao-foia-aljezur-lagos' },
          { h2: '10. Açor hills to Piódão' },
          { p: 'Continuous bends to the country’s most famous schist village. It needs attention, but the arrival is worth it.' },
          { route: 'serra-do-acor-arganil-piodao' },
          { tip: 'Know a route that should be on this list? Submit it on MotoTrip. Once the team has reviewed it, it’s available to the whole community.' },
        ],
      },
      es: {
        title: 'Las 10 mejores rutas en moto por Portugal',
        description:
          'Del Duero a la Sierra de la Estrella y la Costa Vicentina: diez carreteras portuguesas que todo motero debería hacer, con mapa, paradas y GPX.',
        blocks: [
          { p: 'Portugal es pequeño en el mapa y enorme en curvas. En pocas horas se pasa de valles de viñedo a sierras de granito y acantilados sobre el Atlántico. Elegimos diez rutas de MotoTrip para empezar, de norte a sur. Todas tienen mapa, paradas recomendadas y GPX gratis.' },
          { h2: '1. La N222 en el Duero' },
          { p: 'Considerada una de las mejores carreteras del mundo para conducir: curvas bien trazadas entre bancales de viñedo, siempre junto al río.' },
          { route: 'n222-peso-da-regua-pinhao-sao-joao-da-pesqueira' },
          { h2: '2. Sierra de la Estrella por la N339' },
          { p: 'La carretera más alta de Portugal continental, de Covilhã a la Torre (1.993 m) y a Seia. En invierno puede cerrar por nieve.' },
          { route: 'serra-da-estrela-covilha-torre-seia' },
          { h2: '3. Nacional 2' },
          { p: 'La travesía del país por el interior, de Chaves a Faro. Para hacer en varios días.' },
          { route: 'nacional-2-chaves-faro' },
          { h2: '4. Peneda-Gerês' },
          { p: 'El único parque nacional del país: carreteras estrechas, granito, sombra y el embalse de Caniçada abajo.' },
          { route: 'peneda-geres-braga-canicada-geres' },
          { h2: '5. Costa Vicentina' },
          { p: 'Acantilados, playas desiertas y viento atlántico, del Cabo de San Vicente a Vila Nova de Milfontes.' },
          { route: 'costa-vicentina-cabo-de-sao-vicente-vila-nova-de-milfontes' },
          { h2: '6. Sierra de la Arrábida' },
          { p: 'La cresta de la sierra con el mar turquesa debajo, a media hora de Lisboa.' },
          { route: 'serra-da-arrabida-setubal-sesimbra-cabo-espichel' },
          { h2: '7. Sierra del Marão por la carretera antigua' },
          { p: 'Desde que abrió el túnel de la A4, la vieja travesía del Marão quedó casi solo para los amantes de las curvas.' },
          { route: 'serra-do-marao-amarante-vila-real-pela-estrada-antiga' },
          { h2: '8. Duero Internacional' },
          { p: 'La N221 por la frontera, con arribes, almendros, poco tráfico y la bajada final hasta Barca d’Alva.' },
          { route: 'douro-internacional-miranda-do-douro-barca-dalva' },
          { h2: '9. Sierra de Monchique' },
          { p: 'El Algarve lejos de las playas, hasta la Fóia, el punto más alto de la región, con el mar siempre en el horizonte.' },
          { route: 'serra-de-monchique-portimao-foia-aljezur-lagos' },
          { h2: '10. Sierra del Açor hasta Piódão' },
          { p: 'Curvas continuas hasta la aldea de pizarra más famosa del país. Exige atención, pero la llegada compensa.' },
          { route: 'serra-do-acor-arganil-piodao' },
          { tip: '¿Conoces una ruta que debería estar en esta lista? Envíala en MotoTrip. Después de que el equipo la revise, estará disponible para toda la comunidad.' },
        ],
      },
    },
  },
  {
    slug: 'rotas-de-moto-picos-de-europa-e-pireneus',
    date: '2026-11-09',
    coverRoute: 'grande-volta-dos-picos-cangas-de-onis-los-beyos-san-glorio-potes',
    content: {
      pt: {
        title: 'Rotas de moto no norte de Espanha: Picos de Europa e Pirenéus',
        description:
          'Desfiladeiros, portos de montanha acima dos 2.000 m e vilas medievais: cinco rotas de moto nos Picos de Europa e nos Pirenéus, com dicas de época.',
        blocks: [
          { p: 'Para quem vive em Portugal, o norte de Espanha é a extensão natural das viagens de moto: os Picos de Europa ficam a um dia de estrada a partir do Porto, e os Pirenéus são o grande destino de verão. São estradas de montanha a sério, com portos de altitude, desfiladeiros e muito pouco trânsito fora de agosto.' },
          { h2: 'Picos de Europa' },
          { p: 'A Grande Volta dos Picos é o clássico: um dia inteiro pelo desfiladeiro de Los Beyos, pela albufeira de Riaño e pelo porto de San Glorio, a 1.609 m, com a descida a Potes.' },
          { route: 'grande-volta-dos-picos-cangas-de-onis-los-beyos-san-glorio-potes' },
          { p: 'Se tiver só meio dia, faça o desfiladeiro de La Hermida até Potes e suba a Fuente Dé, onde a estrada acaba ao pé do teleférico.' },
          { route: 'picos-de-europa-desfiladeiro-de-la-hermida-potes-fuente-de' },
          { h2: 'Pirenéus' },
          { p: 'No Pirenéu aragonês, o Vale de Tena sobe de Jaca até à fronteira francesa no Col du Pourtalet (1.794 m), com o Pic du Midi d’Ossau em frente.' },
          { route: 'pireneus-aragoneses-jaca-vale-de-tena-col-du-pourtalet' },
          { p: 'Mais a leste, a N-260 passa o porto de Cotefablo e entra em Torla, a porta do Parque Nacional de Ordesa, antes de acabar na vila medieval de Aínsa.' },
          { route: 'ordesa-e-sobrarbe-biescas-cotefablo-torla-ainsa' },
          { p: 'E na Catalunha, o Port de la Bonaigua, a 2.072 m, é uma das grandes subidas da cordilheira, até ao Val d’Aran.' },
          { route: 'pireneus-catalaes-sort-port-de-la-bonaigua-vielha' },
          { h2: 'Quando ir e o que levar' },
          { list: [
            'A melhor época vai de junho a setembro. Fora disso, os portos mais altos podem ter neve ou fechar.',
            'Mesmo no verão, no alto dos portos faz frio e o tempo muda depressa: leve camada térmica e impermeável.',
            'Agosto é o mês com mais trânsito e alojamento mais caro. Junho e setembro são ideais.',
            'Nas vilas de montanha há bombas, mas não em todos os vales. Abasteça antes de cada porto.',
          ] },
          { tip: 'Veja todas as rotas em Espanha na página de destinos do MotoTrip, com mapa e GPX grátis.' },
        ],
      },
      en: {
        title: 'Motorcycle routes in northern Spain: Picos de Europa and the Pyrenees',
        description:
          'Gorges, mountain passes above 2,000 m and medieval towns: five motorcycle routes in the Picos de Europa and the Pyrenees, with tips on when to go.',
        blocks: [
          { p: 'For riders based in Portugal, northern Spain is the natural next step: the Picos de Europa are a day’s ride from Porto, and the Pyrenees are the big summer destination. These are proper mountain roads, with high passes, gorges and very little traffic outside August.' },
          { h2: 'Picos de Europa' },
          { p: 'The Grand Picos Loop is the classic: a full day through the Los Beyos gorge, past the Riaño reservoir and over the San Glorio pass at 1,609 m, with the descent to Potes.' },
          { route: 'grande-volta-dos-picos-cangas-de-onis-los-beyos-san-glorio-potes' },
          { p: 'If you only have half a day, ride the La Hermida gorge to Potes and climb to Fuente Dé, where the road ends at the foot of the cable car.' },
          { route: 'picos-de-europa-desfiladeiro-de-la-hermida-potes-fuente-de' },
          { h2: 'The Pyrenees' },
          { p: 'In the Aragonese Pyrenees, the Tena valley climbs from Jaca to the French border at the Col du Pourtalet (1,794 m), facing the Pic du Midi d’Ossau.' },
          { route: 'pireneus-aragoneses-jaca-vale-de-tena-col-du-pourtalet' },
          { p: 'Further east, the N-260 crosses the Cotefablo pass and enters Torla, the gateway to Ordesa National Park, before ending in the medieval town of Aínsa.' },
          { route: 'ordesa-e-sobrarbe-biescas-cotefablo-torla-ainsa' },
          { p: 'And in Catalonia, the Port de la Bonaigua at 2,072 m is one of the great climbs of the range, down to the Val d’Aran.' },
          { route: 'pireneus-catalaes-sort-port-de-la-bonaigua-vielha' },
          { h2: 'When to go and what to pack' },
          { list: [
            'The best season is June to September. Outside it, the highest passes can have snow or be closed.',
            'Even in summer it’s cold at the top of the passes and the weather changes fast: pack a thermal layer and waterproofs.',
            'August has the most traffic and the most expensive accommodation. June and September are ideal.',
            'Mountain towns have petrol stations, but not every valley does. Fill up before each pass.',
          ] },
          { tip: 'See all the routes in Spain on MotoTrip’s destinations page, with map and free GPX.' },
        ],
      },
      es: {
        title: 'Rutas en moto por el norte de España: Picos de Europa y Pirineos',
        description:
          'Desfiladeros, puertos por encima de los 2.000 m y villas medievales: cinco rutas en moto por los Picos de Europa y los Pirineos, con consejos de época.',
        blocks: [
          { p: 'Para quien vive en Portugal, el norte de España es la extensión natural de los viajes en moto: los Picos de Europa están a un día de carretera desde Oporto, y los Pirineos son el gran destino de verano. Son carreteras de montaña de verdad, con puertos de altura, desfiladeros y muy poco tráfico fuera de agosto.' },
          { h2: 'Picos de Europa' },
          { p: 'La Gran Vuelta a los Picos es el clásico: un día entero por el desfiladero de Los Beyos, el embalse de Riaño y el puerto de San Glorio, a 1.609 m, con la bajada a Potes.' },
          { route: 'grande-volta-dos-picos-cangas-de-onis-los-beyos-san-glorio-potes' },
          { p: 'Si solo tienes medio día, haz el desfiladero de La Hermida hasta Potes y sube a Fuente Dé, donde la carretera termina al pie del teleférico.' },
          { route: 'picos-de-europa-desfiladeiro-de-la-hermida-potes-fuente-de' },
          { h2: 'Pirineos' },
          { p: 'En el Pirineo aragonés, el Valle de Tena sube de Jaca a la frontera francesa en el Col du Pourtalet (1.794 m), frente al Pic du Midi d’Ossau.' },
          { route: 'pireneus-aragoneses-jaca-vale-de-tena-col-du-pourtalet' },
          { p: 'Más al este, la N-260 cruza el puerto de Cotefablo y entra en Torla, puerta del Parque Nacional de Ordesa, antes de terminar en la villa medieval de Aínsa.' },
          { route: 'ordesa-e-sobrarbe-biescas-cotefablo-torla-ainsa' },
          { p: 'Y en Cataluña, el Port de la Bonaigua, a 2.072 m, es una de las grandes subidas de la cordillera, hasta el Val d’Aran.' },
          { route: 'pireneus-catalaes-sort-port-de-la-bonaigua-vielha' },
          { h2: 'Cuándo ir y qué llevar' },
          { list: [
            'La mejor época va de junio a septiembre. Fuera de ella, los puertos más altos pueden tener nieve o estar cerrados.',
            'Incluso en verano hace frío en lo alto de los puertos y el tiempo cambia rápido: lleva una capa térmica e impermeable.',
            'Agosto es el mes con más tráfico y alojamiento más caro. Junio y septiembre son ideales.',
            'En los pueblos de montaña hay gasolineras, pero no en todos los valles. Reposta antes de cada puerto.',
          ] },
          { tip: 'Mira todas las rutas en España en la página de destinos de MotoTrip, con mapa y GPX gratis.' },
        ],
      },
    },
  },
]

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug)
}

/** Route slugs a post links to, in order */
export function postRouteSlugs(post: Post, lang: BlogLocale) {
  return post.content[lang].blocks.flatMap((b) => ('route' in b ? [b.route] : []))
}
