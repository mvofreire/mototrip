# 🌍 Internacionalização Implementada

## Resumo

I18n implementado usando **next-intl** com suporte a 3 idiomas:
- 🇺🇸 **Inglês (en)** - Padrão
- 🇧🇷 **Português (pt)**
- 🇪🇸 **Espanhol (es)**

## Estrutura de URLs

Todas as rotas agora incluem prefixo de idioma:

```
/en/                # Landing page em inglês
/pt/explore         # Explorar em português  
/es/routes/123      # Detalhes de rota em espanhol
```

## Arquivos Criados

### Configuração

- **`i18n.ts`** - Configuração central do next-intl
- **`middleware.ts`** - Detecção automática de locale
- **`locales/en.json`** - Traduções em inglês (completo)
- **`locales/pt.json`** - Traduções em português (completo)
- **`locales/es.json`** - Traduções em espanhol (completo)

### Componentes

- **`components/language-switcher.tsx`** - Seletor de idioma (dropdown no header)

## Arquivos Modificados

### Estrutura da Aplicação

- **`app/layout.tsx`** - Simplificado para root layout
- **`app/page.tsx`** - Redirect para locale padrão
- **`app/[locale]/layout.tsx`** - Layout com providers e i18n
- **`app/[locale]/page.tsx`** - Landing page traduzida
- **`app/[locale]/explore/page.tsx`** - Página de exploração traduzida
- **`app/[locale]/not-found.tsx`** - 404 traduzido

### Componentes

- **`components/layout/header.tsx`** - Navegação traduzida + seletor de idioma
- **`components/features/routes/route-card.tsx`** - Categorias e dificuldades traduzidas

### Configuração

- **`package.json`** - Adicionado `next-intl@^3.9.0`
- **`next.config.js`** - Integrado plugin next-intl
- **`DEVELOPMENT.md`** - Adicionada seção completa sobre i18n

## Como Usar

### Em Server Components

```typescript
import { getTranslations } from 'next-intl/server'

export default async function Page({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'home' })
  return <h1>{t('hero.title')}</h1>
}
```

### Em Client Components

```typescript
'use client'
import { useTranslations } from 'next-intl'

export function Component() {
  const t = useTranslations('nav')
  return <button>{t('exploreRoutes')}</button>
}
```

### Em Links

Sempre prefixe com locale:

```typescript
import { useLocale } from 'next-intl'

const locale = useLocale()
<Link href={`/${locale}/explore`}>Explorar</Link>
```

## Traduções Implementadas

### Namespaces

- **`common`** - Textos comuns (Loading, Error, Save, etc)
- **`nav`** - Navegação do header
- **`home`** - Landing page (hero, stats, CTA)
- **`explore`** - Página de exploração
- **`filters`** - Filtros de rotas
- **`categories`** - Categorias de rotas
- **`difficulty`** - Níveis de dificuldade
- **`route`** - Detalhes de rota
- **`stopTypes`** - Tipos de paradas
- **`ratings`** - Sistema de avaliação
- **`footer`** - Rodapé
- **`notFound`** - Página 404

### Interpolação de Variáveis

Exemplo com contador:

```json
{
  "explore": {
    "subtitle": "Descubra sua próxima aventura entre {count} rotas"
  }
}
```

```typescript
t('explore.subtitle', { count: 123 })
// Output: "Descubra sua próxima aventura entre 123 rotas"
```

## Funcionalidades

✅ **Detecção Automática** - Middleware detecta idioma do navegador  
✅ **URLs Localizadas** - Todas as rotas incluem prefixo de idioma  
✅ **Troca de Idioma** - Dropdown no header mantém rota atual  
✅ **SEO Otimizado** - Metadados traduzidos por idioma  
✅ **Type-Safe** - TypeScript infere namespaces e chaves  
✅ **Server & Client** - Funciona em ambos tipos de componentes

## Próximos Passos (Opcional)

Para expandir o i18n:

1. **Traduzir Footer** - Adicionar traduções aos links do rodapé
2. **Traduzir Filtros** - Labels dos filtros na sidebar
3. **Datas Localizadas** - Usar Intl.DateTimeFormat
4. **Números Localizados** - Usar Intl.NumberFormat  
5. **Adicionar Mais Idiomas** - Francês, Alemão, Italiano, etc.

## Testing

Servidor de desenvolvimento rodando em: **http://localhost:3000**

Teste os idiomas:
- http://localhost:3000/en
- http://localhost:3000/pt
- http://localhost:3000/es

## Referência

Documentação completa em **`DEVELOPMENT.md`** seção "🌍 Internacionalização"
