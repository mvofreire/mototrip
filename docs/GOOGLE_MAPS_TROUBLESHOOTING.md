# 🗺️ Google Maps - Troubleshooting

## ❌ Erro: AuthFailure

**Mensagem:** "A problem with your API key prevents the map from rendering correctly"

### Possíveis Causas e Soluções

#### 1. ✅ Verificar se a API Key está no `.env.local`

```bash
# Abra o arquivo
cat .env.local | grep GOOGLE_MAPS

# Deve retornar algo como:
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBxxx...
```

**Se não aparecer nada:**
```bash
# Adicione ao .env.local
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-aqui" >> .env.local

# Reinicie o servidor
npm run dev
```

---

#### 2. ✅ Verificar se as APIs estão ativadas no Google Cloud

Acesse: [Google Cloud Console - APIs](https://console.cloud.google.com/apis/library?project=mototrip-489710)

**APIs obrigatórias:**
- [ ] **Maps JavaScript API** ⭐ (principal)
- [ ] Places API
- [ ] Geocoding API
- [ ] Directions API

**Como ativar:**
1. Clique em cada API acima
2. Clique no botão **"ENABLE"** (Ativar)
3. Aguarde a ativação (pode levar 1-2 minutos)

---

#### 3. ✅ Verificar restrições da API Key

Acesse: [Credentials](https://console.cloud.google.com/apis/credentials?project=mototrip-489710)

Clique na sua API Key → **Edit API key**

**Application restrictions:**
```
☑ HTTP referrers (web sites)

Adicione:
- localhost:3000/*
- localhost:3001/*
- http://localhost:3000/*
- http://localhost:3001/*
- *.vercel.app/*
```

**⚠️ IMPORTANTE:** Para desenvolvimento local, você pode temporariamente selecionar:
```
☐ None (sem restrições)
```

**API restrictions:**
```
☑ Restrict key

Selecione:
- Maps JavaScript API ⭐
- Places API
- Geocoding API
- Directions API
```

---

#### 4. ✅ Verificar se o Billing está ativo

Acesse: [Billing](https://console.cloud.google.com/billing?project=mototrip-489710)

- O projeto **DEVE** ter billing ativado (mesmo com free tier)
- Google Maps não funciona sem billing configurado
- Você tem $200 de crédito grátis/mês

**Como ativar:**
1. Clique em "Link a billing account"
2. Adicione cartão de crédito (não será cobrado no free tier)
3. Confirme

---

#### 5. ✅ Testar a API Key manualmente

Abra o console do navegador (F12) e execute:

```javascript
// Veja qual key está sendo usada
console.log('API Key:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

// Teste direto
fetch(`https://maps.googleapis.com/maps/api/js?key=SUA_CHAVE_AQUI`)
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Erro:', e))
```

**Status esperado:** `200 OK`

Se retornar `400` ou `403`:
- API Key inválida
- APIs não ativadas
- Restrições bloqueando localhost

---

#### 6. ✅ Verificar variável de ambiente no build

```bash
# Parar o servidor (Ctrl+C)

# Limpar cache do Next.js
rm -rf .next

# Verificar se .env.local existe
ls -la .env.local

# Ver conteúdo (sem mostrar a chave completa)
cat .env.local | grep GOOGLE_MAPS

# Reiniciar
npm run dev
```

---

#### 7. ✅ Verificar se há erros no console do navegador

Abra: **F12 → Console**

Procure por erros como:

```
❌ Google Maps JavaScript API error: RefererNotAllowedMapError
→ Solução: Adicione localhost nas restrições HTTP referrers

❌ Google Maps JavaScript API error: ApiNotActivatedMapError  
→ Solução: Ative a Maps JavaScript API

❌ Google Maps JavaScript API error: InvalidKeyMapError
→ Solução: API Key incorreta

❌ Google Maps JavaScript API error: RequestDenied
→ Solução: Ative o billing no Google Cloud
```

---

## 🔧 Solução Rápida (Desenvolvimento)

Se você está com pressa e quer testar:

### 1. Remover TODAS as restrições temporariamente

[Editar API Key](https://console.cloud.google.com/apis/credentials?project=mototrip-489710)

```
Application restrictions: None
API restrictions: Don't restrict key
```

⚠️ **NÃO deixe assim em produção!**

### 2. Garantir que estas APIs estão ativas:

- ✅ [Maps JavaScript API](https://console.cloud.google.com/apis/library/maps-backend.googleapis.com?project=mototrip-489710)

### 3. Reiniciar tudo:

```bash
# Parar servidor (Ctrl+C)
rm -rf .next
npm run dev
```

### 4. Testar URL direta:

```
http://localhost:3000/pt/routes/1
```

---

## 📋 Checklist Completa

- [ ] API Key está no `.env.local`
- [ ] Variável começa com `NEXT_PUBLIC_`
- [ ] Servidor foi reiniciado após adicionar variável
- [ ] Maps JavaScript API está ativa no Google Cloud
- [ ] Billing está configurado (com cartão)
- [ ] Restrições permitem `localhost:3000`
- [ ] Cache do Next.js foi limpo (`.next` deletado)
- [ ] Console do navegador não mostra erros

---

## 🆘 Ainda não funciona?

### Opção 1: Criar nova API Key

1. [Credentials](https://console.cloud.google.com/apis/credentials?project=mototrip-489710)
2. **+ CREATE CREDENTIALS** → **API key**
3. Copie a nova key
4. **Edit API key** → **Application restrictions: None**
5. Adicione ao `.env.local`
6. Reinicie o servidor

### Opção 2: Verificar quotas

[Quotas](https://console.cloud.google.com/apis/api/maps-backend.googleapis.com/quotas?project=mototrip-489710)

Veja se não excedeu o limite de requisições.

### Opção 3: Ver logs de erro

[Logs](https://console.cloud.google.com/logs/query?project=mototrip-489710)

Filtre por:
```
resource.type="api"
protoPayload.serviceName="maps-backend.googleapis.com"
```

---

## ✅ Teste Final

Se tudo estiver OK, você deve ver:

1. **No terminal:**
```
✓ Ready in 1339ms
✓ Compiled in 122ms
```

2. **No navegador:**
```
http://localhost:3000/pt/routes/1
```
- Mapa renderizado com marcadores
- Sem erros no console
- Badge com "Key: AIzaSyBx...xxx" no canto superior direito

3. **No console do browser (F12):**
```javascript
// Sem erros vermelhos
// Requests para maps.googleapis.com com status 200
```

---

## 📞 Contatos Úteis

- [Google Maps Platform Support](https://developers.google.com/maps/support)
- [Documentação da API](https://developers.google.com/maps/documentation/javascript)
- [Stack Overflow - google-maps-api-3](https://stackoverflow.com/questions/tagged/google-maps-api-3)

---

**Última atualização:** 9 de março de 2026
