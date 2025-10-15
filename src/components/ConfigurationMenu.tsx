import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ConfigurationType = 'squads' | 'heads' | 'gestores' | 'groups';

interface ConfigurationMenuProps {
  onConfigurationSelect: (type: ConfigurationType) => void;
}

export const ConfigurationMenu = ({ onConfigurationSelect }: ConfigurationMenuProps) => {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};