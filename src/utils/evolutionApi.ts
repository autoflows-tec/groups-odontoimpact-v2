interface EvolutionApiResponse {
  id: string;
  subject: string;
  creation: string;
  subjectOwner: string;
  subjectTime: string;
  desc: string;
  descOwner: string;
  descTime: string;
  restrict: boolean;
  announce: boolean;
  size: number;
  ephemeralDuration?: number;
  joinApprovalMode: boolean;
  membershipApprovalMode: boolean;
  participants: string[];
}

interface ApiError {
  message: string;
  statusCode?: number;
}

class EvolutionApiError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'EvolutionApiError';
    this.statusCode = statusCode;
  }
}

const getApiConfig = () => {
  const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL;
  const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
  const instance = import.meta.env.VITE_EVOLUTION_INSTANCE;

  if (!apiUrl || !apiKey || !instance) {
    throw new EvolutionApiError('Configuração da Evolution API não encontrada nas variáveis de ambiente');
  }

  return { apiUrl, apiKey, instance };
};

export const getGroupInfoByInviteCode = async (inviteCode: string): Promise<EvolutionApiResponse> => {
  const { apiUrl, apiKey, instance } = getApiConfig();
  
  try {
    const url = `${apiUrl}/group/inviteInfo/${encodeURIComponent(instance)}?inviteCode=${encodeURIComponent(inviteCode)}`;
    
    // Primeiro, tentamos com Bearer (formato mais comum)
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Se falhou com Bearer, tenta outros formatos de autenticação
    if (!response.ok && response.status === 401) {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json',
        },
      });

      // Se ainda falhou, tenta com X-API-Key
      if (!response.ok && response.status === 401) {
        response = await fetch(url, {
          method: 'GET',
          headers: {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new EvolutionApiError(
        `Erro ao buscar informações do grupo: ${response.status} - ${errorText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof EvolutionApiError) {
      throw error;
    }
    
    throw new EvolutionApiError(
      `Erro de conexão com a Evolution API: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
};

export const validateInviteCode = (inviteCode: string): boolean => {
  if (!inviteCode || typeof inviteCode !== 'string') {
    return false;
  }

  const trimmedCode = inviteCode.trim();
  
  if (trimmedCode.length === 0) {
    return false;
  }

  return true;
};

export { EvolutionApiError };
export type { EvolutionApiResponse, ApiError };