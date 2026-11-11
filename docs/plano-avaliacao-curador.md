# Plano: Avaliação MotoTrip (curadoria)

Cada rota passa a ter duas avaliações:

- **Comunidade**: continua como está (`route_ratings`, 1–5, "Eu fiz esta rota").
- **MotoTrip**: uma por rota, assinada pelo perfil **Mototrip** (`4bd60894-3c72-484d-a2e9-2b5e22658853`, role `curator`). As notas iniciais vêm de pesquisa na internet.

## Decisões tomadas

| Tema | Decisão |
|---|---|
| Notas editoriais 0–10 (`scenic_score`, `road_quality_score`, `fun_factor_score`) | São substituídas pela avaliação MotoTrip. O card "editorial" sai da página, e o filtro e a ordenação passam a usar a nota do curador. |
| Escala | 1–5 com meio ponto: geral, paisagem, estrada e diversão (os mesmos critérios da comunidade). |
| Publicação | Vai direto ao ar. Correções são feitas depois, no Admin. |
| Fontes | São públicas na página da rota ("Baseado em N fontes"). |

## Estado atual (levantado)

- 54 rotas (PT 21, ES 11, FR 22), todas com `user_id` = conta pessoal admin (`SYSTEM_USER_ID` em `jobs/import_curated_routes.ts`), **não** o perfil Mototrip.
- As notas editoriais foram geradas na criação (`/create-routes` pede "scores de 0 a 10 realistas"), sem pesquisa.
- Há só 2 avaliações da comunidade.

## 1. Banco (migration `021_curator_reviews.sql`)

A avaliação fica numa **tabela própria**, não em `route_ratings`, para não entrar na média da comunidade nem no trigger `update_route_scores`.

```
route_curator_reviews
  route_id      uuid PK → routes(id) on delete cascade
  curator_id    uuid → profiles(id)                 -- Mototrip
  overall, scenic, road, fun  numeric(2,1)          -- 1–5, passo 0.5 (check: x*2 = trunc(x*2))
  verdict       text                                -- 2–4 frases, pt-PT
  highlights    text[]                              -- pontos fortes
  warnings      text[]                              -- avisos (estrada fechada no inverno, gravilha…)
  best_season   text
  translations  jsonb                               -- en/es/fr/de: verdict, highlights, warnings, best_season
  sources       jsonb                               -- [{title, url, site, lang}]
  confidence    text check in ('high','medium','low')  -- pela quantidade/qualidade das fontes
  researched_at timestamptz
  created_at / updated_at
```

- **Desnormalização em `routes`**: `curator_rating`, `curator_scenic`, `curator_road` e `curator_fun`, mantidas por um trigger com o mesmo padrão de flag do `mototrip.rating_aggregate`. Servem para cards, ordenação e filtro sem join. Entram em `review_cols` no `routes_review_guard` e são protegidas contra contribuidores, como as colunas `rating_*`.
- **RLS**: leitura para todos quando a rota é visível; escrita só para staff (`is_staff()`) e service role.
- `scenic_score` e as outras ficam no banco por enquanto (o formulário de envio ainda grava 0). Removo numa migration posterior, depois que nada mais as ler.
- Atualizar `types/database.types.ts` e `types/index.ts`.

## 2. Pesquisa e importação

**Skill nova `/rate-routes [país | trecho do título]`** em `.claude/skills/rate-routes/SKILL.md`:

1. Lista as rotas sem avaliação (ou as pedidas).
2. Para cada rota, faz buscas no idioma local e em inglês: nome da estrada e dos colos, "mota/moto/motorcycle", e sites de rotas de moto, revistas, fóruns e Reddit. Lê as páginas mais relevantes.
3. Dá as notas com uma **rubrica fixa** escrita na skill. Exemplo para estrada: 5 = asfalto ótimo e bem conservado, 3 = irregular ou com trechos degradados, 1 = muito danificado ou de terra.
4. Regras: nada de inventar fatos. Com menos de 2 fontes independentes, `confidence = 'low'` e notas conservadoras. Toda afirmação do veredito tem que estar apoiada numa fonte.
5. Escreve `jobs/data/curator_reviews_<cc>.ts`, com o texto em pt-PT e as traduções.

**Script `jobs/import_curator_reviews.ts`**: faz upsert por `route_id` (casando pelo slug) com a service role, `curator_id` = Mototrip. Aceita `--dataset=<cc>`, `--only=` e `--dry`, e valida escala, URLs e traduções.

**Primeira rodada**: as 54 rotas, com um subagente por país (PT, ES, FR) em paralelo, depois dry run, importação e uma conferência por amostragem.

**`/create-routes`**: deixa de pedir scores inventados e, no fim, chama `/rate-routes` para as rotas novas.

## 3. Interface

- **Página da rota**: o novo `components/features/routes/route-curator-review.tsx` substitui o card editorial em `route-stats.tsx`. Ele mostra:
  - o selo/avatar MotoTrip e o título "Avaliação MotoTrip";
  - a nota geral em destaque e as barras de paisagem, estrada e diversão;
  - o veredito, os destaques, os avisos e a melhor época;
  - "Baseado em N fontes" (lista de links que abre e fecha) e "Pesquisado em <data>".

  `route-reviews.tsx` (comunidade) não muda, só ganha o título "Avaliação da comunidade" para separar as duas.
- **Card da rota** (`route-card.tsx`): selo compacto com a nota MotoTrip, mais as estrelas e a contagem da comunidade, que já existem.
- **Explorar**: o filtro `min_scenic_score` (0–10) vira um filtro da nota MotoTrip (1–5), com o slider ajustado. A ordenação por "Melhor avaliadas MotoTrip" passa a usar `routes.service.ts:56` e `:228` (hoje é `order scenic_score`).
- **SEO** (`lib/route-structured-data.ts`): `aggregateRating` continua sendo só da comunidade. A avaliação MotoTrip entra como `review` com `author` Organization MotoTrip.
- **i18n**: chaves novas em `locales/*` (5 idiomas).
- **Perfil Mototrip**: pôr o avatar da marca (`brand/`) para o selo aparecer certo.

## 4. Admin

Como as avaliações vão direto ao ar, o Admin precisa de uma forma de corrigir:

- Na edição da rota, uma seção "Avaliação MotoTrip" com notas, veredito, fontes e o botão "remover".
- Na lista de rotas, uma coluna com a nota e a confiança, e um filtro "sem avaliação" / "confiança baixa" para priorizar a revisão.

## 5. Ordem de entrega

1. Migration, tipos e trigger de desnormalização (sem efeito visível).
2. Skill `/rate-routes` e o script de importação, testados com 2 ou 3 rotas.
3. UI pública (página, card, explorar, SEO, i18n), verificada no dev server com essas rotas.
4. Rodada completa das 54 rotas.
5. Edição no Admin.
6. Limpeza: atualizar `/create-routes`, tirar as leituras de `scenic_score` e, depois, a migration que remove as colunas.

## Verificação

- SQL: 54 linhas em `route_curator_reviews`; `routes.curator_rating` igual ao valor da tabela; um contribuidor não consegue alterar `curator_*`.
- `npx tsc --noEmit -p .` e `npx tsc --noEmit -p jobs`.
- Dev server: página de rota em pt e en, card no explorar, filtro e ordenação, e uma rota sem avaliação (o card não deve aparecer).

## Em aberto

- **Autoria das rotas**: as 54 rotas estão na sua conta pessoal. Quer passá-las para o perfil Mototrip (e trocar o `SYSTEM_USER_ID` do import)? Isso não é necessário para a avaliação.
