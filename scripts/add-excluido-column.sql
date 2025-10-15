-- Adicionar coluna 'excluido' na tabela Lista_de_Grupos para soft delete
-- Execute este script no Supabase SQL Editor

-- 1. Adicionar a coluna 'excluido' com valor padrão false
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "excluido" BOOLEAN DEFAULT false NOT NULL;

-- 2. Criar índice para melhorar performance de queries que filtram por excluido
CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_excluido ON "Lista_de_Grupos"(excluido);

-- 3. Comentário na coluna para documentação
COMMENT ON COLUMN "Lista_de_Grupos"."excluido" IS 'Indica se o grupo foi excluído logicamente (soft delete). True = excluído, False = ativo';

-- 4. Verificar resultado
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'Lista_de_Grupos' AND column_name = 'excluido';
