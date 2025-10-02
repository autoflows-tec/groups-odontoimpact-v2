import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Head = Database['public']['Tables']['Heads']['Row'];
type HeadInsert = Database['public']['Tables']['Heads']['Insert'];
type HeadUpdate = Database['public']['Tables']['Heads']['Update'];

export const useHeads = () => {
  const [heads, setHeads] = useState<Head[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHeads = async () => {
    try {
      console.log('🔄 fetchHeads: Buscando heads...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('Heads')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      console.log('📊 Resposta Heads:', { data, error });
      
      if (error) throw error;
      setHeads(data || []);
      console.log('✅ Heads carregados:', data?.length || 0);
    } catch (err) {
      console.error('❌ Erro ao carregar heads:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar heads');
    } finally {
      setLoading(false);
    }
  };

  const createHead = async (headData: HeadInsert) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Heads')
        .insert(headData)
        .select()
        .single();

      if (error) throw error;
      
      setHeads(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar head';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateHead = async (id: number, headData: HeadUpdate) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('Heads')
        .update({ ...headData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setHeads(prev => 
        prev.map(head => head.id === id ? data : head)
          .sort((a, b) => a.nome.localeCompare(b.nome))
      );
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar head';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteHead = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('Heads')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setHeads(prev => prev.filter(head => head.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir head';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeads();
  }, []);

  return {
    heads,
    loading,
    error,
    fetchHeads,
    createHead,
    updateHead,
    deleteHead,
  };
};