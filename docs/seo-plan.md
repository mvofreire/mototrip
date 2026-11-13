# Plano de SEO — MotoTrip

**Objetivo:** marca + cadastros. **Mercados:** Portugal (pt-PT), inglês internacional, ES/FR/DE.
**Dados:** começar pelo código; cruzar com exportações do Search Console depois (fase 4).

## Fase 1 — Correções técnicas críticas ✅ feito (helper em `lib/seo.ts`)

> Correção do diagnóstico: posts sem tradução não davam 404, mostravam outra língua (conteúdo duplicado). Agora o canonical aponta para a língua original e o sitemap só lista traduções reais.

1. **Canonical errado herdado do layout.** `app/[locale]/layout.tsx` define `canonical: /${locale}` e hreflang da home. Quem não sobrescreve (about, contact, guidelines, privacy, terms, riders, community, submit, explore) diz ao Google que é cópia da home e pode sair do índice.
   → Remover canonical/languages do layout e criar um helper `buildAlternates(locale, path)` usado por toda página.
2. **Faltando `x-default`** no hreflang (metadata e sitemap) → apontar para `/en`.
3. **og:locale do pt é `pt_BR`** e não há hreflang regional → usar `pt_PT` (e avaliar `hreflang="pt-PT"`).
4. **Sitemap lista URLs que dão 404/noindex:** `/community` (desativada) e posts do blog em idiomas sem tradução (`notFound()` quando falta conteúdo). → Filtrar por traduções existentes e tirar community.
5. **Páginas privadas/inexistentes retornam 200** (`PrivateRouteDetail` com noindex) — soft 404. Aceitável, mas garantir `noindex` e nunca listá-las no sitemap.
6. **Páginas que não devem ser indexadas:** auth, profile, submit, edit → `robots: { index: false }` na metadata (o robots.txt bloqueia o rastreio, mas não impede indexar URL vista em link).
7. Unificar `getBaseUrl()` do layout com `lib/site-url.ts` (padrões diferentes: localhost vs mototrip.pt).

## Fase 2 — On-page e dados estruturados (itens 1–3 ✅ feito; 4 aguarda dados do GSC)

> Nota: o Google aposentou a caixa de busca de sitelinks (`SearchAction`) em 2024 — ficou só `WebSite`, que define o nome do site nos resultados. Imagem OG dinâmica feita para rotas; regiões e posts continuam com a foto de capa.

1. **`/explore` é client-side** (`'use client'`): o Google vê pouco conteúdo. Renderizar no servidor a lista inicial de rotas com links (o filtro continua no cliente).
2. **Open Graph próprio por página** + imagens OG dinâmicas (`opengraph-image.tsx`) para rotas, regiões e posts — melhora compartilhamento, que é o canal de marca.
3. **Schema.org:** `WebSite` + `SearchAction` (sitelinks searchbox, ajuda busca por marca), `BreadcrumbList` em rota/região/post, `Organization` já existe (revisar `sameAs`).
4. Remover `keywords` (ignorado pelo Google) e revisar títulos/descrições por idioma, incluindo "MotoTrip" de forma consistente.
5. Breadcrumbs visíveis e links internos: rota → região → rotas próximas; post → rotas citadas.

## Fase 3 — Conteúdo e páginas novas (foco marca + cadastros)

1. **Landing pages indexáveis** por categoria e país (ex.: "rotas de moto em Portugal", "estradas de montanha", "rotas de 1 dia") gerados a partir do banco.
2. **Blog com calendário** usando a skill `create-post`: guias por região de Portugal primeiro, depois Espanha/Europa para os outros idiomas.
3. **Páginas de conversão:** página "Envie sua rota / Crie sua conta" com proposta de valor clara, CTAs nas páginas de rota e post.
4. Perfis públicos de riders (`/riders`) como conteúdo gerado pelo usuário — avaliar indexação só para perfis com rotas publicadas.

## Fase 4 — Medição

1. Confirmar propriedade de domínio no GSC + Bing Webmaster; enviar sitemap.
2. Com exportações do GSC: consultas de marca vs. não-marca, páginas com impressões e CTR baixo, cobertura de índice após a Fase 1.
3. Eventos de cadastro no Vercel Analytics ligados à página de origem.
4. Core Web Vitals (Speed Insights já instalado): checar LCP das páginas com mapa.

## Ordem sugerida

Fase 1 inteira num PR (rápido e de maior impacto) → Fase 2 itens 1–3 → Fase 3 → Fase 4 contínua.
