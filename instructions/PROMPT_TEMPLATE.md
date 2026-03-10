# Template de Prompt para Desenvolvimento de Features

Este documento fornece exemplos e diretrizes de como estruturar prompts efetivos para desenvolvimento de novas features no MotoTrip.

## Estrutura Recomendada

Um bom prompt deve incluir:

1. **Contexto** - O que já existe e o problema a resolver
2. **Objetivo** - O que você quer implementar
3. **Requisitos Funcionais** - Comportamento esperado
4. **Requisitos Técnicos** - Stack, padrões, integrações
5. **UI/UX** - Layout, componentes, interações
6. **Dados** - Estrutura, validações, regras de negócio
7. **Edge Cases** - Cenários especiais a considerar

---

## Exemplo 1: Feature Completa (Sistema de Comentários)

```
Preciso implementar um sistema de comentários nas rotas do MotoTrip.

CONTEXTO:
- Já temos rotas armazenadas no Supabase (tabela routes)
- Usuários fazem login via Supabase Auth
- Usamos Next.js 14 (App Router), TypeScript, Tailwind e shadcn/ui
- Sistema i18n já configurado (pt, en, es)

OBJETIVO:
Permitir que usuários logados comentem em rotas e visualizem comentários de outros usuários.

REQUISITOS FUNCIONAIS:
1. Usuários logados podem adicionar comentários em qualquer rota
2. Comentários devem mostrar: texto, autor, data, avatar do usuário
3. Autor do comentário pode editar/deletar seus próprios comentários
4. Admin pode deletar qualquer comentário
5. Mostrar contador de comentários em cada rota
6. Ordenar comentários por mais recentes primeiro
7. Paginação: 20 comentários por página

REQUISITOS TÉCNICOS:
- Criar tabela route_comments no Supabase
- Implementar RLS (Row Level Security):
  * Todos podem ler comentários de rotas publicadas
  * Apenas usuários autenticados podem criar
  * Apenas autor ou admin podem editar/deletar
- Service layer: lib/services/comments.service.ts
- Componentes: components/features/comments/
- Usar React Query para cache e invalidação
- Validação: máximo 500 caracteres por comentário

ESTRUTURA DO BANCO:
```sql
CREATE TABLE route_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

UI/UX:
- Adicionar seção "Comentários" na página de detalhes da rota
- Input de comentário: textarea com contador de caracteres
- Card de comentário com avatar circular à esquerda
- Botão "Editar" e "Deletar" apenas para comentários próprios
- Loading states e mensagens de erro
- Empty state: "Seja o primeiro a comentar"

TRADUÇÕES NECESSÁRIAS:
- comments.title: "Comentários"
- comments.add: "Adicionar comentário"
- comments.placeholder: "Compartilhe sua experiência..."
- comments.edit: "Editar"
- comments.delete: "Deletar"
- comments.empty: "Seja o primeiro a comentar nesta rota"
- comments.count: "{count} comentários"

EDGE CASES:
- Usuário deleta conta: comentários devem ser deletados (ON DELETE CASCADE)
- Rota deletada: comentários deletados automaticamente
- Comentário vazio: não permitir submit
- Rate limiting: máximo 5 comentários por minuto por usuário
- Sanitização de HTML para prevenir XSS

Por favor, implemente esta feature completa com:
1. Migration SQL para criar tabela e políticas RLS
2. Types TypeScript
3. Service layer
4. Componentes React
5. Integração na página de detalhes da rota
6. Traduções i18n
7. Testes básicos de validação
```

---

## Exemplo 2: Feature Simples (Botão Favoritar)

```
Adicione um botão de favoritar nas rotas.

CONTEXTO:
- Projeto MotoTrip com Next.js 14 e Supabase
- Já existe tabela saved_routes para rotas salvas
- Cards de rota mostram informações básicas

OBJETIVO:
Permitir favoritar/desfavoritar rotas com um clique.

