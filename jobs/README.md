# Motorcycle Routes Generator

Sistema de geração automática de rotas de motociclismo usando dados do OpenStreetMap.

## 📋 Visão Geral

Este script gera automaticamente rotas de motociclismo de alta qualidade usando:
- Dados de estradas do OpenStreetMap via Overpass API
- Cálculos geoespaciais com Turf.js
- Sistema de pontuação baseado em curvas, elevação e qualidade
- Extração de pontos de interesse (POIs) ao longo das rotas

## 🚀 Instalação

```bash
# Instalar dependências
npm install
# ou
yarn install
```

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie ou edite `.env.local` na raiz do projeto:

```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
```

### 2. Usuário do Sistema

O script usa um ID de usuário do sistema para as rotas geradas. Por padrão:

```typescript
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001';
```

**Importante:** Você precisa criar este usuário no Supabase antes de executar o script:

```sql
-- Inserir usuário do sistema
INSERT INTO public.users (id, email, name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@mototrip.com',
  'Sistema'
);
```

## ▶️ Execução

### Método 1: NPM Script (Recomendado)

```bash
npm run generate:routes
```

### Método 2: Direto com tsx

```bash
npx tsx jobs/routes_generator.ts
```

### Método 3: Compilar e Executar

```bash
tsc jobs/routes_generator.ts
node jobs/routes_generator.js
```

## 📊 Funcionamento

### Pipeline de Geração

1. **Buscar Rede de Estradas** (Overpass API)
   - Estradas secundárias e terciárias
   - Áreas rurais e cênicas
   - Evita autoestradas e áreas urbanas

2. **Gerar Rotas em Loop**
   - Algoritmo DFS com backtracking
   - Distância: 80-250 km
   - Valida fechamento de loop (< 5km)

3. **Calcular Métricas**
   - Curvosidade (mudanças direcionais)
   - Ganho de elevação
   - Distância total

4. **Classificação**
   - Categoria: scenic, mountain, coastal, weekend, adventure
   - Dificuldade: easy, moderate, challenging, expert

5. **Sistema de Pontuação**
   ```
   fun_factor = curviness×0.6 + elevation×0.2 + road_quality×0.2
   ```

6. **Extrair Pontos de Interesse**
   - Mirantes
   - Cafés
   - Postos de gasolina
   - Atrações turísticas

7. **Salvar no Banco de Dados**
   - Tabela `routes`
   - Tabela `route_stops`

### Regiões Configuradas

Por padrão, o script gera rotas em Portugal:

- **Norte**: Serra da Estrela, Douro, Gerês
- **Centro**: Serra de Aire, Beiras
- **Alentejo**: Planícies alentejanas
- **Algarve**: Costa algarvia, Serra de Monchique

## ⚙️ Configuração Avançada

### Ajustar Número de Rotas

Edite em [routes_generator.ts](jobs/routes_generator.ts):

```typescript
const TARGET_ROUTES_COUNT = 100; // Número total de rotas
```

### Modificar Regiões

```typescript
const REGIONS = [
  { name: 'Norte', bbox: [41.0, -8.9, 42.2, -6.2] },
  // Adicione suas regiões aqui
];
```

### Controlar Concorrência

```typescript
const CONCURRENCY_LIMIT = 5; // Requisições simultâneas
```

### Personalizar Critérios de Rota

```typescript
const MIN_DISTANCE_KM = 80;
const MAX_DISTANCE_KM = 250;
```

## 📈 Saída do Script

```
[INFO] 2026-03-09T10:00:00.000Z - Starting Motorcycle Routes Generator
[INFO] 2026-03-09T10:00:01.000Z - Processing region: Norte
[INFO] 2026-03-09T10:00:02.000Z - Fetching road network for bbox: [41.0, -8.9, 42.2, -6.2]
[SUCCESS] 2026-03-09T10:00:15.000Z - Fetched 1234 road segments
[INFO] 2026-03-09T10:00:15.000Z - Building routes from 1234 ways in Norte
[INFO] 2026-03-09T10:00:20.000Z - Generated route 1/25 in Norte
...
[SUCCESS] 2026-03-09T10:05:00.000Z - Saved route: Serra da Estrela Scenic Loop (uuid)
[INFO] 2026-03-09T10:05:01.000Z - Added 3 stops to route uuid
...
[SUCCESS] 2026-03-09T10:30:00.000Z - Route Generation Complete!
[INFO] 2026-03-09T10:30:00.000Z - Total routes generated: 98
[INFO] 2026-03-09T10:30:00.000Z - Successfully saved: 95
[INFO] 2026-03-09T10:30:00.000Z - Failed: 3
```

