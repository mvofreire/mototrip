# Route Validator and Enrichment

Este script valida e enriquece rotas no banco de dados, preenchendo campos ausentes com informações calculadas e obtidas via API do OpenStreetMap.

## Funcionalidade

O script carrega todas as rotas do banco de dados e identifica quais precisam ser populadas com as seguintes informações:

### Campos Enriquecidos

- **thumbnail_url**: URL de thumbnail gerada a partir das coordenadas da rota
- **route_type**: Tipo de rota (`loop` ou `out_and_back`)
- **country**: País obtido via geocodificação reversa do Nominatim
- **description**: Descrição gerada automaticamente baseada nas características da rota
- **difficulty**: Dificuldade calculada (`easy`, `moderate`, `challenging`, `expert`)
- **distance_km**: Distância em km calculada via fórmula de Haversine
- **duration_minutes**: Duração estimada (média de 40 km/h + penalidade de elevação)
- **elevation_gain_m**: Ganho de elevação em metros
- **scenic_score**: Pontuação panorâmica (0-10)
- **fun_factor_score**: Pontuação de diversão (0-10)

## Como Usar

```bash
npx tsx jobs/validate_routes.ts
```

## Processo de Enriquecimento

### 1. Cálculo de Estatísticas

O script analisa as coordenadas da rota para calcular:
- **Distância**: Usa a fórmula de Haversine entre pontos consecutivos
- **Ganho de Elevação**: Soma as diferenças positivas de altitude
- **Duração**: Baseada em 40 km/h + 2 minutos por 100m de elevação

### 2. Geocodificação Reversa

Utiliza a API Nominatim do OpenStreetMap para:
- Identificar o país a partir da primeira coordenada
- Respeitando rate limits (1 requisição por segundo)

### 3. Determinação de Dificuldade

Calcula dificuldade baseada em:
- **Distância**: <50km (fácil) até >150km (difícil)
- **Elevação**: <300m (fácil) até >1500m (expert)
- **Tipo de estrada**: Motorway (fácil) até secundária (difícil)

Escala de pontuação:
- 0-2 pontos: `easy`
- 3-4 pontos: `moderate`
- 5-6 pontos: `challenging`
- 7+ pontos: `expert`

### 4. Cálculo de Scenic Score

Pontuação panorâmica baseada em:
- **Categoria**: Scenic (+2.0), Mountain/Coastal (+1.5), Adventure (+1.0)
- **Elevação**: >1000m (+1.5), >500m (+1.0), >200m (+0.5)
- **Região**: Bônus para áreas conhecidas (Alpes, Dolomitas, etc.)

### 5. Cálculo de Fun Factor

Pontuação de diversão baseada em:
- **Distância ideal**: 100-180km (+2.0), 80-220km (+1.0)
- **Elevação**: >800m (+1.5), >400m (+1.0), >150m (+0.5)
- **Categoria**: Adventure (+1.5), Mountain/Coastal (+1.0)
- **Dificuldade**: Moderate/Challenging (+1.0), Easy (+0.5)

### 6. Determinação de Tipo de Rota

- **Loop**: Se início e fim estão próximos (< 0.1° de distância)
- **Out and Back**: Caso contrário

### 7. Geração de Descrição

Cria uma descrição em português com:
- Nome da rota
- País
- Categoria traduzida
- Distância e elevação
- Dificuldade traduzida
- Tipo de rota

Exemplo:
> "Rota dos Alpes é uma rota montanhosa em Suíça, com 150km de extensão e 2500m de ganho de elevação. Classificada como desafiadora, esta rota circular oferece uma experiência única para motociclistas que buscam aventura."

### 8. Geração de Thumbnail

Cria URL para imagem estática do OpenStreetMap centrada no ponto médio da rota.

## Rate Limiting

O script respeita os limites da API do OpenStreetMap:
- **1.5 segundos** entre cada rota processada
- **1 segundo** antes de cada requisição ao Nominatim

## Exemplo de Uso

```typescript
// Processar todas as rotas que precisam de enriquecimento
npx tsx jobs/validate_routes.ts

// O script irá:
// 1. Mostrar estatísticas atuais
// 2. Identificar rotas incompletas
// 3. Processar cada rota
// 4. Mostrar estatísticas finais
```

## Saída do Script

```
================================================================================
CURRENT ROUTE STATISTICS
================================================================================

Total routes: 50
Missing fields:
  thumbnail_url: 30 (60.0%)
  route_type: 25 (50.0%)
  country: 20 (40.0%)
  description: 35 (70.0%)
  ...

✓ Complete routes: 15/50 (30.0%)

================================================================================
ROUTE VALIDATION AND ENRICHMENT
================================================================================

Loading routes from database...
Found 50 routes

35 routes need enrichment
15 routes are already complete

[1/35] Processing: Alpine Adventure
  Missing fields: thumbnail_url, country, description
  ✓ Country: Switzerland
  ✓ Route type: loop
  ✓ Generated description
  ✓ Generated thumbnail URL
  ✓ Route updated successfully
...
```

## Notas Técnicas

### API do OpenStreetMap

- **Nominatim**: Para geocodificação reversa
- **Overpass API**: Disponível mas não usado no momento
- **User-Agent**: 'MotoTrip Route Validator/1.0'

### Estrutura de Dados

O script trabalha com o schema definido em `/supabase/schema.sql`:
- Tabela: `public.routes`
- Tipos: Conforme `types/database.types.ts`

### Tratamento de Erros

- Rotas sem coordenadas são puladas
- Erros de API são logados mas não interrompem o processamento
- Falhas individuais não afetam outras rotas

## Melhorias Futuras

1. **Integração com Google Maps**: Para thumbnails de melhor qualidade
2. **Machine Learning**: Para scores mais precisos
3. **Análise de Estrada**: Usar Overpass API para qualidade de estrada
4. **Pontos de Interesse**: Integrar POIs ao longo da rota
5. **Paralelização**: Processar múltiplas rotas simultaneamente (respeitando rate limits)
6. **Cache**: Armazenar respostas de geocodificação
