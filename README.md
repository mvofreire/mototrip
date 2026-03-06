# MotoTrip 🏍️

A production-grade web platform for discovering and sharing motorcycle riding routes. Built with modern technologies and optimized for performance.

![MotoTrip Banner](https://via.placeholder.com/1200x400/FCD34D/1C1917?text=MotoTrip)

## 🌟 Features

- **Route Discovery**: Search and filter motorcycle routes by category, difficulty, distance, and more
- **Interactive Maps**: Visualize routes with integrated mapping (Google Maps/Mapbox)
- **Community Ratings**: Rate routes on scenery, road quality, and fun factor
- **Recommended Stops**: Discover viewpoints, cafés, and landmarks along each route
- **User Profiles**: Track contributed and saved routes
- **Responsive Design**: Optimized for all devices with excellent Web Vitals
- **🌍 Multilingual**: Support for English, Portuguese, and Spanish

## 🎨 Design Philosophy

MotoTrip features a modern, clean interface with a "sunshine" color palette evoking adventure and freedom:
- **Primary Colors**: Yellow, Orange, Pink, Coral
- **Neutrals**: Warm grays and sand tones
- **Inspiration**: Vercel, Linear, Stripe, Apple Maps

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui (Radix primitives)
- **State Management**: TanStack Query
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Maps**: Google Maps API / Mapbox
- **I18n**: next-intl (English, Portuguese, Spanish)
- **Deployment**: Vercel

## 📦 Project Structure

```
mototrip/
├── app/
│   ├── [locale]/          # Internationalized routes
│   │   ├── layout.tsx     # Layout with i18n
│   │   ├── page.tsx       # Landing page
│   │   ├── explore/       # Route discovery
│   │   └── routes/[id]/   # Route details
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── features/          # Feature components
│   │   └── routes/        # Route-specific
│   ├── layout/            # Header, Footer
│   ├── language-switcher.tsx  # Language selector
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── services/          # API layer
│   ├── supabase/          # Supabase client
│   ├── utils.ts           # Utilities
│   └── mock-data.ts       # Sample data
├── locales/               # Translation files
│   ├── en.json            # English
│   ├── pt.json            # Portuguese
│   └── es.json            # Spanish
├── types/                 # TypeScript types
├── supabase/              # Database schema
├── i18n.ts                # i18n config
├── middleware.ts          # Locale detection
└── public/                # Static assets
```

## 🚀 Como Rodar a Aplicação

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.17+ ou superior, incluindo Node.js 23 ([Download](https://nodejs.org/))
- **Yarn** 4.x ([Instalação](https://yarnpkg.com/getting-started/install))
- **Git** para clonar o repositório
- Uma conta no **Supabase** ([Criar conta gratuita](https://supabase.com))
- _(Opcional)_ Chave de API do **Google Maps** ou **Mapbox**

> **⚠️ Importante:** Este projeto usa **Yarn 4** como package manager. Não use npm ou pnpm.
> 
> **✅ Compatibilidade:** Testado com Node.js 18, 20, 22 e 23.

### Instalação Completa

#### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/seu-usuario/mototrip.git
cd mototrip
```

#### 2️⃣ Instale as Dependências

Este projeto usa **Yarn 4** (Yarn Modern):

```bash
# Habilite o Corepack (vem com Node.js 16.10+)
corepack enable

# Configure o Yarn 4 no projeto
corepack prepare yarn@4.1.1 --activate

# Instale as dependências
yarn install
```

**Tempo estimado:** 2-3 minutos

> **💡 Nota:** O comando `corepack prepare` instala o Yarn 4 automaticamente na versão especificada no `package.json`.

#### 3️⃣ Configure o Supabase

##### 3.1. Crie um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Preencha os dados:
   - **Name:** MotoTrip (ou outro nome)
   - **Database Password:** Escolha uma senha forte
   - **Region:** Escolha a região mais próxima
4. Aguarde a criação do projeto (~2 minutos)

##### 3.2. Execute o Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de terminal no menu lateral)
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase/schema.sql` deste projeto
4. Cole no editor SQL
5. Clique em **"Run"** ou pressione `Ctrl+Enter` (ou `Cmd+Enter` no Mac)
6. Aguarde a confirmação de sucesso ✅

##### 3.3. (Opcional) Adicione Dados de Exemplo

Se quiser começar com dados de teste:

1. No SQL Editor, crie uma nova query
2. Copie o conteúdo do arquivo `supabase/seed.sql`
3. **IMPORTANTE:** Substitua `'YOUR_USER_ID_HERE'` pelo ID de um usuário real:
   - Vá em **Authentication** → **Users**
   - Se não houver usuários, crie um teste em **Add user** → **Create new user**
   - Copie o UUID do usuário
   - Cole no lugar de `'YOUR_USER_ID_HERE'` no SQL
4. Execute a query

##### 3.4. Obtenha as Credenciais

1. No dashboard, vá em **Settings** → **API**
2. Copie os seguintes valores:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (chave que começa com `eyJ...`)

#### 4️⃣ Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# No terminal (Linux/Mac)
touch .env.local

# Ou no Windows
type nul > .env.local
```

Abra o arquivo `.env.local` e adicione:

```env
# Supabase (OBRIGATÓRIO)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# Google Maps (OPCIONAL - para mapas interativos)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_chave_google_maps
```

**⚠️ Importante:**
- Substitua os valores de exemplo pelas suas credenciais reais
- Nunca commite o arquivo `.env.local` no Git (já está no `.gitignore`)
- Veja o arquivo `.env.example` para referência

#### 5️⃣ Inicie o Servidor de Desenvolvimento

```bash
npm run dev
yar

Você verá algo como:

```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

#### 6️⃣ Acesse a Aplicação

Abra seu navegador em:

🌐 **[http://localhost:3000](http://localhost:3000)**

Você deve ver a landing page do MotoTrip! 🎉

#### 🌍 Idiomas Disponíveis

A aplicação detecta automaticamente o idioma do navegador e redireciona para:

- 🇺🇸 **Inglês**: [http://localhost:3000/en](http://localhost:3000/en)
- 🇧🇷 **Português**: [http://localhost:3000/pt](http://localhost:3000/pt)
- 🇪🇸 **Espanhol**: [http://localhost:3000/es](http://localhost:3000/es)

Use o seletor de idioma no header para alternar entre eles.

---

### 🔧 Comandos Disponíveis

```bash
# Iniciar servidor de desenvolvimento
yarn dev

# Criar build de produção
yarn build

# Iniciar servidor de produção
yarn start

# Executar linter
yarn lint

# Verificar tipos TypeScript
yarn type-check
```

---

### ✅ Verificação da Instalação

Confira se tudo está funcionando:

- [ ] Landing page carrega em `http://localhost:3000`
- [ ] Página de exploração funciona em `/explore`
- [ ] Filtros de rota respondem corretamente
- [ ] Página de detalhes da rota abre em `/routes/[id]`
- [ ] Console do navegador não mostra erros críticos

---

### 🐛 Solução de Problemas Comuns

#### Erro: "Module not found"
```bash
# Limpe node_modules e reinstale
rm -rf node_modules yarn.lock .yarn/cache
yarn install
```

#### Erro: "Yarn command not found"
```bash
# Configure o Yarn no projeto
corepack prepare yarn@4.1.1 --activate
```

#### Erro: "ENOENT: no such file or directory, stat '.yarn/releases/yarn-4.1.1.cjs'"
```bash
# Configure o Yarn corretamente
corepack prepare yarn@4.1.1 --activate
yarn install
```

# Ou instale o Yarn globalmente
npm install -g yarn
```
yarn dev
#### Erro: "Supabase client error"
- Verifique se as variáveis `NEXT_PUBLIC_SUPABASE_*` estão corretas no `.env.local`
- Certifique-se de que o projeto Supabase está ativo
- Reinicie o servidor de desenvolvimento após alterar `.env.local`
yarn dev` está rodando sem erros
- Limpe o cache: `rm -rf .next` e rode `yar
```bash
# Use outra porta
npm run dev -- -p 3001
```
yarn type-check

# Se persistir, delete .next e rebuilde
rm -rf .next
yare o cache: `rm -rf .next` e rode `npm run dev` novamente

#### TypeScript errors
```bash
# Verifique os tipos
npm run type-check

# Se persistir, delete .next e rebuilde
rm -rf .next
npm run dev
```

---

### 📱 Testando em Dispositivos Móveis

1. Certifique-se de que seu computador e celular estão na mesma rede Wi-Fi
2. No terminal, note o endereço **Network** (ex: `http://192.168.1.5:3000`)
3. Acesse esse endereço no navegador do celular

---

### 🚢 Deploy em Produção

#### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Acesse [vercel.com](https://vercel.com) e faça login
3. Clique em "New Project"
4. Importe o repositório do GitHub
5. Configure as variáveis de ambiente:
   - Adicione `NEXT_PUBLIC_SUPABASE_URL`
   - Adicione `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Adicione `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (se tiver)
6. Clique em "Deploy"

**Deploy automático:** Cada push na branch `main` fará deploy automaticamente!

#### Outras Opções

- **Netlify:** Similar ao Vercel
- **Railway:** Para full-stack apps
- **Docker:** Use o Dockerfile (a ser criado)

---
yarn global add
### 🗄️ Backup do Banco de Dados

Para fazer backup do seu banco Supabase:

1. Vá em **Database** → **Backups** no dashboard
2. Ou exporte via SQL:
   ```bash
   # Instale Supabase CLI
   npm install -g supabase

   # Faça login
   supabase login

   # Export
   supabase db dump -f backup.sql
   ```

## 📊 Database Schema

### Core Tables

- **users**: User profiles and authentication
- **routes**: Motorcycle routes with metadata
- **route_stops**: Points of interest along routes
- **route_photos**: User-uploaded photos
- **route_ratings**: Community ratings and reviews
- **saved_routes**: Users' saved favorite routes

### Key Features

- Row Level Security (RLS) enabled on all tables
- Automatic score calculation on new ratings
- Indexed for optimal query performance
- Full-text search support

## 🎯 Performance Optimization

The platform is built with performance in mind:

- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Minimal JS Bundle**: Tree-shaking and optimization
- **Server Components**: Leveraging React Server Components
- **Caching**: TanStack Query for efficient data fetching

**Target Lighthouse Scores**: 95+ across all metrics

## 🗺️ Implementing Maps

The map component is currently a placeholder. To integrate Google Maps:

1. **Install the package**
   ```bash
   npm install @vis.gl/react-google-maps
   ```

2. **Update the RouteMap component** in `components/features/routes/route-map.tsx`

3. **Add your API key** to environment variables

See the [Google Maps documentation](https://developers.google.com/maps) for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspiration from Vercel, Linear, and Stripe
- Community of motorcycle enthusiasts
- Open source libraries and tools

## 📞 Contact

For questions or feedback, please open an issue or contact the maintainers.

---

**Built with ❤️ for the riding community**