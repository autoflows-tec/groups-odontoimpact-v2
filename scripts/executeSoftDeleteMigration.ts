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

supabaseUrl = process.env.VITE_SUPABASE_URL || supabaseUrl;
supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || supabaseKey;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeMigration() {
  console.log('🚀 Executando migração: Adicionar coluna "excluido"...\n');

  try {
    // Passo 1: Tentar adicionar a coluna via RPC (se existir uma função)
    // Como não temos acesso direto ao ALTER TABLE com chave anon,
    // vamos verificar se a coluna já existe

    console.log('📋 Verificando se a coluna já existe...');

    const { data: testData, error: testError } = await supabase
      .from('Lista_de_Grupos')
      .select('id, excluido')
      .limit(1);

    if (testError) {
      if (testError.message.includes('column') && testError.message.includes('excluido')) {
        console.log('❌ Coluna "excluido" ainda não existe\n');
        console.log('⚠️  A chave ANON não tem permissões para ALTER TABLE');
        console.log('⚠️  Você precisa executar o SQL manualmente no Supabase Dashboard\n');
        console.log('🔗 Acesse: https://supabase.com/dashboard/project/_/editor\n');
        console.log('📋 Execute o seguinte SQL:\n');
        console.log('--------------------------------------------------');
        console.log('ALTER TABLE "Lista_de_Grupos"');
        console.log('ADD COLUMN IF NOT EXISTS "excluido" BOOLEAN DEFAULT false NOT NULL;');
        console.log('');
        console.log('CREATE INDEX IF NOT EXISTS idx_lista_de_grupos_excluido');
        console.log('ON "Lista_de_Grupos"(excluido);');
        console.log('--------------------------------------------------\n');

        return { success: false, needsManualExecution: true };
      }
      throw testError;
    }

    console.log('✅ Coluna "excluido" já existe!\n');

    // Passo 2: Verificar se há grupos sem o campo excluido definido
    console.log('📋 Verificando grupos sem campo excluido definido...');

    const { data: allGroups, error: allError } = await supabase
      .from('Lista_de_Grupos')
      .select('id, excluido')
      .is('excluido', null);

    if (allError) {
      throw allError;
    }

    if (allGroups && allGroups.length > 0) {
      console.log(`⚠️  Encontrados ${allGroups.length} grupos com excluido = null`);
      console.log('🔄 Atualizando para false...\n');

      const { error: updateError } = await supabase
        .from('Lista_de_Grupos')
        .update({ excluido: false })
        .is('excluido', null);

      if (updateError) {
        throw updateError;
      }

      console.log(`✅ ${allGroups.length} grupos atualizados!\n`);
    } else {
      console.log('✅ Todos os grupos já têm o campo excluido definido\n');
    }

    // Passo 3: Estatísticas
    const { data: stats, error: statsError } = await supabase
      .from('Lista_de_Grupos')
      .select('excluido');

    if (statsError) {
      throw statsError;
    }

    const ativos = stats?.filter(g => !g.excluido).length || 0;
    const excluidos = stats?.filter(g => g.excluido).length || 0;

    console.log('📊 Estatísticas:');
    console.log(`   Grupos ativos: ${ativos}`);
    console.log(`   Grupos excluídos: ${excluidos}`);
    console.log(`   Total: ${ativos + excluidos}\n`);

    return {
      success: true,
      needsManualExecution: false,
      stats: { ativos, excluidos, total: ativos + excluidos }
    };

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    return {
      success: false,
      needsManualExecution: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Executar migração
executeMigration()
  .then((result) => {
    if (result.success) {
      console.log('🎉 Migração concluída com sucesso!');
      process.exit(0);
    } else if (result.needsManualExecution) {
      console.log('⚠️  Execute o SQL manualmente no Supabase Dashboard');
      process.exit(0);
    } else {
      console.error(`❌ Migração falhou: ${result.error}`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
