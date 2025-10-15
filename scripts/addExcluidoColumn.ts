import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carregar variáveis de ambiente do .env.example
const envPath = join(process.cwd(), '.env.example');
let supabaseUrl = '';
let supabaseKey = '';

try {
  const envContent = readFileSync(envPath, 'utf-8');
  const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
  const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

  if (urlMatch) supabaseUrl = urlMatch[1].trim();
  if (keyMatch) supabaseKey = keyMatch[1].trim();
} catch (error) {
  console.error('❌ Erro ao ler arquivo .env.example:', error);
}

// Tentar usar variáveis de ambiente se existirem
supabaseUrl = process.env.VITE_SUPABASE_URL || supabaseUrl;
supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não configuradas');
  console.error('❌ Verifique o arquivo .env.example ou defina as variáveis de ambiente');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addExcluidoColumn() {
  console.log('🔧 Adicionando coluna "excluido" na tabela Lista_de_Grupos...\n');

  try {
    // Nota: A chave anon não tem permissões para ALTER TABLE
    // Este script serve como referência. Execute o SQL manualmente no Supabase Dashboard

    console.log('⚠️  ATENÇÃO: A coluna deve ser adicionada manualmente no Supabase Dashboard');
    console.log('⚠️  Acesse: https://supabase.com/dashboard/project/_/editor\n');
    console.log('📋 Execute o seguinte SQL:\n');
    console.log('--------------------------------------------------');
    console.log('ALTER TABLE "Lista_de_Grupos"');
    console.log('ADD COLUMN IF NOT EXISTS "excluido" BOOLEAN DEFAULT false NOT NULL;');
    console.log('');
    console.log('CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_excluido ON "Lista_de_Grupos"(excluido);');
    console.log('--------------------------------------------------\n');

    // Verificar se a coluna já existe
    const { data, error } = await supabase
      .from('Lista_de_Grupos')
      .select('id, excluido')
      .limit(1);

    if (error) {
      if (error.message.includes('column') && error.message.includes('excluido')) {
        console.log('❌ Coluna "excluido" ainda não existe no banco de dados');
        console.log('⚠️  Execute o SQL acima no Supabase Dashboard\n');
        return { success: false, exists: false };
      }
      throw error;
    }

    console.log('✅ Coluna "excluido" já existe no banco de dados!');
    console.log('✅ Configuração concluída com sucesso!\n');

    return { success: true, exists: true };

  } catch (error) {
    console.error('❌ Erro ao verificar coluna:', error);
    return {
      success: false,
      exists: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Executar script
addExcluidoColumn()
  .then((result) => {
    if (result.success) {
      console.log('🎉 Processo concluído!');
      process.exit(0);
    } else if (!result.exists) {
      console.log('⚠️  Execute o SQL manualmente no Supabase Dashboard');
      process.exit(0);
    } else {
      console.error(`❌ Processo falhou: ${result.error}`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
