# Upload de GPX com Previsualização

## Visão Geral

Implementação completa do upload de arquivos GPX com previsualização em mapa para submissão de rotas no MotoTrip.

## Arquivos Criados/Modificados

### Novos Arquivos

1. **`lib/gpx-parser.ts`** - Utilitário para processar arquivos GPX
   - Parser de arquivos GPX (tracks e rotas)
   - Extração de coordenadas e dados de elevação
   - Cálculo de distância total usando fórmula de Haversine
   - Cálculo de ganho/perda de elevação
   - Simplificação de rotas usando algoritmo Douglas-Peucker
   - Conversão para formato GeoJSON

2. **`components/features/routes/gpx-upload.tsx`** - Componente de upload
   - Interface de drag-and-drop para arquivos GPX
   - Validação de arquivo (formato e tamanho)
   - Previsualização interativa no mapa usando Google Maps
   - Exibição de estatísticas da rota (distância, elevação, etc.)
   - Design responsivo e feedback visual

### Arquivos Modificados

3. **`components/features/routes/submit-route-form.tsx`**
   - Integração do componente GPXUpload
   - Auto-preenchimento de campos com dados do GPX
   - Validação de GPX obrigatória antes do submit
   - Conversão de dados GPX para formato do banco

4. **Arquivos de Tradução** (`locales/*.json`)
   - Atualizadas strings em PT, EN e ES
   - Mensagens de erro e ajuda contextualizadas

## Funcionalidades Implementadas

### 1. Parser de GPX
- ✅ Suporte a tracks (`<trkpt>`) e rotas (`<rtept>`)
- ✅ Extração de latitude, longitude e elevação
- ✅ Parsing de timestamps (quando disponível)
- ✅ Cálculo de bounds geográficos
- ✅ Cálculo preciso de distância total
- ✅ Análise de ganho e perda de elevação
- ✅ Conversão para GeoJSON LineString

### 2. Interface de Upload
- ✅ Drag-and-drop de arquivos
- ✅ Validação de formato (.gpx)
- ✅ Limite de tamanho (10MB)
- ✅ Feedback visual durante processamento
- ✅ Mensagens de erro amigáveis

### 3. Previsualização no Mapa
- ✅ Renderização da rota no Google Maps
- ✅ Ajuste automático de zoom para mostrar rota completa
- ✅ Polyline estilizada (vermelho, semi-transparente)
- ✅ Controles de mapa interativos

### 4. Estatísticas da Rota
- ✅ Distância total (km)
- ✅ Ganho de elevação (m)
- ✅ Altitude máxima (quando disponível)
- ✅ Informações do arquivo (nome, tamanho)

### 5. Integração com Formulário
- ✅ Auto-preenchimento de distância
- ✅ Auto-preenchimento de elevação
- ✅ Validação obrigatória de GPX
- ✅ Conversão automática para formato do banco

## Como Usar

### Para Usuários

1. Acesse a página de submissão de rota: `/[locale]/submit`
2. Preencha as informações básicas (título, descrição, etc.)
3. Na seção "Arquivo GPX", clique ou arraste um arquivo `.gpx`
4. Visualize a rota no mapa e confirme as estatísticas
5. Se necessário, clique no "X" para remover e fazer upload de outro arquivo
6. Os campos de distância e elevação serão preenchidos automaticamente
7. Complete o formulário e submeta a rota

### Para Desenvolvedores

```typescript
import { parseGPXFile, gpxPointsToGeoJSON } from '@/lib/gpx-parser'

// Parse um arquivo GPX
const gpxData = await parseGPXFile(file)

// Acessar dados extraídos
console.log(gpxData.totalDistance)  // km
console.log(gpxData.elevationGain)   // metros
console.log(gpxData.points)          // array de coordenadas

// Converter para GeoJSON
const geoJSON = gpxPointsToGeoJSON(gpxData.points)
```

## Validações

- Arquivo deve ter extensão `.gpx`
- Tamanho máximo: 10MB
- Deve conter pelo menos 2 pontos (track ou route)
- XML deve ser válido
- Upload é obrigatório antes de submeter rota

## Melhorias Futuras

- [ ] Upload de múltiplos arquivos GPX
- [ ] Suporte para waypoints (pontos de interesse)
- [ ] Edição visual da rota no mapa
- [ ] Simplificação automática de rotas muito densas
- [ ] Export de rotas modificadas
- [ ] Análise de perfil de elevação gráfico
- [ ] Detecção automática de paradas/POIs
- [ ] Suporte para formatos KML e TCX

## Dependências

- `@vis.gl/react-google-maps` - Componentes React para Google Maps
- `DOMParser` (nativo) - Parsing de XML
- Google Maps API - Renderização do mapa

## Notas Técnicas

- A simplificação de rotas (algoritmo Douglas-Peucker) está disponível mas não é aplicada por padrão
- Coordenadas são armazenadas como GeoJSON LineString no formato [longitude, latitude]
- Todos os cálculos de distância usam a fórmula de Haversine para precisão em superfície esférica
- Elevação é opcional; algumas rotas GPX podem não incluir dados de altitude

## Compatibilidade

Arquivos GPX exportados de:
- ✅ Strava
- ✅ Komoot
- ✅ Ride with GPS
- ✅ Garmin Connect
- ✅ Wahoo
- ✅ Google Earth/Maps (via conversores)
- ✅ Qualquer app que exporte GPX 1.0 ou 1.1
