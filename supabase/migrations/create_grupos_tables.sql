-- Criar tabela Lista_de_Grupos
CREATE TABLE IF NOT EXISTS public."Lista_de_Grupos" (
    id SERIAL PRIMARY KEY,
    grupo TEXT NOT NULL,
    nome_grupo TEXT,
    resumo TEXT,
    status TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ultima_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela Lista_de_Mensagens
CREATE TABLE IF NOT EXISTS public."Lista_de_Mensagens" (
    id SERIAL PRIMARY KEY,
    "grupoJid" TEXT NOT NULL,
    message TEXT,
    nome TEXT,
    "remoteJid" TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security para Lista_de_Grupos
ALTER TABLE public."Lista_de_Grupos" ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público para Lista_de_Grupos
CREATE POLICY "Enable read access for all users" ON public."Lista_de_Grupos"
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public."Lista_de_Grupos"
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public."Lista_de_Grupos"
FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public."Lista_de_Grupos"
FOR DELETE USING (true);

-- Habilitar Row Level Security para Lista_de_Mensagens
ALTER TABLE public."Lista_de_Mensagens" ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso público para Lista_de_Mensagens
CREATE POLICY "Enable read access for all users" ON public."Lista_de_Mensagens"
FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public."Lista_de_Mensagens"
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public."Lista_de_Mensagens"
FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public."Lista_de_Mensagens"
FOR DELETE USING (true);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_lista_grupos_grupo ON public."Lista_de_Grupos"(grupo);
CREATE INDEX IF NOT EXISTS idx_lista_grupos_status ON public."Lista_de_Grupos"(status);
CREATE INDEX IF NOT EXISTS idx_lista_grupos_ultima_atualizacao ON public."Lista_de_Grupos"(ultima_atualizacao);

CREATE INDEX IF NOT EXISTS idx_lista_mensagens_grupojid ON public."Lista_de_Mensagens"("grupoJid");
CREATE INDEX IF NOT EXISTS idx_lista_mensagens_timestamp ON public."Lista_de_Mensagens"(timestamp); 