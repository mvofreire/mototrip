# MotoTrip - Especificações de Desenvolvimento

> **Documento de Referência para Desenvolvimento**  
> Este arquivo contém todas as especificações, padrões e convenções do projeto MotoTrip.  
> Consulte este documento antes de fazer alterações ou adicionar novas features.

---

## 📋 Visão Geral do Produto

### Propósito
Plataforma web para descoberta e compartilhamento de rotas de motocicleta. Foco na experiência de pilotagem, não apenas navegação.

### Público-Alvo
- Motociclistas que buscam rotas cênicas
- Comunidade de touring e adventure
- Riders que querem compartilhar suas rotas favoritas

### Inspiração de Produto
- **AllTrails** - Sistema de descoberta e filtros
- **Komoot** - Planejamento de rotas
- **Google Maps** - Mapas e navegação
- **Strava** - Aspecto comunitário

---

## 🎨 Design System

### Paleta de Cores "Sunshine"

A paleta evoca aventura, liberdade e luz do sol.

#### Cores Primárias

```typescript
// Amarelo - Otimismo e juventude
sunshine-yellow: {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',  // Principal
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
}

// Laranja - Energia e aventura
sunshine-orange: {
  50: '#FFF7ED',
  100: '#FFEDD5',
  200: '#FED7AA',
  300: '#FDBA74',
  400: '#FB923C',  // Principal
  500: '#F97316',
  600: '#EA580C',
  700: '#C2410C',
  800: '#9A3412',
  900: '#7C2D12',
}

// Rosa - Calor emocional
sunshine-pink: {
  50: '#FDF2F8',
  100: '#FCE7F3',
  200: '#FBCFE8',
  300: '#F9A8D4',
  400: '#F472B6',  // Principal
  500: '#EC4899',
  600: '#DB2777',
  700: '#BE185D',
  800: '#9D174D',
  900: '#831843',
}

// Coral - Atmosfera convidativa
sunshine-coral: {
  50: '#FFF5F2',
  100: '#FFE8E0',
  200: '#FFD0BF',
  300: '#FFB399',
  400: '#FF9173',
  500: '#FF6B4D',  // Principal
  600: '#F04E30',
  700: '#C73E25',
  800: '#9E311D',
  900: '#7D2718',
}
```

#### Cores Neutras

```typescript
// Sand - Tons de areia quentes
sand: {
  50: '#FAFAF9',   // Background principal
  100: '#F5F5F4',
  200: '#E7E5E4',
  300: '#D6D3D1',
  400: '#A8A29E',
  500: '#78716C',
  600: '#57534E',
  700: '#44403C',
  800: '#292524',
  900: '#1C1917',  // Texto escuro
}
```

### Gradientes

```css
/* Gradiente principal - sunshine */
.gradient-sunshine {
  background: linear-gradient(135deg, #FCD34D 0%, #FB923C 50%, #F472B6 100%);
}

/* Gradiente sutil - fundos */
.gradient-sunshine-subtle {
  background: linear-gradient(135deg, #FEF3C7 0%, #FFEDD5 50%, #FCE7F3 100%);
}
```

### Tipografia

```typescript
// Font: Inter (Google Fonts)
font-family: 'Inter', system-ui, sans-serif

// Escalas
text-xs: 0.75rem    // 12px
text-sm: 0.875rem   // 14px
text-base: 1rem     // 16px
text-lg: 1.125rem   // 18px
text-xl: 1.25rem    // 20px
text-2xl: 1.5rem    // 24px
text-3xl: 1.875rem  // 30px
text-4xl: 2.25rem   // 36px
text-5xl: 3rem      // 48px
text-6xl: 3.75rem   // 60px
text-7xl: 4.5rem    // 72px
```

### Espaçamento

```typescript
// System 8pt base
1: 0.25rem   // 4px
2: 0.5rem    // 8px
3: 0.75rem   // 12px
4: 1rem      // 16px
5: 1.25rem   // 20px
6: 1.5rem    // 24px
8: 2rem      // 32px
12: 3rem     // 48px
16: 4rem     // 64px
24: 6rem     // 96px
32: 8rem     // 128px
```

### Border Radius

```typescript
// Sutis - não muito arredondados
sm: 0.125rem   // 2px
DEFAULT: 0.25rem   // 4px
md: 0.375rem   // 6px
lg: 0.5rem     // 8px
xl: 0.75rem    // 12px
2xl: 1rem      // 16px
full: 9999px
```

