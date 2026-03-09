# 🗺️ Implementação Google Maps - Mototrip

## ✅ O que foi implementado

### 1. **RouteMap** - Mapa de Detalhes da Rota
📍 Arquivo: [`components/features/routes/route-map.tsx`](../components/features/routes/route-map.tsx)

**Funcionalidades:**
- ✅ Renderiza polyline da rota completa
- ✅ Markers numerados para cada stop
- ✅ Centralização automática baseada nas coordenadas
- ✅ Controles de zoom e fullscreen
- ✅ Fallback caso API key não esteja configurada

**Uso:**
```tsx
<RouteMap route={route} />
```

---

### 2. **RoutesOverviewMap** - Mapa de Visão Geral
📍 Arquivo: [`components/features/routes/routes-overview-map.tsx`](../components/features/routes/routes-overview-map.tsx)

**Funcionalidades:**
- ✅ Mostra markers do ponto inicial de todas as rotas
- ✅ Painel informativo ao clicar em uma rota
- ✅ Link direto para página de detalhes
- ✅ Badges com distância, dificuldade e categoria
- ✅ Cálculo automático do centro do mapa

**Uso:**
```tsx
<RoutesOverviewMap routes={filteredRoutes} locale={locale} />
```

---

### 3. **FeaturedRoutesMap** - Mapa de Rotas em Destaque
📍 Arquivo: [`components/features/routes/featured-routes-map.tsx`](../components/features/routes/featured-routes-map.tsx)

**Funcionalidades:**
- ✅ Mapa minimalista para homepage
- ✅ Mostra apenas rotas destacadas
- ✅ UI simplificada (sem controles extras)

**Uso:**
```tsx
<FeaturedRoutesMap routes={featuredRoutes} />
```

---

## 🎨 Integração nas Páginas

### Página de Detalhes da Rota
📄 [`app/[locale]/routes/[id]/page.tsx`](../app/[locale]/routes/[id]/page.tsx)

```tsx
<RouteMap route={route} />
```

Renderiza o mapa completo com polyline e stops.

---

### Página Explorar
📄 [`app/[locale]/explore/page.tsx`](../app/[locale]/explore/page.tsx)

**Novo modo de visualização:** `map`

```tsx
// Toggle de visualização: Grid | List | Map
<Button onClick={() => setViewMode('map')}>
  <MapIcon />
</Button>

// Renderização condicional
{viewMode === 'map' && (
  <RoutesOverviewMap routes={filteredRoutes} locale={locale} />
)}
```

Agora a página Explorar tem 3 modos:
- 🔲 **Grid** - Cards em grade
- 📋 **List** - Cards em lista
- 🗺️ **Map** - Mapa interativo + cards

---

## 🔑 Configuração

### Variável de Ambiente

