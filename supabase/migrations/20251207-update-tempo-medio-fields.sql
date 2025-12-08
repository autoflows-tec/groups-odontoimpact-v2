-- Migration: Atualizar colunas de tempo médio de resposta
-- Data: 2025-12-07
-- Descrição: Converte tempo_medio_resposta para TEXT e adiciona status_tempo_resposta

-- 1. Criar nova coluna para status/motivo do tempo de resposta
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "status_tempo_resposta" TEXT DEFAULT NULL;

-- 2. Criar coluna temporária para tempo médio (formato string)
ALTER TABLE "Lista_de_Grupos"
ADD COLUMN IF NOT EXISTS "tempo_medio_resposta_new" TEXT DEFAULT NULL;

-- 3. Migrar dados existentes da coluna antiga (integer) para nova (text formatado)
-- Converte minutos para formato legível: "2h 30min" ou "45min"
UPDATE "Lista_de_Grupos"
SET "tempo_medio_resposta_new" =
  CASE
    WHEN "tempo_medio_resposta" IS NULL THEN NULL
    WHEN "tempo_medio_resposta" < 60 THEN "tempo_medio_resposta"::text || ' min'
    WHEN "tempo_medio_resposta" % 60 = 0 THEN ("tempo_medio_resposta" / 60)::text || ' h'
    ELSE
      (("tempo_medio_resposta" / 60)::text || ' h ' ||
      ("tempo_medio_resposta" % 60)::text || ' min')
  END
WHERE "tempo_medio_resposta" IS NOT NULL;

-- 4. Remover coluna antiga (integer)
ALTER TABLE "Lista_de_Grupos"
DROP COLUMN IF EXISTS "tempo_medio_resposta";

-- 5. Renomear coluna nova para o nome original
ALTER TABLE "Lista_de_Grupos"
RENAME COLUMN "tempo_medio_resposta_new" TO "tempo_medio_resposta";

-- 6. Adicionar comentários descritivos nas colunas
COMMENT ON COLUMN "Lista_de_Grupos"."tempo_medio_resposta"
IS 'Tempo médio de resposta formatado recebido da automação externa (ex: "2h 30min", "45min", "N/A")';

COMMENT ON COLUMN "Lista_de_Grupos"."status_tempo_resposta"
IS 'Status/motivo do cálculo de tempo de resposta da automação (ex: "Colaborador iniciou a conversa...")';

-- 7. Criar índice para melhorar performance em queries que filtram por status
CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_status_tempo
ON "Lista_de_Grupos"("status_tempo_resposta");