REQUISITOS:
1. Ícone de coração no canto superior direito do RouteCard
2. Preenchido = favoritado, vazio = não favoritado
3. Toggle on click (adiciona/remove de saved_routes)
4. Mostrar contador de favoritos
5. Apenas usuários logados podem favoritar
6. Tooltip: "Favoritar" ou "Remover dos favoritos"

TÉCNICO:
- Usar componente Heart do lucide-react
- Adicionar método toggleSave() em routes.service.ts
- Otimistic update (UI responde imediatamente)
- Revalidar cache após mutação

UI:
- Posição: absolute top-2 right-2
- Cor: red-500 quando ativo, gray-400 quando inativo
- Animação suave ao clicar
- Tamanho: 20px

Se usuário não logado: mostrar toast "Faça login para favoritar"
```

---

## Exemplo 3: Integração com API Externa

```
Integre previsão do tempo nas rotas usando OpenWeatherMap API.

CONTEXTO:
- Cada rota tem coordenadas (polyline_coordinates)
- Página de detalhes da rota já existe
- Usamos server actions para chamadas de API

OBJETIVO:
Mostrar previsão do tempo para os próximos 3 dias ao longo da rota.

REQUISITOS:
1. Obter previsão para 3 pontos: início, meio, fim da rota
2. Mostrar: temperatura, condição (sol/chuva/nublado), vento
3. Cache de 1 hora (previsão não muda frequentemente)
4. Fallback gracioso se API falhar
5. Ícones de clima apropriados

TÉCNICO:
- API: https://openweathermap.org/api
- Criar lib/services/weather.service.ts
- Usar Redis ou Supabase para cache (sua escolha)
- Variável de ambiente: OPENWEATHERMAP_API_KEY
- Rate limit: 1000 calls/dia (considerar isso)

DADOS:
```typescript
interface WeatherForecast {
  location: { lat: number; lng: number }
  date: string
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy'
  windSpeed: number
  humidity: number
}
```

UI:
- Card "Previsão do Tempo" abaixo do mapa na página da rota
- Grid 3 colunas (início, meio, fim)
- Cada item: ícone grande, temperatura, cidade mais próxima
- Loading skeleton enquanto carrega
- Se erro: "Previsão indisponível no momento"

Adicione ao .env.example e README.
```

---

## Exemplo 4: Melhoria/Refatoração

```
Refatore o sistema de filtros de rotas para melhor performance.

PROBLEMA ATUAL:
- Filtros na página /explore fazem query completa toda vez
- Sem debounce na busca por texto
- Filtros não persistem ao navegar
- UX confusa com muitos filtros expandidos

OBJETIVO:
Melhorar performance e UX dos filtros.

MUDANÇAS DESEJADAS:
1. Implementar debounce de 300ms na busca
2. Usar React Query com cache de 5min
3. Persistir filtros ativos na URL (searchParams)
4. Filtros colapsáveis em accordion
5. Botão "Limpar filtros" quando há filtros ativos
6. Mostrar count de resultados: "23 rotas encontradas"

TÉCNICO:
- Usar useDebounce hook
- Atualizar routes.service.ts para aceitar FilterParams
- Usar useSearchParams do Next.js
- Componente Accordion do shadcn/ui
- Memoizar cálculos pesados

MANTER:
- Todos os filtros atuais (dificuldade, categoria, distância, etc)
- Design e posicionamento geral
- Funcionalidade mobile

ADICIONAR:
- Indicador visual de quantos filtros estão ativos
- Transição suave ao aplicar filtros
- Loading state enquanto filtra
```

---

## Exemplo 5: Bug Fix com Contexto

```
Corrija bug no upload de GPX files.

BUG:
Ao fazer upload de arquivo GPX grande (>2MB), a aplicação trava e não mostra erro.

