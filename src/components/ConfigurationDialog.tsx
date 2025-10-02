import { useState, useEffect } from "react";
import { Trash2, Edit, Plus, X, Check, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfigurationType } from "./ConfigurationMenu";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useSquads } from "@/hooks/useSquads";
import { useHeads } from "@/hooks/useHeads";
import { useGestores } from "@/hooks/useGestores";
import { useGroups } from "@/hooks/useGroups";
import { toast } from "@/components/ui/use-toast";
import { extractInviteCodeFromWhatsAppLink, validateWhatsAppLinkFormat, getInviteCodeExamples } from "@/utils/whatsappUtils";
import { getGroupInfoByInviteCode, EvolutionApiError } from "@/utils/evolutionApi";

interface ConfigurationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: ConfigurationType | null;
}

export const ConfigurationDialog = ({ open, onOpenChange, type }: ConfigurationDialogProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [newName, setNewName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number | null; name: string }>({
    open: false,
    id: null,
    name: '',
  });
  const [validationError, setValidationError] = useState<string>("");
  
  // Group-specific states
  const [whatsappLink, setWhatsappLink] = useState("");
  const [isLoadingGroupInfo, setIsLoadingGroupInfo] = useState(false);
  const [groupPreview, setGroupPreview] = useState<{
    id: string;
    subject: string;
    desc: string;
    size: number;
  } | null>(null);

  const squadsHook = useSquads();
  const headsHook = useHeads();
  const gestoresHook = useGestores();
  const groupsHook = useGroups();

  const getHookByType = () => {
    switch (type) {
      case 'squads':
        return squadsHook;
      case 'heads':
        return headsHook;
      case 'gestores':
        return gestoresHook;
      case 'groups':
        return groupsHook;
      default:
        return squadsHook;
    }
  };

  const hook = getHookByType();
  const items = type === 'squads' ? squadsHook.squads :
               type === 'heads' ? headsHook.heads :
               type === 'gestores' ? gestoresHook.gestores :
               type === 'groups' ? groupsHook.groups :
               [];

  // Limpar estado quando o dialog fechar ou type mudar
  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setEditingName("");
      setNewName("");
      setIsAdding(false);
      setValidationError("");
      setDeleteConfirm({ open: false, id: null, name: '' });
      setWhatsappLink("");
      setGroupPreview(null);
      setIsLoadingGroupInfo(false);
    }
  }, [open]);

  useEffect(() => {
    setEditingId(null);
    setEditingName("");
    setNewName("");
    setIsAdding(false);
    setValidationError("");
    setWhatsappLink("");
    setGroupPreview(null);
    setIsLoadingGroupInfo(false);
  }, [type]);

  // Função para validar nomes
  const validateName = (name: string, excludeId?: number): string => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return "Nome não pode estar vazio";
    }
    
    if (trimmedName.length < 2) {
      return "Nome deve ter pelo menos 2 caracteres";
    }
    
    if (trimmedName.length > 50) {
      return "Nome deve ter no máximo 50 caracteres";
    }
    
    // Verificar duplicatas (case insensitive)
    if (type !== 'groups') {
      const isDuplicate = items.some(item => 
        item.id !== excludeId && 
        'nome' in item && item.nome.toLowerCase() === trimmedName.toLowerCase()
      );
      
      if (isDuplicate) {
        return "Este nome já existe";
      }
    }
    
    return "";
  };

  // Group-specific functions
  const handleWhatsAppLinkChange = (value: string) => {
    setWhatsappLink(value);
    setValidationError("");
    setGroupPreview(null);
  };

  const validateAndLoadGroupInfo = async () => {
    if (!whatsappLink.trim()) {
      setValidationError("Link do WhatsApp é obrigatório");
      return;
    }

    const validation = validateWhatsAppLinkFormat(whatsappLink);
    if (!validation.isValid) {
      setValidationError(validation.error || "Link inválido");
      return;
    }

    const inviteCode = extractInviteCodeFromWhatsAppLink(whatsappLink);
    if (!inviteCode) {
      setValidationError("Não foi possível extrair código do convite");
      return;
    }

    setIsLoadingGroupInfo(true);
    setValidationError("");

    try {
      const groupInfo = await getGroupInfoByInviteCode(inviteCode);
      
      setGroupPreview({
        id: groupInfo.id,
        subject: groupInfo.subject,
        desc: groupInfo.desc,
        size: groupInfo.size,
      });
      
      toast({
        title: "Grupo encontrado!",
        description: `${groupInfo.subject} (${groupInfo.size} membros)`,
      });
    } catch (error) {
      console.error('❌ Erro completo:', error);
      
      if (error instanceof EvolutionApiError) {
        setValidationError(`Erro da API: ${error.message}`);
      } else {
        setValidationError("Erro ao buscar informações do grupo");
      }
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao buscar grupo",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGroupInfo(false);
    }
  };

  const handleAddGroup = async () => {
    if (!groupPreview) {
      setValidationError("Carregue as informações do grupo primeiro");
      return;
    }

    try {
      await groupsHook.createGroup({
        grupo: groupPreview.id, // ID do grupo do WhatsApp
        nome_grupo: groupPreview.subject, // Nome do grupo
        resumo: groupPreview.desc || null, // Descrição como resumo
        status: 'Ativo', // Status padrão
      });
      
      toast({
        title: "Sucesso!",
        description: "Grupo adicionado com sucesso.",
      });
      
      setWhatsappLink("");
      setGroupPreview(null);
      setIsAdding(false);
      setValidationError("");
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao adicionar grupo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'squads':
        return 'Gerenciar Squads';
      case 'heads':
        return 'Gerenciar Heads';
      case 'gestores':
        return 'Gerenciar Gestores';
      case 'groups':
        return 'Gerenciar Grupos';
      default:
        return '';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'squads':
        return 'Adicione, edite ou remova squads do sistema.';
      case 'heads':
        return 'Adicione, edite ou remova heads do sistema.';
      case 'gestores':
        return 'Adicione, edite ou remova gestores do sistema.';
      case 'groups':
        return 'Adicione grupos do WhatsApp via link de convite ou remova grupos existentes.';
      default:
        return '';
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'squads':
        return 'Squad';
      case 'heads':
        return 'Head';
      case 'gestores':
        return 'Gestor';
      case 'groups':
        return 'Grupo';
      default:
        return '';
    }
  };

  const handleEdit = (id: number, currentName: string) => {
    if (type === 'groups') return; // Groups não podem ser editados inline
    setEditingId(id);
    setEditingName(currentName);
    setValidationError("");
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim() || !editingId) return;
    
    const validationError = validateName(editingName, editingId);
    if (validationError) {
      setValidationError(validationError);
      return;
    }
    
    try {
      const trimmedName = editingName.trim();
      
      if (type === 'squads') {
        await squadsHook.updateSquad(editingId, { nome: trimmedName });
      } else if (type === 'heads') {
        await headsHook.updateHead(editingId, { nome: trimmedName });
      } else if (type === 'gestores') {
        await gestoresHook.updateGestor(editingId, { nome: trimmedName });
      } else if (type === 'groups') {
        await groupsHook.updateGroup(editingId, { nome_grupo: trimmedName });
      }
      
      toast({
        title: "Sucesso!",
        description: `${getTypeName()} atualizado com sucesso.`,
      });
      
      setEditingId(null);
      setEditingName("");
      setValidationError("");
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao atualizar ${getTypeName().toLowerCase()}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setValidationError("");
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteConfirm({ open: true, id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.id) return;
    
    try {
      if (type === 'squads') {
        await squadsHook.deleteSquad(deleteConfirm.id);
      } else if (type === 'heads') {
        await headsHook.deleteHead(deleteConfirm.id);
      } else if (type === 'gestores') {
        await gestoresHook.deleteGestor(deleteConfirm.id);
      } else if (type === 'groups') {
        await groupsHook.deleteGroup(deleteConfirm.id);
      }
      
      toast({
        title: "Sucesso!",
        description: `${getTypeName()} removido com sucesso.`,
      });
      
      setDeleteConfirm({ open: false, id: null, name: '' });
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao remover ${getTypeName().toLowerCase()}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleAdd = async () => {
    if (type === 'groups') {
      await handleAddGroup();
      return;
    }

    if (!newName.trim()) return;
    
    const validationError = validateName(newName);
    if (validationError) {
      setValidationError(validationError);
      return;
    }
    
    try {
      const trimmedName = newName.trim();
      
      if (type === 'squads') {
        await squadsHook.createSquad({ nome: trimmedName });
      } else if (type === 'heads') {
        await headsHook.createHead({ nome: trimmedName });
      } else if (type === 'gestores') {
        await gestoresHook.createGestor({ nome: trimmedName });
      }
      
      toast({
        title: "Sucesso!",
        description: `${getTypeName()} criado com sucesso.`,
      });
      
      setNewName("");
      setIsAdding(false);
      setValidationError("");
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao criar ${getTypeName().toLowerCase()}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewName("");
    setValidationError("");
    setWhatsappLink("");
    setGroupPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-odontoimpact-dark-card border-gray-200 dark:border-gray-600">
        <DialogHeader>
          <DialogTitle className="text-odontoimpact-dark dark:text-white font-poppins">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-odontoimpact-gray dark:text-gray-300 font-inter">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-odontoimpact-dark-bg"
            >
              {editingId === item.id ? (
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 text-odontoimpact-dark dark:text-white bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSaveEdit}
                    disabled={hook.loading || !editingName.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {hook.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    disabled={hook.loading}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="text-odontoimpact-dark dark:text-white font-inter font-medium">
                      {type === 'groups' 
                        ? ('nome_grupo' in item ? item.nome_grupo : null) || ('grupo' in item ? item.grupo : '')
                        : ('nome' in item ? item.nome : '')
                      }
                    </span>
                    {type === 'groups' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {item.id}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {type !== 'groups' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(item.id, item.nome)}
                        disabled={hook.loading || editingId !== null}
                        className="border-gray-300 dark:border-gray-600 text-odontoimpact-dark dark:text-white hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-card"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteClick(
                        item.id, 
                        type === 'groups' 
                          ? (('nome_grupo' in item ? item.nome_grupo : null) || ('grupo' in item ? item.grupo : ''))
                          : ('nome' in item ? item.nome : '')
                      )}
                      disabled={hook.loading || editingId !== null}
                      className="border-red-300 dark:border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {isAdding ? (
            type === 'groups' ? (
              <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-600 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <div className="space-y-2">
                  <Label className="text-odontoimpact-dark dark:text-white font-inter font-medium">
                    Link de Convite do WhatsApp
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={whatsappLink}
                      onChange={(e) => handleWhatsAppLinkChange(e.target.value)}
                      placeholder="https://chat.whatsapp.com/ABC123..."
                      className="flex-1 text-odontoimpact-dark dark:text-white bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600"
                    />
                    <Button 
                      size="sm" 
                      onClick={validateAndLoadGroupInfo}
                      disabled={isLoadingGroupInfo || !whatsappLink.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoadingGroupInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Carregar"}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Exemplos: {getInviteCodeExamples().slice(0, 2).join(', ')}
                  </div>
                </div>

                {groupPreview && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Informações do Grupo</h4>
                    <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                      <div><strong>Nome:</strong> {groupPreview.subject}</div>
                      <div><strong>Membros:</strong> {groupPreview.size}</div>
                      {groupPreview.desc && <div><strong>Descrição:</strong> {groupPreview.desc}</div>}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleAdd}
                    disabled={hook.loading || !groupPreview}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {hook.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                    Adicionar Grupo
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCancelAdd}
                    disabled={hook.loading}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-blue-50 dark:bg-blue-900/20">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Digite o nome..."
                  className="flex-1 text-odontoimpact-dark dark:text-white bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') handleCancelAdd();
                  }}
                  autoFocus
                />
                <Button 
                  size="sm" 
                  onClick={handleAdd}
                  disabled={hook.loading || !newName.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {hook.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleCancelAdd}
                  disabled={hook.loading}
                  className="border-gray-300 dark:border-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )
          ) : (
            <Button
              onClick={() => setIsAdding(true)}
              disabled={hook.loading || editingId !== null}
              className="w-full bg-odontoimpact-primary hover:bg-odontoimpact-primary/90 text-white border-0 rounded-md shadow-sm font-inter font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              {type === 'groups' ? 'Adicionar Grupo' : 'Adicionar Novo'}
            </Button>
          )}
        </div>
        
        {(hook.error || validationError) && (
          <div className="text-red-600 dark:text-red-400 text-sm font-inter">
            {validationError || hook.error}
          </div>
        )}
      </DialogContent>
      
      <ConfirmationDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}
        title={`Remover ${getTypeName()}`}
        description={`Tem certeza que deseja remover "${deleteConfirm.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        onConfirm={handleDeleteConfirm}
        loading={hook.loading}
      />
    </Dialog>
  );
};