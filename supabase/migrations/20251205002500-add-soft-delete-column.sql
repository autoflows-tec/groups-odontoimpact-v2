-- Migration: Adicionar coluna excluido para soft delete
-- Data: 2025-12-05
-- Descrição: Implementa soft delete na tabela Lista_de_Grupos

-- Adicionar coluna excluido com valor padrão false
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "excluido" BOOLEAN DEFAULT false NOT NULL;

-- Criar índice para melhor performance em queries que filtram por excluido
CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_excluido
ON "Lista_de_Grupos"(excluido);

-- Adicionar comentário descritivo na coluna
COMMENT ON COLUMN "Lista_de_Grupos"."excluido"
IS 'Indica se o grupo foi excluído logicamente (soft delete). True = excluído, False = ativo';

-- Garantir que grupos existentes não estejam marcados como excluídos
UPDATE "Lista_de_Grupos"
SET excluido = false
WHERE excluido IS NULL;
