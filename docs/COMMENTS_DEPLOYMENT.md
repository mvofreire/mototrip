# 🗨️ Sistema de Comentários - Instalação e Deploy

## ✅ Implementação Completa

O sistema de comentários foi totalmente implementado e está pronto para uso!

## 📋 Checklist de Deploy

### 1. Executar Migration no Supabase

```bash
# Opção A: Via Supabase CLI
supabase db push

# Opção B: Via SQL Editor no Dashboard
# Copie e execute o conteúdo de: supabase/migrations/009_route_comments.sql
```

**Verifique se criou:**
- ✅ Tabela `route_comments`
- ✅ 3 índices (route_id, user_id, created_at)
- ✅ 5 políticas RLS
- ✅ Trigger de atualização automática
- ✅ Function `update_route_comments_updated_at()`

### 2. Verificar Políticas RLS

Execute no SQL Editor para testar:

```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'route_comments';

-- Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'route_comments'
);
```

### 3. Testar Permissões

```sql
-- Como usuário anônimo (deve funcionar)
SELECT * FROM route_comments LIMIT 1;

-- Como usuário autenticado (deve funcionar)
INSERT INTO route_comments (route_id, user_id, content)
VALUES ('[route-id]', auth.uid(), 'Teste de comentário');
```

### 4. Instalar Dependências (se necessário)

```bash
npm install date-fns
# ou
yarn add date-fns
# ou
pnpm add date-fns
```

Todas as outras dependências já devem estar instaladas (shadcn/ui, lucide-react, next-intl).

## 📦 Arquivos Criados

### Backend/Database
- `supabase/migrations/009_route_comments.sql` - Migration completa

### Types
- `types/database.types.ts` - Tipos da tabela route_comments
- `types/index.ts` - Tipos auxiliares (RouteCommentWithUser)

### Services
- `lib/services/comments.service.ts` - Lógica de negócio e API

### Components
- `components/features/comments/comments-list.tsx` - Lista com paginação
- `components/features/comments/comment-item.tsx` - Item individual
- `components/features/comments/comment-form.tsx` - Formulário de criação/edição
- `components/features/comments/comments-count.tsx` - Badge contador
- `components/features/comments/index.ts` - Exportações

### Translations
- `locales/pt.json` - Português (completo)
- `locales/en.json` - Inglês (completo)
- `locales/es.json` - Espanhol (completo)

### Integration
- `app/[locale]/routes/[id]/page.tsx` - Integrado na página de rota
- `components/features/routes/route-card.tsx` - Contador nos cards

### Documentation
- `docs/COMMENTS_SYSTEM.md` - Documentação técnica completa

## 🚀 Como Usar

### Na página de detalhes da rota

Já está integrado automaticamente em `/[locale]/routes/[id]`

### Para adicionar em outros lugares

```tsx
import { CommentsList } from '@/components/features/comments'

<CommentsList routeId={routeId} locale={locale} />
```

### Para mostrar contador em cards

```tsx
import { CommentsCount } from '@/components/features/comments'

<CommentsCount routeId={routeId} />
```

## 🧪 Testando Localmente

1. **Certifique-se de ter rotas no banco:**
   ```sql
   SELECT id, title FROM routes WHERE status = 'published' LIMIT 5;
   ```

2. **Crie um usuário de teste:**
   - Registre via UI: `/[locale]/auth/register`
   - Ou via Supabase Dashboard

3. **Navegue para uma rota:**
   - Vá para `/pt/routes/[route-id]`
   - Desça até a seção de comentários

4. **Teste as funcionalidades:**
   - ✅ Criar comentário (usuário logado)
   - ✅ Editar seu comentário
   - ✅ Deletar seu comentário
   - ✅ Ver comentários de outros usuários
   - ✅ Paginação (se tiver 20+ comentários)
   - ✅ Contador de comentários

## 🔐 Permissões (RLS)

### Usuários Comuns:
- ✅ Ler comentários de rotas publicadas
- ✅ Criar comentários (se autenticado)
- ✅ Editar seus próprios comentários
- ✅ Deletar seus próprios comentários
- ❌ Editar comentários de outros
- ❌ Deletar comentários de outros

### Admins:
- ✅ Todas as permissões de usuários comuns
- ✅ Deletar qualquer comentário

## 🐛 Troubleshooting

### Erro: "Comentário não encontrado"
**Causa**: Políticas RLS bloqueando acesso
**Solução**: 
```sql
-- Verifique se a rota está publicada
SELECT status FROM routes WHERE id = '[route-id]';

-- Deve retornar 'published'
```

### Erro: "Você não tem permissão"
**Causa**: Usuário não autenticado ou tentando editar comentário de outro
**Solução**: Faça login e tente editar apenas seus comentários

### Comentários não aparecem
**Causa**: RLS bloqueando ou rota não publicada
**Solução**:
```sql
-- Teste direto no SQL
SELECT * FROM route_comments WHERE route_id = '[route-id]';

-- Se não aparecer, verifique RLS
SELECT * FROM pg_policies WHERE tablename = 'route_comments';
```

### Contador mostra 0 mas há comentários
**Causa**: Componente pode estar em cache
**Solução**: Force refresh (Cmd+Shift+R) ou limpe cache do browser

## 📊 Monitoramento

### Queries úteis para monitorar:

```sql
-- Total de comentários
SELECT COUNT(*) FROM route_comments;

-- Comentários por rota
SELECT 
  r.title,
  COUNT(rc.id) as comment_count
FROM routes r
LEFT JOIN route_comments rc ON r.id = rc.route_id
GROUP BY r.id, r.title
ORDER BY comment_count DESC
LIMIT 10;

-- Usuários mais ativos
SELECT 
  p.name,
  COUNT(rc.id) as comment_count
FROM profiles p
JOIN route_comments rc ON p.id = rc.user_id
GROUP BY p.id, p.name
ORDER BY comment_count DESC
LIMIT 10;

-- Comentários recentes
SELECT 
  rc.content,
  p.name as author,
  r.title as route,
  rc.created_at
FROM route_comments rc
JOIN profiles p ON rc.user_id = p.id
JOIN routes r ON rc.route_id = r.id
ORDER BY rc.created_at DESC
LIMIT 20;
```

## 🎉 Pronto!

O sistema de comentários está completamente funcional e pronto para produção!

Para qualquer dúvida, consulte [COMMENTS_SYSTEM.md](./COMMENTS_SYSTEM.md) para documentação técnica detalhada.
