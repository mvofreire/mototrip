# 🗺️ Mapas - Mototrip

Todos os mapas usam **OpenStreetMap** com **Leaflet** (`react-leaflet`). Não há chave de API nem billing.

## Componentes

| Onde | Componente |
|------|------------|
| Página da rota (mapa interativo com início, fim e paradas) | `components/features/routes/route-map.tsx` |
| Explorar → aba Mapa (pins de início de cada rota) | `components/features/routes/routes-overview-map.tsx` |
| Enviar rota → preview do GPX | `components/features/routes/gpx-upload.tsx` |
| Capa da página da rota (sem foto) | `components/features/routes/route-cover.tsx` → `route-cover-map.tsx` |
| Thumbnail dos cards de rota | `components/features/routes/route-thumbnail.tsx` → `route-cover-map.tsx` (`variant="thumbnail"`) |

O mapa interativo base está em `components/features/maps/map.tsx` (carregado só no cliente) e `osm-map.tsx`.

A capa e os thumbnails partilham o mesmo estilo: tiles em tons de cinza (invertidos no dark mode, via `.route-cover-map` em `app/globals.css`) e a rota em vermelho com brilho. Os thumbnails só montam o mapa quando o card se aproxima do viewport.

## Imagem estática (`routes.thumbnail_url`)

Cada rota guarda um PNG do mapa no bucket `route_map` (`thumbnail-<id>.png`), usado como imagem de partilha (Open Graph).

- No envio de uma rota: `lib/map-thumbnail.ts` (canvas no browser).
- Nos jobs: `jobs/lib/route_thumbnail.ts` (sharp, em Node).
- Regenerar todas: `npx tsx jobs/regenerate_thumbnails.ts` (`--dry --out=<pasta>` para testar).

## Botão "Abrir no Google Maps"

Continua a abrir a rota (início, fim e alguns pontos intermédios) no Google Maps / app do Google Maps para navegação. É só um link — não usa a API do Google nem chave.

## Política de uso dos tiles

Os tiles vêm de `tile.openstreetmap.org` ([política de uso](https://operations.osmfoundation.org/policies/tiles/)). A atribuição "© OpenStreetMap contributors" deve ficar visível. Se o tráfego crescer, trocar o URL dos tiles por um provedor (ex.: MapTiler, Stadia) em `osm-map.tsx`, `route-cover-map.tsx` e nos renderizadores de thumbnail.
