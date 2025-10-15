# Scripts de Manutenção

## 1. Adicionar Coluna "excluido" (OBRIGATÓRIO ANTES DE USAR SOFT DELETE)

### Passo 1: Executar SQL no Supabase

Acesse o Supabase Dashboard:
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Clique em "New Query"
5. Cole o SQL abaixo:

```sql
-- Adicionar coluna 'excluido' na tabela Lista_de_Grupos
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "excluido" BOOLEAN DEFAULT false NOT NULL;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_excluido ON "Lista_de_Grupos"(excluido);

-- Comentário na coluna
COMMENT ON COLUMN "Lista_de_Grupos"."excluido" IS 'Indica se o grupo foi excluído logicamente (soft delete). True = excluído, False = ativo';
```

6. Clique em "Run" ou pressione Ctrl/Cmd + Enter

### Passo 2: Verificar instalação

Execute o comando:
```bash
npm run add-excluido-column
```

Se aparecer "✅ Coluna 'excluido' já existe no banco de dados!", a instalação foi bem-sucedida.

### Passo 3: Atualizar tipos TypeScript

Após adicionar a coluna no banco, você precisa regenerar os tipos do Supabase:

1. Acesse https://supabase.com/dashboard/project/_/settings/api
2. Role até "Project URL" e "API Keys"
3. Execute o comando para gerar os tipos (se disponível na sua instalação)

Ou atualize manualmente o arquivo `src/integrations/supabase/types.ts` adicionando:
```typescript
excluido: boolean  // na Row
excluido?: boolean // na Insert e Update
```

---

## 2. Limpar Status Antigos

Remove status e resumos de grupos que não têm mensagens do dia atual.

```bash
npm run clean-old-statuses
```

### Quando usar:
- Executar diariamente após a automação que remove mensagens antigas
- Pode ser integrado em cron jobs ou automações

### O que faz:
- Busca grupos com status/resumo preenchidos
- Verifica se a última atualização é de hoje
- Remove status e resumo de grupos sem mensagens de hoje
- Mostra relatório detalhado

---

## Notas Importantes

### Soft Delete
- Grupos marcados como `excluido=true` NÃO aparecerão na interface
- Grupos marcados como `excluido=true` PERMANECERÃO no banco de dados
- Sua automação pode reativar grupos (definindo `excluido=false`) se encontrá-los novamente

### Hard Delete vs Soft Delete
- ❌ **Hard Delete**: Remove o registro do banco → Automação recria
- ✅ **Soft Delete**: Marca como excluído → Automação pode reativar se necessário
