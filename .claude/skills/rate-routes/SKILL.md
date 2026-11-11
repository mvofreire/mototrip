---
name: rate-routes
description: Pesquisa na internet a qualidade de rotas de moto já publicadas e grava a Avaliação MotoTrip (notas 1–5, veredito, destaques, avisos, fontes, traduções) assinada pelo perfil Mototrip. Use quando pedirem para avaliar, dar nota, rever ou pesquisar a qualidade de rotas de um país, de uma região ou de uma rota específica.
argument-hint: "[país (pt|es|fr) | trecho do slug] [--overwrite]"
---

# /rate-routes

Pedido: $ARGUMENTS

A Avaliação MotoTrip é a opinião editorial da curadoria, separada da avaliação da comunidade. Ela é publicada na hora e mostra as fontes na página da rota, então **cada afirmação precisa de uma fonte real**.

## 1. Escolher as rotas

Banco: projeto Supabase `xqwhvfvaayjjereahlat`. Sem argumento, avalie as rotas publicadas que ainda não têm avaliação:

```sql
select r.slug, r.title, r.country, r.region, r.distance_km, r.description
from routes r left join route_curator_reviews c on c.route_id = r.id
where r.published and c.route_id is null
order by r.country, r.region;
```

Com um país, filtre por `country`. Com um trecho, filtre por `slug ilike`. Reavaliar uma rota que já tem avaliação exige `--overwrite`, porque a avaliação pode ter sido corrigida à mão no Admin. Leia também as paradas (`route_stops`) para saber por onde a rota passa.

Com muitas rotas (mais de ~8), divida por país e use um subagente por país em paralelo. Cada um recebe esta skill e escreve só o arquivo do seu país.

## 2. Pesquisar cada rota

Use o WebSearch (modo `standard`; `extended` só se o resultado vier pobre). Faça de 3 a 5 buscas por rota, no idioma local e em inglês:

- números e nomes das estradas, colos e serras do título (`N222`, `Col du Galibier`, `Serra do Açor`), mais `mota`/`moto`/`motorcycle`/`motorbike`;
- `"<estrada>" estado do piso`, `asfalto`, `road condition`, `état de la route`, `firme`;
- `"<estrada>" best motorcycle roads` e sites de rotas de moto (motorcycleroads.com, riderplanet, ridermagazine, curvas.pt, rutasmoto…), revistas de moto, relatos de viagem, fóruns e Reddit (r/motorcycles, r/motorbikes, r/portugal…);
- avisos: fechamentos de inverno, obras recentes, trânsito turístico, gravilha, nevoeiro.

Abra com WebFetch as 2 a 4 páginas mais úteis e confirme ali o que vai citar. Não use como fonte:
- páginas geradas automaticamente ou por IA, sem conteúdo próprio (ex.: guias do ryo.co);
- páginas do próprio MotoTrip;
- resultados que só citam o nome da estrada.

Prefira relatos de motociclistas e fontes recentes (últimos ~5 anos). Quando as fontes discordam, siga a mais recente e cite a divergência nos avisos.

## 3. Dar as notas (1–5, meio ponto)

**Paisagem (`scenic`)**
- 5: das mais bonitas do país ou da Europa, vistas constantes (vales, miradouros, costa, alta montanha).
- 4: muito bonita na maior parte do trajeto.
- 3: agradável, com trechos sem interesse.
- 2: pouco interessante.
- 1: sem atrativo.

**Estrada (`road`)**: estado do piso e segurança para moto.
- 5: asfalto excelente e bem conservado, sinalização boa.
- 4: bom, com defeitos pontuais.
- 3: irregular, remendos, trechos degradados ou estreitos.
- 2: muitos buracos ou gravilha frequente.
- 1: muito danificado ou de terra.

**Diversão (`fun`)**: o prazer de pilotar.
- 5: curvas encadeadas e ritmo fluido do início ao fim, pouco trânsito.
- 4: muitas boas curvas, algum trânsito ou trecho monótono.
- 3: misto.
- 2: sobretudo retas, ou trânsito constante.
- 1: sem interesse para pilotar.

**Geral (`overall`)**: o juízo da curadoria, não uma média. Ainda assim, deve ficar a no máximo 1 ponto da média dos três (o script valida). Pense em "quanto vale a viagem de moto até lá".

**Confiança (`confidence`)**: conte os sites diferentes que deram informação útil.
- `high`: 3 ou mais sites que concordam.
- `medium`: 2 sites.
- `low`: 1 site, ou informação vaga. Com confiança baixa, seja conservador: não dê 5 e prefira notas perto de 3,5 onde faltar informação.

Seja honesto: nem toda rota é 4,5. Use a escala inteira e compare com as outras rotas do mesmo país.

## 4. Escrever

Os textos vão em **português europeu** ("mota", "paragem", "miradouro", "piso", "abasteça"), num tom editorial direto:

- `verdict`: 2 a 4 frases. Diga como é a estrada, para quem é e o que a torna especial (ou não). Não repita os dados da rota (distância, duração).
- `highlights`: 2 a 4 itens curtos ("Miradouro de Casal de São Simão").
- `warnings`: 0 a 3 itens curtos e verificáveis ("Estrada estreita e sem guardas na descida para o Piódão"). Deixe vazio se não houver nada confirmado.
- `best_season`: uma frase curta ("Primavera e outono; evite agosto pelo trânsito").
- `sources`: só as páginas que você realmente leu e usou: `{ title, url, site, lang }`.
- `i18n`: `en`, `es`, `fr` e `de` com os mesmos campos e o mesmo número de itens. Os nomes de lugares ficam no original.
- `researched_at`: a data de hoje (`YYYY-MM-DD`).

Não invente fatos, como altitudes, datas de obras ou fechamentos. Se não achou, não escreva.

Grave em `jobs/data/curator_reviews_<cc>.ts`. O tipo `CuratorReviewEntry` fica em `jobs/lib/curator_review.ts`. Um país novo também precisa ser registrado em `DATASETS` dentro de `jobs/import_curator_reviews.ts`.

## 5. Validar e importar

```bash
npx tsx jobs/import_curator_reviews.ts --dataset=<cc> --dry
```

Corrija tudo o que aparecer com `✗`: escala, geral longe da média, traduções faltando, fontes insuficientes para a confiança, slug inexistente. Depois importe (a avaliação vai direto ao ar):

```bash
npx tsx jobs/import_curator_reviews.ts --dataset=<cc> [--only=<slug>] [--overwrite]
```

## 6. Verificar e relatar

- SQL: `select r.slug, r.curator_rating, c.confidence, jsonb_array_length(c.sources) from routes r join route_curator_reviews c on c.route_id = r.id where r.country = '<CC>';` A coluna `curator_rating` tem que ser igual a `overall`.
- `npx tsc --noEmit -p jobs`.
- Relatório: uma tabela com rota, notas, confiança e nº de fontes. Destaque as rotas com confiança baixa e os achados importantes (fechamentos, obras, rota supervalorizada), para revisão no Admin. No Admin, o filtro "Confiança baixa" lista essas rotas, e a edição da rota tem a seção "Avaliação MotoTrip" para corrigir notas, textos e fontes.
