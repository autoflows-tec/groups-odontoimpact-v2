import { useState } from "react";
import { Circle, X, Trash2 } from "lucide-react";
import { Database } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate, isMessageFromToday, getStatusType, formatResponseTime } from "@/utils/groupUtils";
import { EditableSelectCell } from "./EditableSelectCell";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useSquads } from "@/hooks/useSquads";
import { useHeads } from "@/hooks/useHeads";
import { useGestores } from "@/hooks/useGestores";

type Group = Database['public']['Tables']['Lista_de_Grupos']['Row'];

interface GroupsTableProps {
  groups: Group[];
  onUpdateGroup: (groupId: number, field: 'squad' | 'head' | 'gestor', value: string | null) => Promise<void>;
  onClearStatus?: (groupId: number) => Promise<void>;
  onDeleteGroup?: (groupId: number) => Promise<void>;
}

const getStatusIndicator = (status: string | null, resumo: string | null, totalMensagens?: number) => {
  const statusType = getStatusType(status, resumo, totalMensagens);
  
  switch (statusType) {
    case 'critico':
      return <Circle className="h-3 w-3 fill-red-500 text-red-500" />;
    case 'alerta':
      return <Circle className="h-3 w-3 fill-yellow-500 text-yellow-500" />;
    case 'estavel':
      return <Circle className="h-3 w-3 fill-green-500 text-green-500" />;
    case 'sem-mensagens':
      return <Circle className="h-3 w-3 fill-gray-300 text-gray-300" />;
    default:
      return <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />;
  }
};

export const GroupsTable = ({ groups, onUpdateGroup, onClearStatus, onDeleteGroup }: GroupsTableProps) => {
  // Carregar dados de configuração
  const { squads, loading: squadsLoading } = useSquads();
  const { heads, loading: headsLoading } = useHeads();
  const { gestores, loading: gestoresLoading } = useGestores();

  // Estado para o dialog de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
  const [groupToDeleteName, setGroupToDeleteName] = useState<string>("");
  const [deleting, setDeleting] = useState(false);

  const isConfigLoading = squadsLoading || headsLoading || gestoresLoading;

  const handleDeleteClick = (groupId: number, groupName: string) => {
    setGroupToDelete(groupId);
    setGroupToDeleteName(groupName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete || !onDeleteGroup) return;

    setDeleting(true);
    try {
      await onDeleteGroup(groupToDelete);
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
      setGroupToDeleteName("");
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
    } finally {
      setDeleting(false);
    }
  };
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-odontoimpact-dark-card/50">
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Nome do Grupo</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Squad</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Head</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Gestor</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Data de Última Atualização</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Tempo Médio</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Status do Grupo</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold">Situação</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold text-center w-24">Status</TableHead>
            <TableHead className="text-odontoimpact-dark dark:text-white font-poppins font-semibold text-center w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const hasMessagesToday = isMessageFromToday(group.ultima_atualizacao);
            const hasAnyMessages = group.status || group.resumo;

            return (
              <TableRow key={group.id} className="border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-odontoimpact-dark-card/50">
                <TableCell className="text-odontoimpact-dark dark:text-white font-inter font-medium">
                  {group.nome_grupo || group.grupo}
                </TableCell>
                <TableCell className="p-2">
                  <EditableSelectCell
                    value={group.squad}
                    options={squads}
                    onUpdate={(value) => onUpdateGroup(group.id, 'squad', value)}
                    placeholder="Selecionar squad..."
                    loading={isConfigLoading}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <EditableSelectCell
                    value={group.head}
                    options={heads}
                    onUpdate={(value) => onUpdateGroup(group.id, 'head', value)}
                    placeholder="Selecionar head..."
                    loading={isConfigLoading}
                  />
                </TableCell>
                <TableCell className="p-2">
                  <EditableSelectCell
                    value={group.gestor}
                    options={gestores}
                    onUpdate={(value) => onUpdateGroup(group.id, 'gestor', value)}
                    placeholder="Selecionar gestor..."
                    loading={isConfigLoading}
                  />
                </TableCell>
                <TableCell className="text-odontoimpact-gray dark:text-gray-300 font-inter">
                  {formatDate(group.ultima_atualizacao)}
                </TableCell>
                <TableCell className="text-odontoimpact-gray dark:text-gray-300 font-inter">
                  {formatResponseTime(group.tempo_medio_resposta)}
                </TableCell>
                <TableCell className="text-odontoimpact-gray dark:text-gray-300 font-inter">
                  {!hasAnyMessages
                    ? "Sem mensagens no grupo"
                    : !hasMessagesToday
                      ? "Não há mensagens hoje no grupo"
                      : (group.status || "Não informado")
                  }
                </TableCell>
                <TableCell className="text-odontoimpact-gray dark:text-gray-300 font-inter">
                  <div className="whitespace-normal break-words">
                    {!hasAnyMessages
                      ? "Sem mensagens no grupo"
                      : !hasMessagesToday
                        ? "Não há mensagens hoje no grupo"
                        : (group.resumo || "Sem descrição")
                    }
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {(() => {
                      const statusType = getStatusType(group.status, group.resumo, group.total_mensagens);
                      // Só mostra o indicador se não for "sem-mensagens"
                      if (statusType === 'sem-mensagens') return null;
                      return getStatusIndicator(group.status, group.resumo, group.total_mensagens);
                    })()}
                    {(() => {
                      const statusType = getStatusType(group.status, group.resumo, group.total_mensagens);
                      // Só mostra o botão X se tiver status válido (não for "sem-mensagens")
                      if (statusType === 'sem-mensagens') return null;
                      return onClearStatus && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onClearStatus(group.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                          title="Remover status (sem mensagens)"
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </Button>
                      );
                    })()}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {onDeleteGroup && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(group.id, group.nome_grupo || group.grupo)}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                      title="Excluir grupo"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Grupo"
        description={`Tem certeza que deseja excluir o grupo "${groupToDeleteName}"? Esta ação não poderá ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        loading={deleting}
      />
    </div>
  );
};