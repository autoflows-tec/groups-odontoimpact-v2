export const extractInviteCodeFromWhatsAppLink = (url: string): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    return null;
  }

  const whatsappPatterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:chat\.)?whatsapp\.com\/(?:invite\/)?([A-Za-z0-9_-]+)/i,
    /(?:https?:\/\/)?(?:www\.)?wa\.me\/(?:invite\/)?([A-Za-z0-9_-]+)/i,
    /(?:https?:\/\/)?(?:www\.)?api\.whatsapp\.com\/send\?phone=.*&text=.*&app_absent=.*&code=([A-Za-z0-9_-]+)/i
  ];

  for (const pattern of whatsappPatterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  if (/^[A-Za-z0-9_-]+$/.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return null;
};

export const validateWhatsAppLinkFormat = (url: string): { isValid: boolean; error?: string } => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL não pode estar vazia' };
  }

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.length === 0) {
    return { isValid: false, error: 'URL não pode estar vazia' };
  }

  const inviteCode = extractInviteCodeFromWhatsAppLink(trimmedUrl);
  
  if (!inviteCode) {
    return { 
      isValid: false, 
      error: 'Formato de link do WhatsApp inválido. Use um link como: https://chat.whatsapp.com/codigo' 
    };
  }

  if (inviteCode.length < 3) {
    return { 
      isValid: false, 
      error: 'Código do convite muito curto' 
    };
  }

  return { isValid: true };
};

export const getInviteCodeExamples = (): string[] => {
  return [
    'https://chat.whatsapp.com/ABC123XYZ',
    'https://www.whatsapp.com/invite/ABC123XYZ',
    'https://wa.me/ABC123XYZ',
    'ABC123XYZ'
  ];
};