### Princípios de Design

1. **Moderno e Limpo**: Espaçamento generoso, hierarquia clara
2. **Levemente Masculino**: Evitar UI muito arredondada ou infantil
3. **Premium**: Atenção aos detalhes, animações suaves
4. **Rápido**: Priorizar performance visual
5. **Inspiração**: Vercel, Linear, Stripe, Apple Maps

---

## 🏗️ Arquitetura do Projeto

### Stack Tecnológica

```typescript
{
  // Core
  framework: "Next.js 14 (App Router)",
  language: "TypeScript",
  runtime: "Node.js 18+",
  packageManager: "npm 9+",
  
  // Styling
  styling: "TailwindCSS",
  components: "shadcn/ui (Radix UI)",
  icons: "lucide-react",
  
  // Internationalization
  i18n: "next-intl 3.9+",
  supportedLocales: ["en", "pt", "es"],
  defaultLocale: "en",
  
  // State & Data
  dataFetching: "TanStack Query (React Query)",
  forms: "React Hook Form (futuro)",
  
  // Backend
  database: "Supabase (PostgreSQL)",
  auth: "Supabase Auth",
  storage: "Supabase Storage",
  
  // Maps
  maps: "Google Maps API / Mapbox",
  
  // Deployment
  hosting: "Vercel",
  analytics: "Vercel Analytics (futuro)"
}
```

### Estrutura de Pastas

```
mototrip/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Grupo de rotas autenticadas (futuro)
│   ├── explore/                 # Página de exploração
│   │   └── page.tsx
│   ├── routes/                  # Rotas dinâmicas
│   │   └── [id]/
│   │       └── page.tsx
│   ├── submit/                  # Submissão de rotas (futuro)
│   ├── profile/                 # Perfis de usuário (futuro)
│   ├── layout.tsx               # Layout raiz
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # Providers (Query, etc)
│   ├── globals.css              # Estilos globais
│   └── not-found.tsx            # 404 page
│
├── components/
│   ├── features/                # Componentes de features
│   │   └── routes/             # Feature: Routes
│   │       ├── route-card.tsx
│   │       ├── route-filters.tsx
│   │       ├── route-hero.tsx
│   │       ├── route-map.tsx
│   │       ├── route-stats.tsx
│   │       ├── route-ratings.tsx
│   │       └── stops-timeline.tsx
│   │
│   ├── layout/                  # Componentes de layout
│   │   ├── header.tsx
│   │   └── footer.tsx
│   │
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── input.tsx
│       ├── checkbox.tsx
│       ├── label.tsx
│       ├── slider.tsx
│       └── separator.tsx
│
├── lib/
│   ├── services/                # Camada de serviços
│   │   └── routes.service.ts   # API de rotas
│   │
│   ├── supabase/               # Supabase config
│   │   └── client.ts
│   │
│   ├── hooks/                  # Custom hooks (futuro)
│   ├── utils.ts                # Utilitários
│   ├── mock-data.ts            # Dados mock
│   └── seed.ts                 # Script de seed
│
├── types/
│   ├── database.types.ts       # Tipos do Supabase
│   └── index.ts                # Tipos exportados
│
├── supabase/
│   ├── schema.sql              # Schema completo
│   └── seed.sql                # Dados de exemplo
│
├── public/                     # Assets estáticos
│
├── .env.local                  # Variáveis de ambiente (git ignored)
├── .env.example                # Template de env vars
├── components.json             # Config shadcn/ui
├── tailwind.config.ts          # Config Tailwind
├── tsconfig.json               # Config TypeScript
├── next.config.js              # Config Next.js
├── package.json
└── README.md
```

---

## 🗄️ Modelo de Dados

### Entidades Principais

#### User
```typescript
{
  id: UUID (FK auth.users)
  email: string
  name?: string
  avatar_url?: string
  bio?: string
  created_at: timestamp
  updated_at: timestamp
}
```

