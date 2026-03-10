# Sistema de Comentários - MotoTrip

## Visão Geral

Sistema completo de comentários para permitir que usuários interajam e compartilhem experiências sobre rotas de motocicleta.

## Estrutura do Banco de Dados

### Tabela `route_comments`

```sql
CREATE TABLE route_comments (
  id UUID PRIMARY KEY,
  route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT CHECK (length(content) <= 500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Índices

- `idx_route_comments_route_id` - Para buscar comentários por rota
- `idx_route_comments_user_id` - Para buscar comentários por usuário
- `idx_route_comments_created_at` - Para ordenação por data

### Row Level Security (RLS)

1. **Leitura**: Qualquer pessoa pode ler comentários de rotas publicadas
2. **Criação**: Apenas usuários autenticados podem criar comentários
3. **Atualização**: Apenas o autor pode atualizar seu próprio comentário
4. **Deleção**: Autor ou admin podem deletar comentários

## Arquitetura

### Service Layer

**Arquivo**: `lib/services/comments.service.ts`

Métodos principais:
- `getRouteComments(routeId, page, pageSize)` - Buscar comentários paginados
- `getCommentsCount(routeId)` - Contar comentários de uma rota
- `getCommentsCountForRoutes(routeIds[])` - Contar comentários de múltiplas rotas
- `createComment(routeId, content, userId)` - Criar novo comentário
- `updateComment(commentId, content, userId)` - Atualizar comentário
- `deleteComment(commentId, userId, isAdmin)` - Deletar comentário
- `canModifyComment(commentId, userId, isAdmin)` - Verificar permissões

### Componentes

**Diretório**: `components/features/comments/`

#### CommentsList
Componente principal que gerencia toda a seção de comentários:
- Exibe lista paginada de comentários
- Formulário de criação (apenas para usuários logados)
- Gerenciamento de estado e paginação
- Integração com React Query (implícito via useAuth)

#### CommentItem
Exibe um comentário individual:
- Avatar do usuário
- Nome, data e indicador de edição
- Menu de ações (editar/deletar) para autores e admins
- Modo de edição inline
- Dialog de confirmação de deleção

#### CommentForm
Formulário reutilizável para criar/editar comentários:
- Validação de comprimento (máx 500 caracteres)
- Contador de caracteres restantes
- Estados de loading e erro
- Botões de submit e cancelar

#### CommentsCount
Badge simples mostrando contador de comentários:
- Ícone + número
- Carregamento assíncrono
- Útil para cards de rota

## Funcionalidades

### ✅ Implementadas

1. **Criar Comentário**
   - Apenas usuários logados
   - Validação de conteúdo (1-500 caracteres)
   - Timestamp automático

2. **Visualizar Comentários**
   - Paginação (20 por página)
   - Ordenação por mais recentes
   - Mostra avatar, nome, data
   - Indicador de "editado"

3. **Editar Comentário**
   - Apenas autor pode editar
   - Edição inline
   - Atualiza `updated_at` automaticamente

4. **Deletar Comentário**
   - Autor ou admin podem deletar
   - Dialog de confirmação
   - Soft delete via CASCADE no banco

5. **Paginação**
   - Botões anterior/próximo
   - Indicador de página atual
   - Ajuste automático ao deletar

6. **Internacionalização**
   - Suporte para pt, en, es
   - Formatação de datas localizada (date-fns)

### Segurança

- RLS garante que apenas donos/admins podem modificar
- Validação no cliente e servidor
- Sanitização de conteúdo no banco (CHECK constraint)
- Proteção contra SQL injection (Supabase)

## Uso

### Na página de rota:

```tsx
import { CommentsList } from '@/components/features/comments'

<CommentsList routeId={route.id} locale={params.locale} />
```

### Para mostrar contador:

```tsx
import { CommentsCount } from '@/components/features/comments'

<CommentsCount routeId={route.id} />
```

## Migration

Para aplicar no Supabase:

```bash
# Execute o arquivo de migration
supabase db push
# ou
psql -d your_database -f supabase/migrations/009_route_comments.sql
```

## Melhorias Futuras

- [ ] Notificações quando alguém comenta em sua rota
- [ ] Menções de usuários (@username)
- [ ] Reações/likes em comentários
- [ ] Respostas threaded (comentários aninhados)
- [ ] Filtro de spam/conteúdo inadequado
- [ ] Busca dentro de comentários
- [ ] Export de comentários
- [ ] Moderação avançada para admins

## Dependências

- **Supabase**: Database e autenticação
- **next-intl**: Internacionalização
- **date-fns**: Formatação de datas
- **shadcn/ui**: Componentes UI
- **lucide-react**: Ícones
- **hooks/use-auth**: Autenticação customizada

## Testando

1. Rode a migration no Supabase
2. Certifique-se de ter usuários autenticados
3. Navegue para uma rota
4. Teste criar, editar e deletar comentários
5. Teste com usuário admin e usuário normal
6. Verifique paginação com 20+ comentários

## Troubleshooting

### Erro: "Comentário não encontrado"
- Verifique se o comentário existe no banco
- Verifique políticas RLS

### Erro: "Você não tem permissão"
- Usuário não está autenticado
- Tentando editar comentário de outro usuário (sem ser admin)

### Comentários não aparecem
- Verifique se a rota está com `status = 'published'`
- Verifique políticas RLS no Supabase

### Paginação não funciona
- Verifique se há mais de 20 comentários
- Check console para erros de API
