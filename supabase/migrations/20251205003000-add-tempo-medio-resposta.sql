-- Migration: Adicionar coluna tempo_medio_resposta
-- Data: 2025-12-05
-- Descrição: Adiciona métrica de tempo médio de resposta (em minutos)

-- Adicionar coluna tempo_medio_resposta (em minutos, aceita NULL)
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "tempo_medio_resposta" INTEGER DEFAULT NULL;

-- Criar índice para melhor performance em queries que ordenam por tempo de resposta
CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_tempo_medio_resposta
ON "Lista_de_Grupos"(tempo_medio_resposta);

-- Adicionar comentário descritivo na coluna
COMMENT ON COLUMN "Lista_de_Grupos"."tempo_medio_resposta"
IS 'Tempo médio de resposta do grupo em minutos. Calculado externamente. NULL quando não há dados disponíveis.';
