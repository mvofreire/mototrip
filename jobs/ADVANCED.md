# Advanced Usage - Routes Generator

## 🎯 Casos de Uso Avançados

### 1. Gerar Rotas Incrementais

Adicionar N novas rotas sem apagar as existentes:

```typescript
// No routes_generator.ts, modifique:
const TARGET_ROUTES_COUNT = 50; // Apenas 50 novas rotas
```

Execute normalmente:
```bash
npm run generate:routes
```

### 2. Gerar Rotas para Região Específica

Crie um script personalizado `jobs/generate_region.ts`:

```typescript
import { /* imports do routes_generator */ } from './routes_generator';

const CUSTOM_REGION = {
  name: 'Serra da Estrela',
  bbox: [40.2, -7.8, 40.5, -7.4]
};

// Gerar apenas para esta região
// ... adapte a lógica do main()
```

### 3. Integrar Dados de Elevação Reais

#### Opção A: Open-Elevation API (Grátis)

```typescript
async function fetchElevation(lat: number, lon: number): Promise<number> {
  const response = await axios.get(
    `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`
  );
  return response.data.results[0].elevation;
}

// Em calculateElevationGain():
for (const point of points) {
  point.elevation = await fetchElevation(point.lat, point.lon);
  await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
}
```

#### Opção B: Mapbox Tilequery API

```typescript
async function fetchElevationBatch(points: RoutePoint[]): Promise<void> {
  const coordinates = points.map(p => `${p.lon},${p.lat}`).join(';');
  
  const response = await axios.get(
    `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${coordinates}.json`,
    {
      params: {
        access_token: process.env.MAPBOX_ACCESS_TOKEN,
        layers: 'contour',
      }
    }
  );
  
  // Processar resposta...
}
```

### 4. Adicionar Fotos Automaticamente

Integre com Mapillary API para fotos reais:

```typescript
async function fetchRoutePhotos(route: GeneratedRoute): Promise<string[]> {
  const photos: string[] = [];
  
  // Sample de alguns pontos
  const samplePoints = route.points.filter((_, i) => i % 20 === 0);
  
  for (const point of samplePoints) {
    try {
      const response = await axios.get(
        'https://graph.mapillary.com/images',
        {
          params: {
            access_token: process.env.MAPILLARY_TOKEN,
            bbox: `${point.lon-0.01},${point.lat-0.01},${point.lon+0.01},${point.lat+0.01}`,
            limit: 1
          }
        }
      );
      
      if (response.data.data.length > 0) {
        const imageId = response.data.data[0].id;
        photos.push(`https://graph.mapillary.com/${imageId}?access_token=${token}`);
      }
    } catch (error) {
      console.warn('Failed to fetch photo:', error);
    }
  }
  
  return photos;
}

// Salvar fotos
async function saveRoutePhotos(routeId: string, photoUrls: string[]) {
  const photos = photoUrls.map((url, index) => ({
    route_id: routeId,
    user_id: SYSTEM_USER_ID,
    url,
    order_index: index,
  }));
  
  await supabase.from('route_photos').insert(photos);
}
```

### 5. Validação de Qualidade de Estradas

Integre dados de qualidade do OpenStreetMap:

```typescript
function calculateRoadQuality(osmTags: Record<string, string>): number {
  let score = 7; // Base score
  
  // Surface quality
  if (osmTags.surface === 'asphalt') score += 1.5;
  else if (osmTags.surface === 'paved') score += 1;
  else if (osmTags.surface === 'gravel') score -= 1;
  else if (osmTags.surface === 'unpaved') score -= 2;
  
  // Smoothness
  if (osmTags.smoothness === 'excellent') score += 1;
  else if (osmTags.smoothness === 'good') score += 0.5;
  else if (osmTags.smoothness === 'bad') score -= 1;
  
  // Width
  if (osmTags.lanes && parseInt(osmTags.lanes) >= 2) score += 0.5;
  
  return Math.max(0, Math.min(10, score));
}
```

### 6. Filtrar por Condições Climáticas

Evite rotas que fecham no inverno:

```typescript
function isAccessibleYearRound(osmTags: Record<string, string>): boolean {
  // Rotas de alta montanha podem fechar no inverno
  if (osmTags['winter:access'] === 'no') return false;
  if (osmTags['access:conditional']?.includes('winter')) return false;
  
  return true;
}

