---
name: create-routes
description: Cria rotas de moto curadas (país, região, tipo de rota, quantidade) e importa no Supabase com geometria, mapa, paradas e traduções. Use quando pedirem para gerar, criar ou adicionar rotas a um país ou região.
argument-hint: "[país] [região] [tipo: scenic|mountain|coastal|weekend|adventure] [quantidade]"
---

# /create-routes

Pedido: $ARGUMENTS

Interprete o pedido: **país** (obrigatório), e opcionalmente **região**, **tipo** (`category`), **dificuldade** e **quantidade** (padrão: 10). Se o país não for dito e não der para deduzir, pergunte. O resto tem padrão sensato: escolha você e diga o que escolheu.

## 1. Ver o que já existe

- Banco: projeto Supabase `xqwhvfvaayjjereahlat`. Consulte as rotas do país para não duplicar estradas:
  `select title, region, category, slug from routes where country = '<CC>' order by region;`
- Datasets: `jobs/data/curated_routes_<cc>.ts` (pt, es, fr já existem). O tipo `CuratedRoute`, o `StopType` e a união de `region` ficam em `jobs/data/curated_routes_pt.ts`.
- Destinos: `lib/regions.ts` (países e regiões com `match`) e `lib/countries.ts` (países no filtro do explorar e no formulário).

## 2. Escrever as rotas

Acrescente as rotas ao dataset do país, ou crie `jobs/data/curated_routes_<cc>.ts` no mesmo formato e registre-o em `DATASETS` dentro de `jobs/import_curated_routes.ts`.

Cada rota:
- **title**: `"Nome | Ponto A > Ponto B > Ponto C"`. Os nomes de lugares ficam no idioma local. Ele gera o slug (`public.slugify`), que **nunca muda depois de criado**. O slugify só converte `áàâãäåāéèêëēíìîïóòôõöøúùûüçñ`, e apóstrofos são removidos. Evite `œ æ ß ł` e afins no título.
- **description**: original em **português europeu**, como nos datasets existentes ("paragem", "miradouro", "abasteça"). Use 2 a 4 frases: que estrada é, o que tem de especial, avisos (época de abertura, estrada estreita, trânsito).
- **region**: um valor da união `region` em `curated_routes_pt.ts`. Se for uma região nova, acrescente-a ali.
- **category**, **difficulty** e **route_type** (`loop` só se termina no ponto de partida). Use `featured: true` em no máximo 1 ou 2 por país. Não dê notas: a nota pública é a Avaliação MotoTrip, feita com pesquisa no passo 6.
- **waypoints** `[lat, lng]`: pontos **na estrada pretendida**, que obrigam o OSRM a seguir esse caminho. Prefira vilas, colos e cruzamentos conhecidos, e não ponha pontos em cumes fora da estrada.
- **stops**: 2 ou 3 paradas reais (`viewpoint`, `cafe`, `gas_station`, `restaurant`, `landmark`, `accommodation`) com coordenadas.
- **i18n** da rota: `en`, `es`, `fr`, `de` com `description` (obrigatório) e `title` só quando difere do original (ex.: "Lago de Annecy" → "Lake Annecy").
- **i18n** das paradas: `description` em cada idioma, mais `name` quando o nome muda (ex.: "Viaduto de Millau" → "Millau Viaduct"). Números com o separador de cada idioma: 2.764 m (pt/es/de), 2,764 m (en), 2 764 m (fr).

Não invente fatos (altitudes, datas, nomes). Na dúvida, escreva de forma mais genérica.

## 3. Dry run e correção

```bash
npx tsx jobs/import_curated_routes.ts --dataset=<cc> --dry --out=<scratchpad>/thumbs
```

Use `--only=<trecho do título>` para testar uma rota só. Para cada rota, confira:
- `⚠ far snap` (ponto a mais de 300 m de uma estrada): corrija ou remova o waypoint;
- duração absurda para a distância, ou `detour` muito acima de ~2,5 para uma rota linear: o roteador provavelmente usou um caminho errado;
- abra os PNGs em `<scratchpad>/thumbs` das rotas suspeitas e veja se o traçado segue a estrada certa.

Repita até tudo estar limpo.

## 4. Importar

```bash
npx tsx jobs/import_curated_routes.ts --dataset=<cc>
```

Rode em background: ele espera 3 s entre rotas e faz backoff quando o OSRM devolve 429, então 20 rotas levam vários minutos. O script pula títulos que já existem. Como é inserido com a service role e `published: true`, a rota entra já como `approved`.

## 5. País ou região novos no site

- **País novo:** adicione-o em `lib/countries.ts` (código, bandeira, nomes nos 5 idiomas), o que já o coloca no filtro do explorar e no formulário de envio. Depois adicione-o em `lib/regions.ts` como `kind: 'country'`, com intro nos 5 idiomas.
- **Região nova:** adicione-a em `lib/regions.ts` como `kind: 'region'`, com `match` contendo o valor exato de `routes.region`, nome e intro nos 5 idiomas. Se a região tiver o mesmo nome em dois países (ex.: Pirenéus), use um slug próprio (`pireneus-franceses`): o `match` já filtra por país.
- Avalie incluir o destino em `components/layout/footer.tsx` (lista fixa de slugs).
- Sitemap, página de destinos e páginas de região são gerados a partir de `REGIONS`, então não precisa mexer neles.

## 6. Avaliação MotoTrip

Depois de importar, rode `/rate-routes` com os slugs das rotas novas. Ele pesquisa cada rota na internet e grava as notas (1–5), o veredito e as fontes. Rota sem avaliação aparece no site sem nota e no fim da ordenação por "Melhor avaliação MotoTrip".

## 7. Verificar

- SQL: confirme quantidade, `status = 'approved'`, `thumbnail_url` preenchido e traduções. Por exemplo, `(select count(*) from jsonb_object_keys(translations))` deve dar 4, e as paradas devem ter `translations ? 'fr'`.
- `npx tsc --noEmit -p .` e `npx tsc --noEmit -p jobs`.
- Dev server (`preview_start` com `mototrip-dev`): `/fr/explore` com o filtro do país, `/pt/regions/<slug>` e uma página de rota em outro idioma.

## 8. Relatório

Liste as rotas criadas por região com o **slug** de cada uma (o `/create-post` usa esses slugs), a nota MotoTrip e a confiança de cada uma, as correções de waypoint feitas e o que não foi verificado. Não faça commit sem o usuário pedir.