#### Route
```typescript
{
  id: UUID
  user_id: UUID (FK users)
  title: string
  description?: string
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
  distance_km: decimal
  duration_minutes: integer
  elevation_gain_m?: integer
  polyline_coordinates: JSONB (GeoJSON LineString)
  region?: string
  category: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
  scenic_score: decimal (0-10)
  road_quality_score: decimal (0-10)
  fun_factor_score: decimal (0-10)
  featured: boolean
  published: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

#### RouteStop
```typescript
{
  id: UUID
  route_id: UUID (FK routes)
  name: string
  description?: string
  type: 'viewpoint' | 'cafe' | 'gas_station' | 'restaurant' | 'landmark' | 'accommodation'
  latitude: decimal
  longitude: decimal
  order_index: integer
  created_at: timestamp
}
```

#### RouteRating
```typescript
{
  id: UUID
  route_id: UUID (FK routes)
  user_id: UUID (FK users)
  scenic_rating: decimal (0-10)
  road_quality_rating: decimal (0-10)
  fun_factor_rating: decimal (0-10)
  comment?: string
  created_at: timestamp
  updated_at: timestamp
  
  UNIQUE(route_id, user_id)
}
```

#### RoutePhoto
```typescript
{
  id: UUID
  route_id: UUID (FK routes)
  user_id: UUID (FK users)
  url: string
  caption?: string
  order_index: integer
  created_at: timestamp
}
```

#### SavedRoute
```typescript
{
  id: UUID
  user_id: UUID (FK users)
  route_id: UUID (FK routes)
  created_at: timestamp
  
  UNIQUE(user_id, route_id)
}
```

### Relações

```
User (1) ──< (N) Routes
User (1) ──< (N) SavedRoutes
User (1) ──< (N) RouteRatings
User (1) ──< (N) RoutePhotos

Route (1) ──< (N) RouteStops
Route (1) ──< (N) RoutePhotos
Route (1) ──< (N) RouteRatings
Route (1) ──< (N) SavedRoutes
```

---

## 🌍 Internacionalização (i18n)

### Configuração

O projeto usa **next-intl** para internacionalização com Next.js 14 App Router.

#### Idiomas Suportados

```typescript
// i18n.ts
export const locales = ['en', 'pt', 'es'] as const
export const defaultLocale = 'en'

export const localeNames = {
  en: 'English',
  pt: 'Português',
  es: 'Español',
}
```

#### Estrutura de URLs

Todas as rotas são prefixadas com o locale:

```
/en/explore         # Inglês
/pt/explore         # Português
/es/explore         # Espanhol
```

#### Arquivos de Tradução

Localizados em `/locales/`:

```
locales/
├── en.json         # Inglês (padrão)
├── pt.json         # Português
└── es.json         # Espanhol
```

### Uso em Componentes

#### Server Components

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'home' })
  
  return <h1>{t('hero.title')}</h1>
}
```

#### Client Components

```typescript
'use client'
import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations('nav')
  
  return <button>{t('exploreRoutes')}</button>
}
```

### Adicionar Novas Traduções

1. Adicione a chave em todos os arquivos de locale (`en.json`, `pt.json`, `es.json`)
2. Use namespaces para organizar (ex: `home`, `nav`, `route`)
3. Use interpolação para valores dinâmicos:

```json
{
  "explore": {
    "subtitle": "Descubra sua próxima aventura entre {count} rotas"
  }
}
```

```typescript
t('explore.subtitle', { count: 123 })
```

### Links Internacionalizados

Sempre prefixe links com o locale:

```typescript
import { useLocale } from 'next-intl'

const locale = useLocale()
<Link href={`/${locale}/explore`}>Explore</Link>
```

### Componente de Troca de Idioma

Use o `LanguageSwitcher` no header:

```typescript
import { LanguageSwitcher } from '@/components/language-switcher'

<LanguageSwitcher />
```

---

## 📝 Convenções de Código

### Nomenclatura

#### Arquivos
```typescript
// Componentes React: PascalCase
RouteCard.tsx
RouteFilters.tsx
StopsTimeline.tsx

// Páginas Next.js: kebab-case
page.tsx
layout.tsx
not-found.tsx

// Utilitários e serviços: kebab-case
utils.ts
routes.service.ts
mock-data.ts

// Tipos: kebab-case
database.types.ts
index.ts
```

#### Variáveis e Funções
```typescript
// camelCase para variáveis e funções
const routeFilters = {}
const handleSubmit = () => {}
const isLoading = false

// PascalCase para componentes
const RouteCard = () => {}
const StopsTimeline = () => {}

// SCREAMING_SNAKE_CASE para constantes
const MAX_ROUTES_PER_PAGE = 20
const DEFAULT_ZOOM_LEVEL = 10
```

### Estrutura de Componentes

