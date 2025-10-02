import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Squad = Database['public']['Tables']['Squads']['Row'];
type SquadInsert = Database['public']['Tables']['Squads']['Insert'];
type SquadUpdate = Database['public']['Tables']['Squads']['Update'];

export const useSquads = () => {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSquads = async () => {
    try {
      console.log('🔄 fetchSquads: Buscando squads...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('Squads')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      console.log('📊 Resposta Squads:', { data, error });
      
      if (error) throw error;
      setSquads(data || []);
      console.log('✅ Squads carregados:', data?.length || 0);
    } catch (err) {
      console.error('❌ Erro ao carregar squads:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar squads');
    } finally {
      setLoading(false);
    }
  };

  const createSquad = async (squadData: SquadInsert) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Squads')
        .insert(squadData)
        .select()
        .single();

      if (error) throw error;
      
      setSquads(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar squad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateSquad = async (id: number, squadData: SquadUpdate) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Squads')
        .update({ ...squadData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSquads(prev => 
        prev.map(squad => squad.id === id ? data : squad)
          .sort((a, b) => a.nome.localeCompare(b.nome))
      );
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar squad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteSquad = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('Squads')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setSquads(prev => prev.filter(squad => squad.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir squad';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  return {
    squads,
    loading,
    error,
    fetchSquads,
    createSquad,
    updateSquad,
    deleteSquad,
  };
};