// No generateSingleLoop():
for (const way of ways) {
  if (!isAccessibleYearRound(way.tags)) continue;
  // ...
}
```

### 7. Priorizar Rotas Cênicas

Use tags OSM para identificar rotas cênicas:

```typescript
function calculateScenicBonus(osmTags: Record<string, string>): number {
  let bonus = 0;
  
  if (osmTags.scenic === 'yes') bonus += 2;
  if (osmTags.tourism === 'yes') bonus += 1;
  if (osmTags['tourist:route'] === 'yes') bonus += 1.5;
  
  // Rotas nomeadas tendem a ser mais cênicas
  if (osmTags.name) bonus += 0.5;
  
  return bonus;
}
```

### 8. Gerar Rotas Ponto-a-Ponto

Além de loops, gerar rotas lineares:

```typescript
async function generatePointToPointRoute(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  graph: Map<number, number[]>,
  nodeMap: Map<number, OSMNode>
): Promise<GeneratedRoute | null> {
  // Implementar A* ou Dijkstra
  // Priorizar estradas curvas e cênicas
  // ...
}
```

### 9. Clustering de Rotas Similares

Evite rotas muito próximas:

```typescript
function areRoutesTooSimilar(route1: GeneratedRoute, route2: GeneratedRoute): boolean {
  // Calcular overlapping de coordenadas
  const line1 = turf.lineString(route1.points.map(p => [p.lon, p.lat]));
  const line2 = turf.lineString(route2.points.map(p => [p.lon, p.lat]));
  
  // Buffer de 2km
  const buffer1 = turf.buffer(line1, 2, { units: 'kilometers' });
  const buffer2 = turf.buffer(line2, 2, { units: 'kilometers' });
  
  const intersection = turf.intersect(buffer1, buffer2);
  
  if (!intersection) return false;
  
  const area1 = turf.area(buffer1);
  const areaIntersection = turf.area(intersection);
  
  // Se >50% overlap, são muito similares
  return (areaIntersection / area1) > 0.5;
}

// No generateLoopRoutes():
const uniqueRoutes: GeneratedRoute[] = [];
for (const route of potentialRoutes) {
  const isSimilar = uniqueRoutes.some(existing => 
    areRoutesTooSimilar(route, existing)
  );
  
  if (!isSimilar) {
    uniqueRoutes.push(route);
  }
}
```

### 10. Export para GPX

Exporte rotas para navegação GPS:

```typescript
function routeToGPX(route: GeneratedRoute): string {
  const points = route.points.map(p => 
    `    <trkpt lat="${p.lat}" lon="${p.lon}">
      <ele>${p.elevation || 0}</ele>
    </trkpt>`
  ).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Mototrip">
  <metadata>
    <name>${route.title}</name>
    <desc>${route.description}</desc>
  </metadata>
  <trk>
    <name>${route.title}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
}

// Salvar arquivo
import { writeFileSync } from 'fs';

async function exportRoutesToGPX(routes: GeneratedRoute[]) {
  for (const route of routes) {
    const gpx = routeToGPX(route);
    const filename = `exports/${route.region}_${route.id}.gpx`;
    writeFileSync(filename, gpx);
  }
}
```

### 11. Rate Limiting Inteligente

Otimize chamadas à Overpass API:

```typescript
class OverpassClient {
  private lastRequest = 0;
  private minDelay = 2000; // 2 seconds
  private requestCount = 0;
  private hourlyLimit = 100;
  