#### Componente de Feature
```tsx
'use client' // Se necessário

import { FC } from 'react'
import { ComponentProps } from '@/types'
import { Card } from '@/components/ui/card'
import { formatDistance } from '@/lib/utils'

interface RouteCardProps {
  route: RouteWithDetails
  onSave?: (routeId: string) => void
  className?: string
}

export function RouteCard({ route, onSave, className }: RouteCardProps) {
  // Handlers
  const handleSaveClick = () => {
    onSave?.(route.id)
  }

  // Render
  return (
    <Card className={className}>
      {/* Conteúdo */}
    </Card>
  )
}
```

#### Componente de Página
```tsx
import { Metadata } from 'next'
import { RouteCard } from '@/components/features/routes/route-card'
import { mockRoutes } from '@/lib/mock-data'

export const metadata: Metadata = {
  title: 'Explore Routes',
  description: 'Discover motorcycle routes',
}

export default function ExplorePage() {
  return (
    <div className="container py-8">
      {/* Conteúdo */}
    </div>
  )
}
```

### Ordem de Imports

```typescript
// 1. React e Next.js
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// 2. Bibliotecas externas
import { useQuery } from '@tanstack/react-query'
import { MapPin } from 'lucide-react'

// 3. Componentes internos
import { Button } from '@/components/ui/button'
import { RouteCard } from '@/components/features/routes/route-card'

// 4. Utilitários e tipos
import { cn, formatDistance } from '@/lib/utils'
import { RouteWithDetails } from '@/types'

// 5. Estilos (se houver)
import styles from './styles.module.css'
```

### Estilização com Tailwind

```tsx
// ✅ BOM: Classes organizadas logicamente
<div className="
  flex items-center justify-between
  rounded-lg border bg-card
  p-6 shadow-sm
  hover:shadow-lg transition-shadow
">

// ✅ BOM: Usar cn() para classes condicionais
<Button className={cn(
  "font-semibold",
  variant === "primary" && "bg-gradient-sunshine",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>

// ❌ RUIM: Misturar responsividade sem lógica
<div className="p-2 md:p-4 text-sm bg-white rounded md:text-base lg:p-6">
```

### TypeScript

```typescript
// ✅ Sempre tipar props de componentes
interface ComponentProps {
  title: string
  count?: number
  onAction: (id: string) => void
}

// ✅ Usar tipos do Supabase
import { Route } from '@/types'

// ✅ Tipar retornos de funções
const getRoutes = async (): Promise<Route[]> => {
  // ...
}

// ❌ Evitar 'any'
// const data: any = await fetch()

// ✅ Usar unknown quando necessário
const data: unknown = await fetch()
if (isRoute(data)) {
  // type narrowing
}
```

---

## 🎯 Padrões de Features

### Feature: Route Discovery

#### Filtros Disponíveis
```typescript
interface RouteFilters {
  category?: RouteCategory[]        // scenic, mountain, coastal, etc
  difficulty?: RouteDifficulty[]    // easy, moderate, challenging, expert
  min_distance?: number             // km
  max_distance?: number             // km
  min_duration?: number             // minutos
  max_duration?: number             // minutos
  region?: string[]                 // regiões
  min_scenic_score?: number         // 0-10
  search?: string                   // busca no título
}
```

#### Ordenação
```typescript
interface RouteSort {
  field: 'created_at' | 'distance_km' | 'duration_minutes' | 'scenic_score' | 'fun_factor_score'
  direction: 'asc' | 'desc'
}
```

### Feature: Route Rating System

#### Critérios de Avaliação
1. **Scenic Score** (0-10): Beleza cênica da rota
2. **Road Quality** (0-10): Qualidade do asfalto
3. **Fun Factor** (0-10): Diversão na pilotagem

#### Cálculo Automático
- Scores são recalculados automaticamente via trigger SQL
- Média de todas as avaliações dos usuários

### Feature: Route Stops

#### Tipos de Paradas
```typescript
type StopType = 
  | 'viewpoint'      // Mirantes
  | 'cafe'           // Cafés
  | 'gas_station'    // Postos
  | 'restaurant'     // Restaurantes
  | 'landmark'       // Pontos turísticos
  | 'accommodation'  // Hotéis/Pousadas
```

#### Ícones por Tipo
```typescript
const stopIcons = {
  viewpoint: '🏔️',
  cafe: '☕',
  gas_station: '⛽',
  restaurant: '🍽️',
  landmark: '🏛️',
  accommodation: '🏨',
}
```

---

## 🚀 Performance

### Metas de Performance

