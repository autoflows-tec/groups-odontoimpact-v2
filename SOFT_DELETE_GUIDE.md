# Guia de Soft Delete - Sistema de Grupos Odontoimpact

## 📋 O que é Soft Delete?

Soft Delete (exclusão lógica) é uma técnica onde os registros não são removidos fisicamente do banco de dados, mas sim marcados como "excluídos" através de uma flag booleana.

### Benefícios

✅ **Preservação de dados**: Grupos excluídos permanecem no banco
✅ **Auditoria**: Histórico completo de grupos mantido
✅ **Recuperação**: Possível reativar grupos marcando `excluido = false`
✅ **Integridade**: Evita quebra de relacionamentos com outras tabelas
✅ **Segurança**: Previne exclusões acidentais irreversíveis

## 🗄️ Estrutura do Banco de Dados

### Coluna Adicionada

```sql
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN "excluido" BOOLEAN DEFAULT false NOT NULL;
```

**Valores:**
- `false` (padrão): Grupo ativo e visível
- `true`: Grupo excluído (não aparece na listagem)

### Índice para Performance

```sql
CREATE INDEX idx_lista_de_grupos_excluido
ON "Lista_de_Grupos"(excluido);
```

## 🚀 Como Usar

### 1. Aplicar Migration no Supabase

Execute a migration SQL no Supabase Dashboard:

```bash
# Arquivo: supabase/migrations/20251205002500-add-soft-delete-column.sql
```

**Passos:**
1. Acesse: https://supabase.com/dashboard → Seu Projeto
2. SQL Editor → New Query
3. Copie o conteúdo do arquivo de migration
4. Execute (Run ou Ctrl/Cmd + Enter)

### 2. Funcionalidade na Interface

#### Excluir Grupo

1. Na tabela de grupos, clique no ícone de lixeira (🗑️) na coluna "Ações"
2. Confirme a exclusão no dialog
3. O grupo desaparece da listagem imediatamente

#### O que Acontece

```typescript
// Grupo NÃO é deletado do banco
// UPDATE em vez de DELETE
UPDATE Lista_de_Grupos
SET excluido = true
WHERE id = ?
```

### 3. Busca de Grupos (Query Automática)

O sistema já filtra automaticamente grupos excluídos:

```typescript
// useGroups.ts - fetchGroups()
const { data } = await supabase
  .from('Lista_de_Grupos')
  .select('*')
  .eq('excluido', false)  // ✅ Filtra apenas ativos
  .order('id', { ascending: false });
```

## 🔧 Desenvolvimento

### Estrutura do Código

**Hook Principal:** `src/hooks/useGroups.ts`
```typescript
// Função de soft delete
const deleteGroup = async (groupId: number) => {
  await supabase
    .from('Lista_de_Grupos')
    .update({ excluido: true })
    .eq('id', groupId);

  // Remove da UI (update otimista)
  setGroups(prevGroups =>
    prevGroups.filter(group => group.id !== groupId)
  );
};
```

**Componente de Tabela:** `src/components/GroupsTable.tsx`
- Botão de exclusão com ícone `Trash2`
- Dialog de confirmação via `ConfirmationDialog`
- Feedback visual com toast

**Componente Principal:** `src/components/GroupsPanel.tsx`
- Conecta função `deleteGroup` do hook à tabela

### Adicionar Soft Delete em Outras Tabelas

```sql
-- Template para outras tabelas
ALTER TABLE "NomeDaTabela"
ADD COLUMN "excluido" BOOLEAN DEFAULT false NOT NULL;

CREATE INDEX idx_nomedatabela_excluido
ON "NomeDaTabela"(excluido);
```

```typescript
// Template de query
const { data } = await supabase
  .from('NomeDaTabela')
  .select('*')
  .eq('excluido', false);  // Filtrar apenas ativos
```

## 🔄 Recuperar Grupos Excluídos

### Via SQL (Supabase Dashboard)

