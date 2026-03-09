# Painel de Administração

## Visão Geral

O painel de administração permite que usuários com a role `admin` gerenciem todas as rotas da plataforma MotoTrip.

## Funcionalidades

### 1. Visualizar Todas as Rotas
- Veja todas as rotas criadas na plataforma, incluindo as não publicadas
- Informações exibidas: título, usuário criador, categoria, dificuldade, distância, status de publicação e destaque

### 2. Pesquisar Rotas
- Pesquise por título da rota, nome do usuário, email do usuário ou região
- Busca em tempo real

### 3. Ativar/Desativar Publicação
- Clique no ícone de olho para publicar ou despublicar uma rota
- Rotas não publicadas não aparecem para usuários comuns

### 4. Destacar Rotas
- Clique no ícone de estrela para destacar uma rota
- Rotas destacadas aparecem na seção "Featured Routes" da página inicial

### 5. Editar Rotas
- Clique no ícone de lápis para editar informações da rota:
  - Título
  - Descrição
  - Dificuldade
  - Categoria
  - Distância
  - Duração
  - Elevação
  - Região

### 6. Excluir Rotas
- Clique no ícone de lixeira para excluir uma rota
- Ação requer confirmação

## Acesso

### URL
`/{locale}/profile/admin`

Exemplos:
- `/pt/profile/admin`
- `/en/profile/admin`
- `/es/profile/admin`

### Requisitos
- Usuário deve estar autenticado
- Usuário deve ter `role = 'admin'` na tabela `profiles`

### Link no Header
Usuários admin verão um botão "Admin" com ícone de escudo no header, ao lado do perfil.

## Configurando um Usuário como Admin

### Via SQL (Supabase)
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seuemail@exemplo.com';
```

### Via Supabase Dashboard
1. Acesse o Supabase Dashboard
2. Vá para "Table Editor"
3. Selecione a tabela `profiles`
4. Encontre o usuário desejado
5. Edite o campo `role` para `admin`

## Permissões (RLS)

As políticas de Row Level Security (RLS) foram configuradas para permitir que admins:
- Vejam todas as rotas (incluindo não publicadas)
- Editem qualquer rota
- Excluam qualquer rota

As políticas estão definidas em:
`supabase/migrations/004_admin_routes_policies.sql`

## Traduções

O painel de administração está disponível em 3 idiomas:
- Português (pt)
- Inglês (en)
- Espanhol (es)

As traduções estão nos arquivos:
- `locales/pt.json` → `admin.*`
- `locales/en.json` → `admin.*`
- `locales/es.json` → `admin.*`

## Componentes

### Página Principal
`app/[locale]/profile/admin/page.tsx`

### Componentes de UI
- `components/admin/admin-routes-table.tsx` - Tabela de rotas
- `components/admin/edit-route-dialog.tsx` - Modal de edição

### Serviço
`lib/services/admin.service.ts` - Funções para gerenciar rotas

## Segurança

1. **Verificação de Autenticação**: A página verifica se o usuário está autenticado
2. **Verificação de Role**: A página verifica se o usuário tem role `admin`
3. **Redirecionamento**: Não-admins são redirecionados para `/profile`
4. **RLS no Banco**: As políticas RLS garantem segurança no nível do banco de dados

## Próximos Passos

Possíveis melhorias futuras:
- [ ] Paginação da tabela de rotas
- [ ] Filtros por categoria, dificuldade, status
- [ ] Ordenação por colunas
- [ ] Estatísticas de rotas
- [ ] Visualização de mapa na modal de edição
- [ ] Gerenciamento de usuários
- [ ] Log de ações dos admins
