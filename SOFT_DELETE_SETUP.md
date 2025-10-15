# Guia de Implementação: Soft Delete

## ⚠️ ATENÇÃO: Executar ANTES do Deploy

O soft delete foi implementado no código, mas **requer uma alteração no banco de dados**.

## Passo a Passo

### 1. Adicionar Coluna no Supabase (OBRIGATÓRIO)

Acesse o Supabase Dashboard e execute o SQL:

```sql
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "excluido" BOOLEAN DEFAULT false NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_excluido ON "Lista_de_Grupos"(excluido);

COMMENT ON COLUMN "Lista_de_Grupos"."excluido" IS 'Indica se o grupo foi excluído logicamente (soft delete). True = excluído, False = ativo';
```

**Como executar:**
1. https://supabase.com/dashboard → Seu Projeto
2. SQL Editor → New Query
3. Cole o SQL acima
4. Run (ou Ctrl/Cmd + Enter)

### 2. Verificar Instalação

```bash
npm run add-excluido-column
```

Se aparecer "✅ Coluna 'excluido' já existe", está pronto!

### 3. Deploy da Aplicação

Agora sim, faça o deploy normalmente.

## Como Funciona

### Antes (Hard Delete):
```
Usuário remove grupo → DELETE do banco → Automação recria → Loop infinito ❌
```

### Agora (Soft Delete):
```
Usuário remove grupo → UPDATE excluido=true → Grupo permanece no banco ✅
Automação encontra grupo → Pode reativar com excluido=false se necessário ✅
```

## Benefícios

✅ Grupos excluídos não aparecem na interface
✅ Grupos permanecem no banco de dados
✅ Automação não recria grupos excluídos
✅ Possível reativar grupos marcando excluido=false
✅ Histórico completo mantido

## Integração com Automação

Na sua automação diária, ao buscar grupos:

```javascript
// Opção 1: Ignorar grupos excluídos (recomendado)
const { data } = await supabase
  .from('Lista_de_Grupos')
  .select('*')
  .eq('excluido', false);

// Opção 2: Reativar grupos encontrados novamente
const { data } = await supabase
  .from('Lista_de_Grupos')
  .update({ excluido: false })
  .eq('grupo', grupoJid)
  .eq('excluido', true);
```

## Troubleshooting

### Erro: "column excluido does not exist"
→ Execute o SQL do Passo 1

### Grupos excluídos ainda aparecem
→ Limpe o cache do navegador (Ctrl+Shift+R)

### Automação recriando grupos
→ Verifique se a automação está filtrando por excluido=false
