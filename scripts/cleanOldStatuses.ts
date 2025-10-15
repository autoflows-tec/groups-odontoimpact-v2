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

const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;

  try {
    const messageDate = new Date(dateString);
    const today = new Date();

    return messageDate.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};

async function cleanOldStatuses() {
  console.log('🧹 Iniciando limpeza de status e resumos antigos...\n');

  try {
    // 1. Buscar todos os grupos que têm status ou resumo preenchidos
    console.log('📋 Buscando grupos com status/resumo...');
    const { data: groups, error: fetchError } = await supabase
      .from('Lista_de_Grupos')
      .select('id, grupo, nome_grupo, status, resumo, ultima_atualizacao')
      .or('status.not.is.null,resumo.not.is.null');

    if (fetchError) {
      console.error('❌ Erro ao buscar grupos:', fetchError);
      throw fetchError;
    }

    if (!groups || groups.length === 0) {
      console.log('✅ Nenhum grupo com status/resumo encontrado.');
      return { success: true, cleaned: 0 };
    }

    console.log(`📊 Encontrados ${groups.length} grupos com status/resumo\n`);

    // 2. Verificar quais grupos não têm mensagens de hoje
    const groupsToClean: number[] = [];
    const groupDetails: Array<{ id: number; name: string; lastUpdate: string | null }> = [];

    for (const group of groups) {
      const hasMessagesToday = isToday(group.ultima_atualizacao);

      if (!hasMessagesToday) {
        groupsToClean.push(group.id);
        groupDetails.push({
          id: group.id,
          name: group.nome_grupo || group.grupo,
          lastUpdate: group.ultima_atualizacao
        });
        console.log(`  🗑️  ${group.nome_grupo || group.grupo}`);
        console.log(`      Última atualização: ${group.ultima_atualizacao || 'N/A'}`);
        console.log(`      Status: ${group.status || 'N/A'}`);
        console.log(`      Resumo: ${group.resumo?.substring(0, 50) || 'N/A'}...`);
        console.log('');
      }
    }

    console.log(`\n📋 Total de grupos a limpar: ${groupsToClean.length}\n`);

    if (groupsToClean.length === 0) {
      console.log('✅ Nenhum grupo precisa ser limpo.');
      return { success: true, cleaned: 0 };
    }

    // 3. Confirmar antes de limpar
    console.log('⚠️  Os status e resumos dos grupos acima serão removidos.');
    console.log('⚠️  Esta ação não pode ser desfeita.\n');

    // 4. Executar limpeza
    console.log('🔄 Limpando status e resumos...');
    const { error: updateError } = await supabase
      .from('Lista_de_Grupos')
      .update({
        status: null,
        resumo: null
      })
      .in('id', groupsToClean);

    if (updateError) {
      console.error('❌ Erro ao limpar status:', updateError);
      throw updateError;
    }

    console.log(`\n✅ ${groupsToClean.length} grupos limpos com sucesso!\n`);

    return {
      success: true,
      cleaned: groupsToClean.length,
      groups: groupDetails
    };

  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
    return {
      success: false,
      cleaned: 0,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Executar script
cleanOldStatuses()
  .then((result) => {
    if (result.success) {
      console.log(`\n🎉 Processo concluído! ${result.cleaned} grupo(s) limpo(s).`);
      process.exit(0);
    } else {
      console.error(`\n❌ Processo falhou: ${result.error}`);
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
