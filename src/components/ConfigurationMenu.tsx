import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ConfigurationType = 'squads' | 'heads' | 'gestores' | 'groups';

interface ConfigurationMenuProps {
  onConfigurationSelect: (type: ConfigurationType) => void;
  onCleanInvalidStatuses?: () => void;
}

export const ConfigurationMenu = ({ onConfigurationSelect, onCleanInvalidStatuses }: ConfigurationMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-300 dark:border-gray-600 text-odontoimpact-dark dark:text-white hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-card"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-white dark:bg-odontoimpact-dark-card border-gray-200 dark:border-gray-600"
      >
        <DropdownMenuItem
          onClick={() => onConfigurationSelect('squads')}
          className="text-odontoimpact-dark dark:text-white hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-bg cursor-pointer"
        >
          Gerenciar Squads
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onConfigurationSelect('heads')}
          className="text-odontoimpact-dark dark:text-white hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-bg cursor-pointer"
        >
          Gerenciar Heads
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onConfigurationSelect('gestores')}
          className="text-odontoimpact-dark dark:text-white hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-bg cursor-pointer"
        >
          Gerenciar Gestores
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onConfigurationSelect('groups')}
          className="text-odontoimpact-dark dark:text-white hover:bg-gray-100 dark:hover:bg-odontoimpact-dark-bg cursor-pointer"
        >
          Gerenciar Grupos
        </DropdownMenuItem>
        {onCleanInvalidStatuses && (
          <>
            <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />
            <DropdownMenuItem
              onClick={onCleanInvalidStatuses}
              className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer"
            >
              🧹 Limpar Status Inválidos
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};