-- Migration SEGURA: Atualizar colunas de tempo médio de resposta
-- Data: 2025-12-07
-- Descrição: Adiciona status_tempo_resposta e converte tempo_medio_resposta para TEXT
-- VERSÃO SEGURA: Não deleta colunas, apenas adiciona novas

-- ========================================
-- ETAPA 1: ADICIONAR NOVAS COLUNAS
-- ========================================

-- 1. Criar nova coluna para status/motivo do tempo de resposta
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "status_tempo_resposta" TEXT DEFAULT NULL;

-- 2. Criar nova coluna para tempo médio (formato string)
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "tempo_medio_resposta_string" TEXT DEFAULT NULL;

-- ========================================
-- ETAPA 2: MIGRAR DADOS EXISTENTES
-- ========================================

-- 3. Migrar dados da coluna antiga (integer) para nova (text formatado)
-- Converte minutos para formato legível: "2h 30min" ou "45min"
UPDATE "Lista_de_Grupos"
SET "tempo_medio_resposta_string" =
  CASE
    WHEN "tempo_medio_resposta" IS NULL THEN NULL
    WHEN "tempo_medio_resposta" < 60 THEN "tempo_medio_resposta"::text || ' min'
    WHEN "tempo_medio_resposta" % 60 = 0 THEN ("tempo_medio_resposta" / 60)::text || ' h'
    ELSE
      (("tempo_medio_resposta" / 60)::text || ' h ' ||
      ("tempo_medio_resposta" % 60)::text || ' min')
  END
WHERE "tempo_medio_resposta" IS NOT NULL;

-- ========================================
-- ETAPA 3: COMENTÁRIOS E ÍNDICES
-- ========================================

-- 4. Adicionar comentários descritivos nas colunas
COMMENT ON COLUMN "Lista_de_Grupos"."tempo_medio_resposta_string"
IS 'NOVA COLUNA: Tempo médio de resposta formatado da automação (ex: "2h 30min", "N/A")';

COMMENT ON COLUMN "Lista_de_Grupos"."status_tempo_resposta"
IS 'NOVA COLUNA: Status/motivo do cálculo de tempo da automação (ex: "Colaborador iniciou a conversa...")';

COMMENT ON COLUMN "Lista_de_Grupos"."tempo_medio_resposta"
IS 'COLUNA ANTIGA (integer) - Será removida em migração futura. Use tempo_medio_resposta_string';

-- 5. Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_status_tempo
ON "Lista_de_Grupos"("status_tempo_resposta");

-- ========================================
-- RESULTADO:
-- ========================================
-- Agora você tem:
-- - tempo_medio_resposta (integer) - ANTIGA, mantida por segurança
-- - tempo_medio_resposta_string (text) - NOVA, use esta
-- - status_tempo_resposta (text) - NOVA
--
-- Após validar que tudo funciona, você pode deletar
-- a coluna antiga "tempo_medio_resposta" manualmente
-- ========================================