```sql
-- Ver todos os grupos excluídos
SELECT * FROM "Lista_de_Grupos"
WHERE excluido = true;

-- Reativar um grupo específico
UPDATE "Lista_de_Grupos"
SET excluido = false
WHERE id = 123;

-- Reativar múltiplos grupos
UPDATE "Lista_de_Grupos"
SET excluido = false
WHERE id IN (123, 456, 789);
```

### Via Código (Futuro)

Possível implementar uma tela de "Lixeira" para:
- Listar grupos excluídos
- Restaurar grupos
- Exclusão permanente (hard delete)

## 🤖 Integração com Automação

Se você tem automações que sincronizam grupos:

### Opção 1: Ignorar Excluídos (Recomendado)

```javascript
// Buscar apenas grupos ativos
const { data: activeGroups } = await supabase
  .from('Lista_de_Grupos')
  .select('*')
  .eq('excluido', false);

// Criar apenas se não existir ativo
const existingGroup = activeGroups.find(g => g.grupo === grupoJid);
if (!existingGroup) {
  // Criar novo grupo
}
```

### Opção 2: Reativar Automaticamente

```javascript
// Verificar se existe excluído
const { data: deletedGroup } = await supabase
  .from('Lista_de_Grupos')
  .select('*')
  .eq('grupo', grupoJid)
  .eq('excluido', true)
  .single();

if (deletedGroup) {
  // Reativar grupo
  await supabase
    .from('Lista_de_Grupos')
    .update({ excluido: false })
    .eq('id', deletedGroup.id);
} else {
  // Criar novo grupo
}
```

## 📊 Estatísticas e Relatórios

### Contar Grupos por Status

```sql
SELECT
  COUNT(*) FILTER (WHERE excluido = false) as ativos,
  COUNT(*) FILTER (WHERE excluido = true) as excluidos,
  COUNT(*) as total
FROM "Lista_de_Grupos";
```

### Grupos Excluídos por Período

```sql
SELECT *
FROM "Lista_de_Grupos"
WHERE excluido = true
  AND timestamp >= '2025-01-01'
ORDER BY timestamp DESC;
```

## 🛡️ Segurança e Boas Práticas

### ✅ Fazer

- Sempre usar `eq('excluido', false)` nas queries principais
- Adicionar índices em tabelas com soft delete
- Documentar campos de soft delete no código
- Implementar confirmação antes de excluir

### ❌ Evitar

- Hard delete (DELETE) de registros relacionados
- Esquecer de filtrar `excluido = false` nas queries
- Remover a coluna sem migração adequada
- Expor grupos excluídos em APIs públicas

## 🔍 Troubleshooting

### Grupos excluídos ainda aparecem

**Causa:** Cache do navegador
**Solução:** Limpar cache (Ctrl+Shift+R) ou fazer logout/login

### Erro: column "excluido" does not exist

**Causa:** Migration não foi executada
**Solução:** Execute o arquivo de migration no Supabase

### Grupo não é excluído

**Causa:** Permissões do Supabase (RLS)
**Solução:** Verificar Row Level Security policies

```sql
-- Verificar policies
SELECT * FROM pg_policies
WHERE tablename = 'Lista_de_Grupos';
```

## 📝 Changelog

### v1.0.0 (2025-12-05)
- ✨ Implementação inicial de soft delete
- 📝 Criação de migration SQL
- 🎨 Botão de exclusão na interface
- ✅ Dialog de confirmação
- 📚 Documentação completa

## 🔗 Arquivos Relacionados

- Migration: `supabase/migrations/20251205002500-add-soft-delete-column.sql`
- Hook: `src/hooks/useGroups.ts`
- Tabela: `src/components/GroupsTable.tsx`
- Panel: `src/components/GroupsPanel.tsx`
- Dialog: `src/components/ConfirmationDialog.tsx`
- Docs Antigo: `SOFT_DELETE_SETUP.md` (deprecated)

---

**Desenvolvido para Odontoimpact**
Sistema de Gerenciamento de Grupos WhatsApp