## 🔍 Estrutura das Rotas Geradas

### Tabela `routes`

```typescript
{
  id: UUID,
  user_id: UUID,
  title: "Serra da Estrela Scenic Loop",
  description: "Demanding route with tight switchbacks...",
  difficulty: "challenging",
  distance_km: 145.50,
  duration_minutes: 174,
  elevation_gain_m: 1164,
  polyline_coordinates: {
    type: "LineString",
    coordinates: [[lon, lat], ...]
  },
  region: "Norte",
  category: "mountain",
  scenic_score: 8.5,
  road_quality_score: 7.8,
  fun_factor_score: 8.2,
  featured: true,
  published: true
}
```

### Tabela `route_stops`

```typescript
{
  id: UUID,
  route_id: UUID,
  name: "Miradouro da Serra",
  description: null,
  type: "viewpoint",
  latitude: 40.3456,
  longitude: -7.6123,
  order_index: 0
}
```

## 🚨 Limitações e Considerações

### Rate Limiting da Overpass API

- Delay de 1-2 segundos entre requisições
- Timeout de 60-90 segundos por query
- Evite executar múltiplas instâncias simultaneamente

### Dados de Elevação

A versão atual usa estimativas simplificadas de elevação. Para produção real, integre com:

- [OpenTopoData](https://www.opentopodata.org/)
- [Open-Elevation API](https://open-elevation.com/)
- [Mapbox Tilequery API](https://docs.mapbox.com/api/maps/tilequery/)

### Qualidade das Rotas

Rotas são geradas algoritmicamente. Recomenda-se:

- Revisão manual das rotas featured
- Validação de segurança
- Ajustes de descrições
- Adição de fotos reais

## 🛠️ Troubleshooting

### Erro: Missing environment variables

```bash
# Verifique se .env.local existe e contém:
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Erro: Foreign key violation on user_id

```sql
-- Crie o usuário do sistema:
INSERT INTO public.users (id, email, name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@mototrip.com',
  'Sistema'
);
```

### Erro: Overpass API timeout

- Reduza o tamanho das bounding boxes
- Aumente o timeout nas queries
- Adicione mais delay entre requisições

### Poucas rotas geradas

- Aumente `maxAttempts` no `generateLoopRoutes()`
- Ajuste critérios de distância min/max
- Verifique densidade de estradas na região

## 🔄 Manutenção

### Re-gerar Rotas

Para limpar e re-gerar:

```sql
-- Cuidado: apaga todas as rotas do sistema
DELETE FROM public.routes WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

### Atualizar Rotas Existentes

O script sempre cria novas rotas. Para atualizar, modifique a lógica de inserção para usar `upsert`.

## 📝 Logs

Todos os logs incluem timestamps ISO 8601:

- `[INFO]` - Informações de progresso
- `[SUCCESS]` - Operações bem-sucedidas
- `[WARN]` - Avisos não-críticos
- `[ERROR]` - Erros que exigem atenção

## 🚀 Melhorias Futuras

- [ ] Integração com API de elevação real
- [ ] Suporte a múltiplos países
- [ ] Validação de segurança de estradas
- [ ] Geração de fotos via Mapillary API
- [ ] Sistema de cache para Overpass API
- [ ] Modo incremental (adicionar N rotas)
- [ ] Análise de tráfego e popularidade
- [ ] Rotas ponto-a-ponto (não apenas loops)

## 📄 Licença

Este código faz parte do projeto Mototrip.

---

**Desenvolvido com ❤️ para motociclistas**
