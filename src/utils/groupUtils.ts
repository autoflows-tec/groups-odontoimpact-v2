export const formatDate = (dateString: string | null) => {
  if (!dateString) return "Data não disponível";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString || "Data não disponível";
  }
};

export const isMessageFromToday = (dateString: string | null) => {
  if (!dateString) return false;
  
  try {
    const messageDate = new Date(dateString);
    const today = new Date();
    
    return messageDate.toDateString() === today.toDateString();
  } catch {
    return false;
  }
};

export const getStatusType = (status: string | null, resumo: string | null, totalMensagens?: number) => {
  console.log('🔍 getStatusType:', { status, resumo, totalMensagens });

  // PRIORIDADE 1: Se não há mensagens E não há análise manual, considerar sem mensagens
  if (totalMensagens === 0 && (!status || status.trim() === '') && (!resumo || resumo.trim() === '')) {
    console.log('→ Resultado: sem-mensagens (sem dados)');
    return 'sem-mensagens';
  }
  
  // PRIORIDADE 2: Se não há dados de análise (mesmo com mensagens), considerar sem dados
  if ((!status || status.trim() === '') && (!resumo || resumo.trim() === '')) {
    console.log('→ Resultado: sem-mensagens (sem análise)');
    return 'sem-mensagens';
  }
  
  const statusLower = (status || '').toLowerCase().trim();
  const resumoLower = (resumo || '').toLowerCase();
  
  // PRIORIDADE 3: CAMPO STATUS DO BANCO TEM PRECEDÊNCIA MÁXIMA
  if (statusLower) {
    console.log('📋 Analisando campo STATUS primeiro:', statusLower);
    
    // Verificar se é "sem mensagens" explicitamente no status
    if (statusLower.includes('sem mensagens') || statusLower.includes('sem mensagem')) {
      console.log('→ Resultado: sem-mensagens (campo status)');
      return 'sem-mensagens';
    }
    
    // Verificar se é crítico no campo status
    if (statusLower.includes('crítico') || statusLower.includes('critico') || 
        statusLower.includes('problema') || statusLower.includes('erro')) {
      console.log('→ Resultado: critico (campo status)');
      return 'critico';
    }
    
    // Verificar se é alerta no campo status
    if (statusLower === 'alerta' || statusLower.includes('alerta') ||
        statusLower.includes('warning') || statusLower.includes('pendência') || 
        statusLower.includes('pendencia') || statusLower.includes('dificuldade') || 
        statusLower.includes('aguardando')) {
      console.log('→ Resultado: alerta (campo status)');
      return 'alerta';
    }
    
    // Verificar se é estável no campo status  
    if (statusLower === 'estável' || statusLower === 'estavel' ||
        statusLower.includes('estável') || statusLower.includes('estavel') || 
        statusLower.includes('ativo') || statusLower.includes('ok') ||
        statusLower.includes('positivo') || statusLower.includes('bom') ||
        statusLower.includes('satisfatório') || statusLower.includes('aprovado')) {
      console.log('→ Resultado: estavel (campo status)');
      return 'estavel';
    }
  }
  
  // PRIORIDADE 4: ANÁLISE DO RESUMO (apenas se status não foi conclusivo)
  if (resumoLower) {
    console.log('📝 Analisando campo RESUMO como fallback');
    
    // Verificar se é "sem mensagens" explicitamente no resumo
    if (resumoLower.includes('sem mensagens') || resumoLower.includes('sem mensagem')) {
      console.log('→ Resultado: sem-mensagens (campo resumo)');
      return 'sem-mensagens';
    }
    
    // Verificar se é crítico no resumo
    if (resumoLower.includes('crítico') || resumoLower.includes('critico') ||
        resumoLower.includes('problema') || resumoLower.includes('erro')) {
      console.log('→ Resultado: critico (campo resumo)');
      return 'critico';
    }
    
    // Verificar se é alerta no resumo
    if (resumoLower.includes('alerta') || resumoLower.includes('warning') ||
        resumoLower.includes('pendência') || resumoLower.includes('pendencia') ||
        resumoLower.includes('dificuldade') || resumoLower.includes('aguardando')) {
      console.log('→ Resultado: alerta (campo resumo)');
      return 'alerta';
    }
    
    // Verificar se é estável no resumo
    if (resumoLower.includes('estável') || resumoLower.includes('estavel') ||
        resumoLower.includes('ativo') || resumoLower.includes('ok') ||
        resumoLower.includes('positivo') || resumoLower.includes('bom') ||
        resumoLower.includes('satisfatório') || resumoLower.includes('aprovado') ||
        resumoLower.includes('cordial') || resumoLower.includes('colaborativo') ||
        resumoLower.includes('produtivo') || resumoLower.includes('tranquilo')) {
      console.log('→ Resultado: estavel (campo resumo)');
      return 'estavel';
    }
  }
  
  // FALLBACK: Se tem conteúdo mas não corresponde a nenhuma categoria específica
  console.log('→ Resultado: estavel (fallback padrão)');
  return 'estavel';
};

export const clearStatusWhenNoMessages = async (groupId: number) => {
  const { supabase } = await import('@/integrations/supabase/client');
  
  try {
    const { error } = await supabase
      .from('Lista_de_Grupos')
      .update({ 
        status: null,
        resumo: 'Sem mensagens no grupo'
      })
      .eq('id', groupId);

    if (error) {
      console.error('Erro ao limpar status:', error);
      throw error;
    }
    
    console.log(`Status removido para o grupo ${groupId} (sem mensagens)`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do grupo:', error);
    return false;
  }
};