import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { clearStatusWhenNoMessages } from "@/utils/groupUtils";

type Group = Database['public']['Tables']['Lista_de_Grupos']['Row'] & {
  total_mensagens?: number;
};
type GroupInsert = Database['public']['Tables']['Lista_de_Grupos']['Insert'];
type GroupUpdate = Database['public']['Tables']['Lista_de_Grupos']['Update'];

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchGroups = async () => {
    try {
      console.log('🔄 fetchGroups: Iniciando busca pelos grupos...');
      setLoading(true);
      setError(null);
      
      // Buscar grupos
      const { data: groupsData, error: supabaseError, count } = await supabase
        .from('Lista_de_Grupos')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false });

      console.log('📊 Resposta do Supabase:', { data: groupsData, error: supabaseError, count });

      if (supabaseError) {
        console.error('❌ Erro do Supabase:', supabaseError);
        throw supabaseError;
      }

      // Buscar contagem de mensagens para todos os grupos de uma vez
      const { data: messageCounts } = await supabase
        .from('Lista_de_Mensagens')
        .select('grupoJid')
        .in('grupoJid', (groupsData || []).map(g => g.grupo));

      // Criar mapa de contagem
      const messageCountMap = new Map<string, number>();
      (messageCounts || []).forEach(msg => {
        const current = messageCountMap.get(msg.grupoJid) || 0;
        messageCountMap.set(msg.grupoJid, current + 1);
      });

      // Processar grupos com contagem
      const processedGroups = (groupsData || []).map(group => ({
        ...group,
        total_mensagens: messageCountMap.get(group.grupo) || 0
      }));

      console.log('✅ Dados recebidos:', processedGroups.length, 'grupos');
      setGroups(processedGroups);
    } catch (err) {
      console.error('💥 Erro ao buscar grupos:', err);
      setError('Não foi possível carregar os grupos. Tente novamente.');
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível conectar com o banco de dados.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadGroups = async () => {
      if (mounted) {
        console.log('Loading groups...');
        await fetchGroups();
      }
    };

    loadGroups();

    // TODO: Realtime subscription temporariamente desabilitado para debug
    // const channel = supabase
    //   .channel('schema-db-changes')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: '*',
    //       schema: 'public',
    //       table: 'Lista_de_Grupos'
    //     },
    //     (payload) => {
    //       console.log('Realtime update:', payload);
    //       if (mounted) {
    //         setTimeout(() => {
    //           fetchGroups();
    //         }, 1000);
    //       }
    //     }
    //   )
    //   .subscribe();

    return () => {
      mounted = false;
      // if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return; // Previne múltiplos cliques
    
    try {
      setRefreshing(true);
      await fetchGroups();
      toast({
        title: "Dados atualizados",
        description: "Os dados dos grupos foram atualizados com sucesso.",
      });
    } catch (error) {
      // O erro já é tratado dentro de fetchGroups, então não precisa fazer nada aqui
    } finally {
      setRefreshing(false);
    }
  };

  const updateGroupField = async (
    groupId: number, 
    field: 'squad' | 'head' | 'gestor', 
    value: string | null
  ) => {
    try {
      console.log('🔧 updateGroupField:', { groupId, field, value });
      
      // Verificar se a coluna existe na tabela
      const validFields = ['squad', 'head', 'gestor'];
      if (!validFields.includes(field)) {
        throw new Error(`Campo '${field}' não é válido`);
      }

      // Update otimista na UI
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId 
            ? { ...group, [field]: value }
            : group
        )
      );

      // Update no banco de dados
      console.log('📤 Executando update no banco:', { table: 'Lista_de_Grupos', field, value, groupId });
      
      const { data, error: updateError } = await supabase
        .from('Lista_de_Grupos')
        .update({ [field]: value })
        .eq('id', groupId)
        .select();

      console.log('📥 Resposta do update:', { data, error: updateError });

      if (updateError) {
        console.error('❌ Erro no update:', updateError);
        
        // Reverter update otimista em caso de erro
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group.id === groupId 
              ? { ...group, [field]: groups.find(g => g.id === groupId)?.[field] || null }
              : group
          )
        );
        throw updateError;
      }

      // Feedback de sucesso
      const fieldNames = {
        squad: 'Squad',
        head: 'Head',
        gestor: 'Gestor'
      };

      console.log('✅ Update realizado com sucesso');
      toast({
        title: "Atualizado com sucesso!",
        description: `${fieldNames[field]} do grupo foi atualizado.`,
      });

    } catch (err) {
      console.error(`💥 Erro ao atualizar ${field}:`, err);
      toast({
        title: "Erro ao atualizar",
        description: `Não foi possível atualizar o ${field}. Tente novamente.`,
        variant: "destructive",
      });
      throw err;
    }
  };

  const createGroup = async (groupData: GroupInsert) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Criando grupo:', groupData);

      const { data, error: insertError } = await supabase
        .from('Lista_de_Grupos')
        .insert(groupData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar grupo:', insertError);
        throw insertError;
      }

      console.log('✅ Grupo criado:', data);
      
      // Atualizar lista de grupos
      setGroups(prevGroups => [data, ...prevGroups]);

      toast({
        title: "Grupo criado!",
        description: `O grupo "${groupData.nome}" foi adicionado com sucesso.`,
      });

      return data;
    } catch (err) {
      console.error('💥 Erro ao criar grupo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao criar grupo: ${errorMessage}`);
      
      toast({
        title: "Erro ao criar grupo",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (groupId: number, updates: GroupUpdate) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Atualizando grupo:', groupId, updates);

      const { data, error: updateError } = await supabase
        .from('Lista_de_Grupos')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar grupo:', updateError);
        throw updateError;
      }

      console.log('✅ Grupo atualizado:', data);
      
      // Atualizar lista de grupos
      setGroups(prevGroups => 
        prevGroups.map(group => 
          group.id === groupId ? data : group
        )
      );

      toast({
        title: "Grupo atualizado!",
        description: `O grupo foi atualizado com sucesso.`,
      });

      return data;
    } catch (err) {
      console.error('💥 Erro ao atualizar grupo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao atualizar grupo: ${errorMessage}`);
      
      toast({
        title: "Erro ao atualizar grupo",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Deletando grupo:', groupId);

      const { error: deleteError } = await supabase
        .from('Lista_de_Grupos')
        .delete()
        .eq('id', groupId);

      if (deleteError) {
        console.error('❌ Erro ao deletar grupo:', deleteError);
        throw deleteError;
      }

      console.log('✅ Grupo deletado:', groupId);
      
      // Remover da lista de grupos
      setGroups(prevGroups => 
        prevGroups.filter(group => group.id !== groupId)
      );

      toast({
        title: "Grupo removido!",
        description: `O grupo foi removido com sucesso.`,
      });

    } catch (err) {
      console.error('💥 Erro ao deletar grupo:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao deletar grupo: ${errorMessage}`);
      
      toast({
        title: "Erro ao remover grupo",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearGroupStatus = async (groupId: number) => {
    try {
      const success = await clearStatusWhenNoMessages(groupId);
      
      if (success) {
        // Atualizar estado local otimisticamente
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group.id === groupId 
              ? { ...group, status: null, resumo: 'Sem mensagens no grupo' }
              : group
          )
        );

        toast({
          title: "Status removido",
          description: "O status do grupo foi removido (sem mensagens).",
        });
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao limpar status:', err);
      toast({
        title: "Erro ao remover status",
        description: "Não foi possível remover o status do grupo.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    groups,
    loading,
    error,
    refreshing,
    fetchGroups,
    handleRefresh,
    updateGroupField,
    createGroup,
    updateGroup,
    deleteGroup,
    clearGroupStatus
  };
};