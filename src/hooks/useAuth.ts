import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  updated_at?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Circuit breaker: Se já tentou carregar muitas vezes, parar
  const loadAttempts = Number(sessionStorage.getItem('auth-load-attempts') || '0');
  const maxAttempts = 3;

  // Buscar perfil do usuário (execução independente, não bloqueia loading)
  const fetchProfile = async (userId: string) => {
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      // Timeout para fetchProfile - máximo 5 segundos
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
        // Não setProfile em caso de erro - deixar como null
        return;
      }

      console.log('✅ Profile fetched:', data?.username || data?.full_name || 'No name');
      setProfile(data);
    } catch (error) {
      console.error('💥 Critical error in fetchProfile:', error);
      // Em caso de erro, definir perfil vazio mas não quebrar app
      setProfile(null);
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // Logout
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema.",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro no logout",
        description: "Não foi possível desconectar.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // TIMEOUT DE EMERGÊNCIA: Nunca mais que 8 segundos de loading
    const emergencyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('🚨 TIMEOUT DE EMERGÊNCIA: Forçando fim do loading após 8s');
        // Marcar que houve carregamento travado para próxima vez
        sessionStorage.setItem('auth-stuck-loading', 'true');
        setLoading(false);
      }
    }, 8000);

    // DETECTAR REFRESH apenas em casos específicos de problema
    const hasAuthState = sessionStorage.getItem('auth-cleaned-on-refresh');
    const isStuckLoading = sessionStorage.getItem('auth-stuck-loading') === 'true';
    
    // Só fazer limpeza se realmente houver indicação de problema
    if (isStuckLoading) {
      console.log('🔄 CARREGAMENTO TRAVADO DETECTADO: Limpando dados corrompidos...');
      
      // Limpeza apenas das chaves problemáticas
      try {
        // Limpar apenas chaves específicas que podem causar problema
        const problematicKeys = [
          'sb-' + supabase.supabaseUrl.split('//')[1].split('.')[0] + '-auth-token',
          'supabase.auth.token'
        ];
        
        problematicKeys.forEach(key => {
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          console.log('🧹 Removendo chave problemática:', key);
        });
        
        // Reset dos estados
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        
        // Remover flag de problema
        sessionStorage.removeItem('auth-stuck-loading');
        sessionStorage.setItem('auth-cleaned-on-refresh', 'true');
        
        console.log('✅ LIMPEZA ESPECÍFICA: Dados problemáticos removidos');
        return;
        
      } catch (cleanupError) {
        console.error('Erro na limpeza:', cleanupError);
        setLoading(false);
        return;
      }
    }
    
    // Se foi limpo recentemente, não fazer nova verificação
    if (sessionStorage.getItem('auth-cleaned-on-refresh') === 'true') {
      console.log('🚫 Auth foi limpa recentemente, pulando verificação');
      sessionStorage.removeItem('auth-cleaned-on-refresh');
      setLoading(false);
      return;
    }
    
    // Circuit breaker: Se já tentou muitas vezes, desistir
    if (loadAttempts >= maxAttempts) {
      console.warn('🛑 CIRCUIT BREAKER: Muitas tentativas falhas, forçando logout');
      supabase.auth.signOut();
      setSession(null);
      setUser(null); 
      setProfile(null);
      setLoading(false);
      sessionStorage.removeItem('auth-load-attempts');
      return;
    }
    
    // Incrementar tentativas
    sessionStorage.setItem('auth-load-attempts', String(loadAttempts + 1));

    // Buscar sessão inicial apenas se não for refresh
    const getInitialSession = async () => {
      try {
        console.log('⏱️ [' + new Date().toISOString() + '] Getting initial session...');
        
        // Timeout mais curto para evitar travamento
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 3000)
        );
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
        if (!mounted) {
          console.log('🚫 Component unmounted, aborting session check');
          return;
        }
        
        if (error) {
          console.error('❌ Error getting session:', error);
          // Limpar possível sessão corrompida
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
        } else {
          console.log('✅ Session loaded:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          
          // SEPARAR: Profile carrega de forma independente (não bloquear loading)
          if (session?.user) {
            fetchProfile(session.user.id); // Sem await - executa em background
          } else {
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('💥 Critical error in getInitialSession:', error);
        // Em caso de erro crítico, limpar tudo
        if (mounted) {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          console.log('🏁 Initial session check completed, setting loading = false');
          setLoading(false);
          clearTimeout(emergencyTimeout);
          
          // Limpar flags de problema em caso de sucesso
          sessionStorage.removeItem('auth-load-attempts');
          sessionStorage.removeItem('auth-stuck-loading');
          sessionStorage.removeItem('auth-cleaned-on-refresh');
        }
      }
    };

    getInitialSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log('🚫 Auth change ignored - component unmounted');
          return;
        }
        
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id); // Sem await - não bloquear
          
          // Limpar flags de problema quando login for bem-sucedido
          sessionStorage.removeItem('auth-load-attempts');
          sessionStorage.removeItem('auth-stuck-loading');
          sessionStorage.removeItem('auth-cleaned-on-refresh');
        } else {
          setProfile(null);
        }
        
        // Garantir que loading seja false em mudanças de auth
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(emergencyTimeout);
      subscription.unsubscribe();
      console.log('🧹 useAuth cleanup completed');
    };
  }, []);

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    updateProfile,
    fetchProfile,
    isAuthenticated: !!user,
  };
};