No arquivo [`.env.local`](../.env.local):

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxx...
```

### APIs do Google Cloud Necessárias

✅ Ative estas APIs no [Console](https://console.cloud.google.com/apis):

1. **Maps JavaScript API**
2. **Directions API** (futuro)
3. **Geocoding API** (futuro)
4. **Places API** (futuro)
5. **Elevation API** (opcional)

### Restrições Recomendadas

**HTTP Referrers:**
```
localhost:3000/*
*.vercel.app/*
seudominio.com/*
```

**API Restrictions:**
```
☑ Maps JavaScript API
☑ Directions API
☑ Geocoding API
```

---

## 🎯 Como Testar

### 1. Testar Rota Individual

```bash
# Abra o navegador em:
http://localhost:3000/pt/routes/1

# Verifique:
✓ Mapa renderiza com polyline laranja
✓ Markers numerados aparecem nos stops
✓ Zoom e controles funcionam
```

### 2. Testar Página Explorar

```bash
# Abra:
http://localhost:3000/pt/explore

# Verifique:
✓ Botão de mapa (ícone 🗺️) aparece
✓ Clique no botão de mapa
✓ Mapa renderiza com markers de todas as rotas
✓ Clique em um marker
✓ Painel de info aparece com link para rota
```

### 3. Verificar Fallback

Remova temporariamente a API key do `.env.local`:

```bash
# Comentar no .env.local:
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# Reinicie o servidor:
npm run dev

# Verifique:
✓ Mensagem de erro aparece no lugar do mapa
✓ Aplicação não quebra
```

---

## 🎨 Estilos e Cores

### Polyline da Rota
```tsx
strokeColor="#EA580C"  // orange-600
strokeWeight={4}
strokeOpacity={0.8}
```

### Markers
- **Stops da Rota:** Numerados (1, 2, 3...)
- **Rotas na Exploração:** Pin padrão do Google Maps

---

## 🚀 Melhorias Futuras

### 1. Directions API
Calcular rota real entre pontos usando estradas:

```tsx
import { useDirectionsService } from '@vis.gl/react-google-maps'

// Calcular rota entre stops
const directions = useDirectionsService({
  origin: stops[0],
  destination: stops[stops.length - 1],
  waypoints: stops.slice(1, -1),
})
```

### 2. Clustering de Markers
Para muitas rotas, agrupar markers próximos:

```bash
npm install @googlemaps/markerclusterer
```

### 3. Custom Map Styles
Criar estilo personalizado no [Cloud Console](https://console.cloud.google.com/google/maps-apis/studio/maps):

```tsx
<Map mapId="SEU_MAP_ID_CUSTOMIZADO" />
```

### 4. Info Windows Personalizadas
Popup com preview da rota ao clicar:

```tsx
<InfoWindow position={marker.position}>
  <div className="p-2">
    <h3>{route.title}</h3>
    <img src={route.thumbnail} />
  </div>
</InfoWindow>
```

### 5. Street View Integration
Mostrar preview de pontos da rota:

```tsx
<StreetViewPanorama
  position={stop.position}
  pov={{ heading: 34, pitch: 10 }}
/>
```

### 6. Traffic Layer
Mostrar tráfego em tempo real:

```tsx
<Map>
  <TrafficLayer />
</Map>
```

### 7. Elevation Profile
Gráfico de elevação ao longo da rota:

```tsx
import { Chart } from 'chart.js'

// Usar Elevation API para obter dados
const elevations = await getElevations(route.points)
```

---

## 📊 Custos Estimados

### Google Maps Pricing (2026)

**Tier Gratuito:** $200/mês

**Custos por 1.000 chamadas:**
- Maps JavaScript API: $7
- Directions API: $5
- Geocoding API: $5
- Places API: $17

**Estimativa para o Mototrip:**
- 10K visualizações de rotas/mês
- ~$70/mês (dentro do tier gratuito ✅)

### Monitoramento

[Quotas Dashboard](https://console.cloud.google.com/apis/dashboard)

Configure alertas em:
- 50% do limite ($100)
- 80% do limite ($160)

---

## 🐛 Troubleshooting

### Mapa não aparece

**1. Verificar API key:**
```bash
# No terminal do Next.js, deve aparecer:
✓ Ready in 1339ms

# Se aparecer warning:
⚠️  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set
```

**2. Verificar console do navegador:**
```
F12 → Console
```

Erros comuns:
```
InvalidKeyMapError → API key inválida
RefererNotAllowedMapError → Domínio não autorizado
ApiNotActivatedMapError → API não ativada
```

**3. Verificar rede:**
```bash
# No console do navegador:
Network → Filtrar por "maps"
# Deve carregar: maps.googleapis.com
```

### Mapa cinza

- ✅ API key válida mas APIs não ativadas
- ✅ Billing não configurado no Google Cloud

### Polyline não aparece

```tsx
// Verificar formato das coordenadas:
console.log(route.polyline_coordinates)

// Deve ser:
{
  type: "LineString",
  coordinates: [[lng, lat], [lng, lat], ...]
}
```

### Markers fora do lugar

```tsx
// Google Maps usa { lat, lng }
// GeoJSON usa [lng, lat]

// ❌ Errado:
position: { lat: coordinates[0], lng: coordinates[1] }

// ✅ Correto:
position: { lat: coordinates[1], lng: coordinates[0] }
```

---

## 📚 Recursos

### Documentação
- [Google Maps JS API](https://developers.google.com/maps/documentation/javascript)
- [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

### Exemplos
- [vis.gl Examples](https://visgl.github.io/react-google-maps/examples)
- [Google Maps Samples](https://github.com/googlemaps/js-samples)

---

## ✅ Checklist de Implementação

- [x] Instalar dependências (@vis.gl/react-google-maps)
- [x] Configurar API key no .env.local
- [x] Criar componente RouteMap
- [x] Criar componente RoutesOverviewMap
- [x] Criar componente FeaturedRoutesMap
- [x] Integrar na página de detalhes
- [x] Integrar na página explorar (modo mapa)
- [x] Adicionar fallback para API key ausente
- [x] Testar renderização de polylines
- [x] Testar markers de stops
- [x] Testar navegação entre rotas
- [ ] Adicionar clustering (opcional)
- [ ] Integrar Directions API (futuro)
- [ ] Adicionar custom map styles (futuro)

---

**Status:** ✅ Implementação completa e funcional!

Os mapas estão renderizando corretamente em:
- 📍 `/[locale]/routes/[id]` - Detalhes da rota
- 🗺️ `/[locale]/explore` - Visão geral (modo mapa)

**Próximos passos:** Testar com rotas reais do gerador quando estiverem prontas.