  async query(query: string): Promise<OSMData> {
    // Check hourly limit
    if (this.requestCount >= this.hourlyLimit) {
      const waitTime = 3600000; // 1 hour
      console.log(`Rate limit reached. Waiting ${waitTime/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
    }
    
    // Ensure minimum delay between requests
    const now = Date.now();
    const elapsed = now - this.lastRequest;
    if (elapsed < this.minDelay) {
      await new Promise(resolve => setTimeout(resolve, this.minDelay - elapsed));
    }
    
    this.lastRequest = Date.now();
    this.requestCount++;
    
    // Make request with retry
    let attempts = 0;
    while (attempts < 3) {
      try {
        return await axios.post(OVERPASS_API_URL, query);
      } catch (error) {
        attempts++;
        if (attempts >= 3) throw error;
        
        // Exponential backoff
        const delay = Math.pow(2, attempts) * 1000;
        console.log(`Request failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Max retries exceeded');
  }
}
```

### 12. Análise de Tráfego

Evite rotas com muito tráfego (requer API externa):

```typescript
async function calculateTrafficScore(route: GeneratedRoute): Promise<number> {
  // Usar Google Maps Traffic API ou TomTom
  // Retorna score 0-10 (10 = sem tráfego)
  
  // Exemplo simplificado:
  const avgTraffic = await checkTrafficAlongRoute(route.points);
  return 10 - (avgTraffic / 10); // Normalizar
}
```

## 🔄 Pipeline Completo de Produção

```typescript
async function productionPipeline() {
  // 1. Buscar dados
  const osmData = await fetchRoadNetworkWithRetry(region);
  
  // 2. Gerar rotas candidatas
  const candidates = generateLoopRoutes(osmData, region, 200);
  
  // 3. Enriquecer com elevação real
  for (const route of candidates) {
    await addRealElevationData(route);
  }
  
  // 4. Calcular qualidade de estrada real
  for (const route of candidates) {
    route.roadQuality = calculateRoadQualityFromOSM(route);
  }
  
  // 5. Adicionar dados de tráfego
  for (const route of candidates) {
    route.trafficScore = await calculateTrafficScore(route);
  }
  
  // 6. Filtrar duplicatas
  const uniqueRoutes = removeSimilarRoutes(candidates);
  
  // 7. Buscar fotos
  for (const route of uniqueRoutes) {
    route.photos = await fetchRoutePhotos(route);
  }
  
  // 8. Scoring final
  for (const route of uniqueRoutes) {
    route.finalScore = calculateFinalScore(route);
  }
  
  // 9. Selecionar top N
  const topRoutes = uniqueRoutes
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, 100);
  
  // 10. Salvar no banco
  for (const route of topRoutes) {
    await saveRouteToDatabase(route);
    await saveRoutePhotos(route.id, route.photos);
    await exportRouteToGPX(route);
  }
}
```

## 📊 Monitoramento e Logging

```typescript
import { createWriteStream } from 'fs';

const logStream = createWriteStream('logs/generator.log', { flags: 'a' });

const logger = {
  info: (msg: string) => {
    const line = `[INFO] ${new Date().toISOString()} - ${msg}\n`;
    console.log(line.trim());
    logStream.write(line);
  },
  // ... outros níveis
};

// Métricas
const metrics = {
  startTime: Date.now(),
  routesGenerated: 0,
  routesSaved: 0,
  apiCalls: 0,
  errors: 0,
};

// No final
function printMetrics() {
  const duration = (Date.now() - metrics.startTime) / 1000;
  console.log(`
Execution Metrics:
  Duration: ${duration}s
  Routes Generated: ${metrics.routesGenerated}
  Routes Saved: ${metrics.routesSaved}
  API Calls: ${metrics.apiCalls}
  Errors: ${metrics.errors}
  Success Rate: ${(metrics.routesSaved/metrics.routesGenerated*100).toFixed(2)}%
  Avg Time per Route: ${(duration/metrics.routesGenerated).toFixed(2)}s
  `);
}
```

---

**Pro Tip:** Comece simples e adicione complexidade gradualmente. Teste cada feature isoladamente antes de integrar no pipeline principal.
