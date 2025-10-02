import { useState, useEffect, useRef } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  id: number;
  nome: string;
}

interface EditableSelectCellProps {
  value: string | null;
  options: SelectOption[];
  onUpdate: (value: string | null) => Promise<void>;
  placeholder?: string;
  loading?: boolean;
  className?: string;
}

export const EditableSelectCell = ({
  value,
  options,
  onUpdate,
  placeholder = "Selecione...",
  loading = false,
  className = "",
}: EditableSelectCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(value);
  const [isUpdating, setIsUpdating] = useState(false);
  const selectRef = useRef<HTMLButtonElement>(null);

  // Atualizar valor local quando prop value muda
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  // Focar no select quando entra em modo de edição
  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (loading || isUpdating) return;
    setIsEditing(true);
  };

  const handleCancel = () => {
    setSelectedValue(value);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (selectedValue === value) {
      setIsEditing(false);
      return;
    }

    try {
      setIsUpdating(true);
      await onUpdate(selectedValue);
      setIsEditing(false);
    } catch (error) {
      // Reverter para valor original em caso de erro
      setSelectedValue(value);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSelectChange = (newValue: string) => {
    // Se o valor selecionado for "null", converter para null
    setSelectedValue(newValue === "null" ? null : newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter') {
      handleSave();
    }
  };

  // Encontrar o nome da opção selecionada para exibição
  const displayValue = value ? 
    options.find(option => option.nome === value)?.nome || value : 
    "-";

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Select
          value={selectedValue || "null"}
          onValueChange={handleSelectChange}
          onOpenChange={(open) => {
            if (!open && !isUpdating) {
              // Se o select foi fechado sem salvar, salvar automaticamente
              handleSave();
            }
          }}
        >
          <SelectTrigger 
            ref={selectRef}
            className="h-8 min-w-[120px] text-odontoimpact-dark dark:text-white bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600"
            onKeyDown={handleKeyDown}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-odontoimpact-dark-card border-gray-200 dark:border-gray-600">
            <SelectItem 
              value="null"
              className="text-odontoimpact-gray dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-bg"
            >
              Nenhum
            </SelectItem>
            {options.map((option) => (
              <SelectItem 
                key={option.id} 
                value={option.nome}
                className="text-odontoimpact-dark dark:text-white hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-bg"
              >
                {option.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isUpdating}
            className="h-6 w-6 p-0 bg-green-600 hover:bg-green-700 text-white"
          >
            {isUpdating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
            className="h-6 w-6 p-0 border-gray-300 dark:border-gray-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      disabled={loading || isUpdating}
      className={`text-left hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-bg rounded px-2 py-1 transition-colors min-h-[24px] ${
        loading || isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      <span className="text-odontoimpact-gray dark:text-gray-300 font-inter">
        {isUpdating ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Atualizando...</span>
          </div>
        ) : (
          displayValue
        )}
      </span>
    </button>
  );
};