```typescript
{
  lighthouse: {
    performance: 95+,
    accessibility: 95+,
    bestPractices: 95+,
    seo: 95+
  },
  
  coreWebVitals: {
    LCP: '< 2.5s',    // Largest Contentful Paint
    FID: '< 100ms',   // First Input Delay
    CLS: '< 0.1'      // Cumulative Layout Shift
  }
}
```

### Estratégias de Otimização

#### 1. Imagens
```tsx
// ✅ Sempre usar Next.js Image
import Image from 'next/image'

<Image
  src="/route-photo.jpg"
  alt="Route photo"
  width={800}
  height={600}
  priority={false} // true apenas para above-fold
  placeholder="blur"
/>
```

#### 2. Code Splitting
```tsx
// ✅ Dynamic imports para componentes pesados
import dynamic from 'next/dynamic'

const RouteMap = dynamic(
  () => import('@/components/features/routes/route-map'),
  { 
    ssr: false,
    loading: () => <MapSkeleton />
  }
)
```

#### 3. Dados
```tsx
// ✅ Server Components para buscar dados
export default async function RouteDetailPage({ params }) {
  const route = await getRouteById(params.id)
  return <RouteDetail route={route} />
}

// ✅ Client Components apenas quando necessário
'use client'
export function InteractiveMap() {
  // componente interativo
}
```

#### 4. Caching
```typescript
// TanStack Query config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minuto
      cacheTime: 5 * 60 * 1000,  // 5 minutos
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Políticas implementadas:

#### Users
- ✅ Todos podem ler perfis públicos
- ✅ Usuários podem atualizar apenas seu próprio perfil

#### Routes
- ✅ Todos podem ler rotas publicadas
- ✅ Apenas o dono pode editar/deletar

#### Ratings/Photos/Stops
- ✅ Todos podem ler
- ✅ Apenas autenticados podem criar
- ✅ Apenas o dono pode deletar

### Variáveis de Ambiente

```env
# ✅ Públicas (NEXT_PUBLIC_)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# ❌ Privadas (NUNCA expor ao cliente)
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
```

---

## 🧪 Testes (Futuro)

### Stack de Testes
```typescript
{
  unit: "Vitest",
  integration: "Testing Library",
  e2e: "Playwright",
  visual: "Chromatic / Percy"
}
```

### Convenções
```typescript
// Arquivos de teste ao lado do código
RouteCard.tsx
RouteCard.test.tsx

// Ou em pasta __tests__
__tests__/
  RouteCard.test.tsx
  RouteFilters.test.tsx
```

---

## 📱 Responsividade

### Breakpoints

```typescript
{
  sm: '640px',   // Phones (landscape)
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large screens
}
```

### Mobile First

```tsx
// ✅ BOM: Mobile first
<div className="
  flex-col          // mobile
  md:flex-row       // tablet+
  lg:gap-8          // laptop+
">

// ❌ RUIM: Desktop first
<div className="
  flex-row
  max-md:flex-col
">
```

---

## 🚢 Deploy

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Schema SQL executado no Supabase production
- [ ] RLS policies testadas
- [ ] Google Maps API key configurada
- [ ] Analytics configurado (Vercel Analytics)
- [ ] Custom domain configurado (se houver)
- [ ] OG images geradas
- [ ] Lighthouse score > 95

### Branches

```
main        → produção (Vercel)
develop     → staging (preview)
feature/*   → feature branches
hotfix/*    → correções urgentes
```

---

## 📚 Recursos e Links

### Documentação
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)

### Design
- [Vercel Design](https://vercel.com/design)
- [Linear Design](https://linear.app)
- [Radix UI](https://www.radix-ui.com)

### Mapas
- [Google Maps Platform](https://developers.google.com/maps)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js)

---

## 🔄 Changelog

### v0.1.0 - MVP (Março 2026)
- ✅ Landing page
- ✅ Route discovery com filtros
- ✅ Route detail page
- ✅ Database schema
- ✅ Mock data
- ⏳ Autenticação (futuro)
- ⏳ Submit route (futuro)
- ⏳ User profiles (futuro)
- ⏳ Maps integration (futuro)

---

## 📞 Manutenção

### Atualizações de Dependências

```bash
# Verificar atualizações
npm outdated

# Atualizar minor/patch
npm update

# Atualizar major (com cuidado)
npm install next@latest react@latest
```

### Performance Monitoring

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Bundle analysis
npm run build
npm run analyze
```

---

**Última atualização:** 6 de março de 2026  
**Versão do documento:** 1.0