CENÁRIO:
1. Usuário vai em /submit
2. Seleciona arquivo GPX de 3MB
3. Clica "Upload"
4. Loading infinito, nenhum feedback
5. Console mostra erro: "PayloadTooLargeError"

COMPORTAMENTO ESPERADO:
- Validar tamanho antes do upload
- Máximo: 5MB
- Mostrar mensagem clara: "Arquivo muito grande. Máximo 5MB"
- Sugerir: "Reduza o arquivo ou simplifique a rota"

ONDE INVESTIGAR:
- components/features/routes/gpx-upload.tsx
- lib/gpx-parser.ts
- Configuração do Next.js (bodyParser limit?)

SOLUÇÃO DESEJADA:
1. Adicionar validação client-side de tamanho
2. Configurar limite no Next.js se necessário
3. Melhorar feedback de erro
4. Adicionar loading state mais claro
5. Documentar limite no README

Considere também adicionar:
- Indicador de progresso de upload
- Cancelar upload em andamento
```

---

## Dicas para Prompts Efetivos

### ✅ BOM
- Seja específico sobre tecnologias usadas
- Inclua exemplos de estrutura de dados
- Mencione arquivos relacionados existentes
- Especifique padrões a seguir (naming, estrutura)
- Inclua requisitos não-funcionais (performance, segurança)
- Mencione edge cases importantes

### ❌ EVITE
- "Crie um sistema de comentários" (muito vago)
- "Faça igual ao Instagram" (sem detalhes)
- "Adicione um botão" (onde? como? faz o quê?)
- Assumir conhecimento do projeto sem contexto
- Múltiplas features não relacionadas no mesmo prompt

---

## Checklist Antes de Enviar Prompt

- [ ] Contexto do projeto está claro?
- [ ] Objetivo é específico e mensurável?
- [ ] Requisitos funcionais listados?
- [ ] Stack técnico mencionado?
- [ ] Estrutura de dados definida (se aplicável)?
- [ ] UI/UX descrito ou mockup incluído?
- [ ] Edge cases considerados?
- [ ] Integrações com código existente especificadas?
- [ ] Requisitos de i18n mencionados (pt/en/es)?
- [ ] Segurança e validações consideradas?

---

## Template Rápido (Copie e Cole)

```
Preciso implementar [FEATURE NAME].

CONTEXTO:
- [O que já existe]
- [Problema atual]
- [Stack usado]

OBJETIVO:
[O que você quer alcançar]

REQUISITOS:
1. [Requisito 1]
2. [Requisito 2]
3. [Requisito 3]

TÉCNICO:
- [Tabelas/APIs necessárias]
- [Serviços a criar/modificar]
- [Componentes necessários]

UI/UX:
- [Descrição visual]
- [Interações]
- [Estados]

DADOS:
```typescript
// Estrutura esperada
```

EDGE CASES:
- [Caso especial 1]
- [Caso especial 2]

Por favor implemente com testes e documentação.
```

---

## Exemplos de Contexto Útil

Sempre que possível, inclua:

```
ARQUITETURA ATUAL:
- Next.js 14 App Router
- Supabase (PostgreSQL + Auth + Storage)
- TypeScript, Tailwind CSS, shadcn/ui
- i18n com next-intl (pt, en, es)
- React Query para data fetching

CONVENÇÕES DO PROJETO:
- Componentes: PascalCase, feature-based folders
- Services: kebab-case, método async/await
- Types: interfaces no database.types.ts
- i18n: chave.subchave em lowercase

ESTRUTURA:
- app/[locale]/... - páginas
- components/features/... - componentes específicos
- lib/services/... - camada de API
- types/... - tipos TypeScript
```

---

## Conclusão

Quanto mais específico e estruturado for seu prompt, melhor será o resultado. Use exemplos reais, mencione arquivos existentes, e não hesite em incluir detalhes sobre comportamento esperado.

**Lembre-se**: É melhor um prompt longo e completo do que múltiplos prompts corretivos depois!
