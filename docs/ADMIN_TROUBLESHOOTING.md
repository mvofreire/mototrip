# Troubleshooting - Painel de Admin

## Passos para Verificar

### 1. Verifique no Console do Navegador

Abra o DevTools (F12) e vá para a aba Console. Você deve ver logs como:

```
Checking if user is admin... {role: 'admin', email: '...'}
Admin status: true
Loading routes...
AdminService.getAllRoutes - Starting...
AdminService.getAllRoutes - Response: { data: [...], error: null }
Routes loaded: X [...]
```

### 2. Checklist de Requisitos

#### ✅ Migração Aplicada
Verifique se a migração `004_admin_routes_policies.sql` foi aplicada no Supabase:

```sql
-- Execute no SQL Editor do Supabase
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'is_admin';
```

Se não retornar nada, aplique a migração:
```bash
# No Supabase Dashboard > SQL Editor
# Cole o conteúdo de: supabase/migrations/004_admin_routes_policies.sql
```

#### ✅ Usuário é Admin
Verifique se seu usuário tem role admin:

```sql
SELECT id, email, role 
FROM public.profiles 
WHERE email = 'SEU_EMAIL_AQUI';
```

Se a role não for 'admin', atualize:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'SEU_EMAIL_AQUI';
```

#### ✅ Existem Rotas no Banco
```sql
SELECT COUNT(*) FROM public.routes;
```

Se retornar 0, você precisa criar algumas rotas primeiro.

#### ✅ Políticas RLS Corretas
```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'routes';
```

Deve incluir políticas como:
- "Users can view published routes"
- "Admins can view all routes"
- "Users can update their own routes"

### 3. Erros Comuns

#### Erro: "Failed to fetch routes: permission denied"
**Causa**: Políticas RLS não permitem acesso
**Solução**: Aplique a migração `004_admin_routes_policies.sql`

#### Erro: "User is not admin, redirecting to profile"
**Causa**: Usuário não tem role admin
**Solução**: Execute:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'SEU_USER_ID';
```

#### Tabela vazia mas existem rotas
**Causa**: Join com profiles falhando
**Solução**: Verifique se todos os user_ids em routes têm profile correspondente:
```sql
SELECT r.id, r.title, r.user_id, p.id as profile_id
FROM public.routes r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE p.id IS NULL;
```

### 4. Teste Manual da Query

Execute no SQL Editor do Supabase:

```sql
SELECT 
  r.*,
  p.email as user_email,
  p.full_name as user_name
FROM public.routes r
LEFT JOIN public.profiles p ON r.user_id = p.id
ORDER BY r.created_at DESC;
```

Se isso retornar dados, o problema é com o Supabase client ou autenticação.

### 5. Verificar Autenticação

No console do navegador:
```javascript
// Cole isso no console
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
console.log('Profile:', profile)

const { data: routes } = await supabase
  .from('routes')
  .select('*')
console.log('Routes:', routes)
```

### 6. Limpar Cache e Recarregar

1. Faça logout
2. Limpe o cache do navegador (Ctrl+Shift+Delete)
3. Faça login novamente
4. Acesse `/pt/profile/admin`

### 7. Verificar no Supabase Dashboard

1. Acesse o Supabase Dashboard
2. Vá em "Table Editor"
3. Selecione a tabela "routes"
4. Verifique se há dados
5. Verifique se a coluna "published" existe

## Logs de Debug

Os seguintes logs foram adicionados para ajudar no debug:

### Na página admin:
- "Checking if user is admin..."
- "Admin status: true/false"
- "Loading routes..."
- "Routes loaded: X"

### No serviço:
- "AdminService.isAdmin - Current user:"
- "AdminService.isAdmin - Profile query result:"
- "AdminService.getAllRoutes - Starting..."
- "AdminService.getAllRoutes - Response:"

## Contato com o Desenvolvedor

Se nenhum dos passos acima resolver, compartilhe:
1. Screenshot do console do navegador
2. Resultado da query de teste manual
3. Resultado da verificação de role do usuário
