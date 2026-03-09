# 🚀 Quick Start Guide - Routes Generator

## 📦 Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Copiar arquivo de ambiente
cp .env.local.example .env.local

# 3. Editar .env.local com suas credenciais Supabase
# SUPABASE_URL=https://seu-projeto.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui
```

## 🗄️ Setup do Banco de Dados

```bash
# No Supabase SQL Editor, execute em ordem:

# 1. Schema principal (se ainda não executou)
supabase/schema.sql

# 2. Setup do gerador
supabase/migrations/003_routes_generator_setup.sql
```

## ✅ Validar Setup

```bash
npm run validate:routes
```

**Saída esperada:**
```
✓ System user exists: Sistema Mototrip
✓ All validations passed
```

## 🎯 Gerar Rotas

```bash
npm run generate:routes
```

**Tempo estimado:** 20-30 minutos para ~100 rotas

**Progresso:**
```
[INFO] Starting Motorcycle Routes Generator
[INFO] Processing region: Norte
[SUCCESS] Fetched 1234 road segments
[INFO] Generated route 1/25 in Norte
[SUCCESS] Saved route: Serra da Estrela Scenic Loop
...
[SUCCESS] Route Generation Complete!
[INFO] Total routes generated: 98
[INFO] Successfully saved: 95
```

## 📊 Verificar Resultados

```bash
npm run validate:routes
```

Mostrará:
- ✓ Estatísticas gerais
- ✓ Rotas por região
- ✓ Distribuição por dificuldade
- ✓ Top 5 rotas

## 🔧 Customização

### Gerar menos rotas (teste)

Edite `jobs/routes_generator.ts`:

```typescript
const TARGET_ROUTES_COUNT = 20; // Era 100
```

### Adicionar novas regiões

```typescript
const REGIONS = [
  { name: 'Norte', bbox: [41.0, -8.9, 42.2, -6.2] },
  { name: 'Sua Região', bbox: [lat_min, lon_min, lat_max, lon_max] },
];
```

## 🎉 Pronto!

Suas rotas estão agora no banco de dados e prontas para uso na aplicação.

### Visualizar no Supabase

1. Abra [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Table Editor** → **routes**
3. Filtre por `user_id = 00000000-0000-0000-0000-000000000001`

### Queries úteis

```sql
-- Ver todas as rotas geradas
SELECT title, region, difficulty, distance_km, fun_factor_score 
FROM routes 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY fun_factor_score DESC;

-- Estatísticas por região
SELECT region, COUNT(*), ROUND(AVG(fun_factor_score), 2) as avg_fun
FROM routes
WHERE user_id = '00000000-0000-0000-0000-000000000001'
GROUP BY region;

-- Top 10 rotas
SELECT title, region, fun_factor_score, distance_km
FROM routes
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY fun_factor_score DESC
LIMIT 10;
```

## 🆘 Problemas Comuns

### "Missing environment variables"
→ Configure `.env.local` corretamente

### "System user not found"
→ Execute `003_routes_generator_setup.sql`

### "Overpass API timeout"
→ Reduza `TARGET_ROUTES_COUNT` ou adicione delays

### Poucas rotas geradas
→ Normal! Nem todas as tentativas resultam em rotas válidas
→ Aumente `maxAttempts` no código

## 📚 Próximos Passos

1. ✅ Rotas geradas
2. 📸 Adicionar fotos (opcional)
3. ✏️ Revisar descrições das rotas featured
4. 🚀 Deploy da aplicação
5. 🏍️ Enjoy!

---

**Need help?** Veja a documentação completa em [jobs/README.md](README.md)
