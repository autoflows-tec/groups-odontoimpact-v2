import { Search, Filter, TrendingUp, AlertTriangle, XCircle, List, Users, UserCheck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSquads } from "@/hooks/useSquads";
import { useHeads } from "@/hooks/useHeads";
import { useGestores } from "@/hooks/useGestores";

type StatusFilter = 'todos' | 'estavel' | 'alerta' | 'critico' | 'sem-mensagens';

export interface ManagementFilters {
  squad: string;
  head: string; 
  gestor: string;
}

interface GroupsSearchProps {
  searchTerm: string;
  statusFilter: StatusFilter;
  managementFilters: ManagementFilters;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onManagementFiltersChange: (filters: ManagementFilters) => void;
  totalGroups: number;
}

const getStatusIcon = (status: StatusFilter) => {
  switch (status) {
    case 'estavel':
      return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'alerta':
      return <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
    case 'critico':
      return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
    case 'sem-mensagens':
      return <List className="h-4 w-4 text-gray-500 dark:text-gray-400" />;
    default:
      return <Filter className="h-4 w-4 text-odontoimpact-gray dark:text-gray-400" />;
  }
};

const getStatusLabel = (status: StatusFilter) => {
  switch (status) {
    case 'estavel':
      return 'Estáveis';
    case 'alerta':
      return 'Em Alerta';
    case 'critico':
      return 'Críticos';
    case 'sem-mensagens':
      return 'Sem Mensagens';
    default:
      return 'Todos os Status';
  }
};

export const GroupsSearch = ({ 
  searchTerm, 
  statusFilter, 
  managementFilters,
  onSearchChange, 
  onStatusFilterChange, 
  onManagementFiltersChange,
  totalGroups 
}: GroupsSearchProps) => {
  // Carregar dados de configuração para os filtros
  const { squads, loading: squadsLoading } = useSquads();
  const { heads, loading: headsLoading } = useHeads();
  const { gestores, loading: gestoresLoading } = useGestores();

  const handleManagementFilterChange = (field: keyof ManagementFilters, value: string) => {
    onManagementFiltersChange({
      ...managementFilters,
      [field]: value
    });
  };

  return (
    <Card className="mb-6 bg-white dark:bg-odontoimpact-dark-card border-2 border-gray-200 dark:border-gray-600 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Primeira linha: Busca e Status */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca por nome */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-odontoimpact-gray dark:text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar grupos por nome..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 border-gray-300 dark:border-gray-600 bg-white dark:bg-odontoimpact-dark-card text-odontoimpact-dark dark:text-white placeholder:text-odontoimpact-gray dark:placeholder:text-gray-400 focus:border-odontoimpact-primary focus:ring-shark-primary font-inter"
              />
            </div>

            {/* Filtro por status */}
            <div className="lg:w-48">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-odontoimpact-dark-card text-odontoimpact-dark dark:text-white focus:border-odontoimpact-primary focus:ring-shark-primary font-inter">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(statusFilter)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600">
                  <SelectItem value="todos" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-odontoimpact-gray dark:text-gray-400" />
                      {getStatusLabel('todos')}
                    </div>
                  </SelectItem>
                  <SelectItem value="estavel" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                      {getStatusLabel('estavel')}
                    </div>
                  </SelectItem>
                  <SelectItem value="alerta" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      {getStatusLabel('alerta')}
                    </div>
                  </SelectItem>
                  <SelectItem value="critico" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      {getStatusLabel('critico')}
                    </div>
                  </SelectItem>
                  <SelectItem value="sem-mensagens" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <List className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      {getStatusLabel('sem-mensagens')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center text-sm text-odontoimpact-dark dark:text-white font-inter lg:min-w-fit">
              <span className="font-medium">{totalGroups}</span> grupos encontrados
            </div>
          </div>

          {/* Segunda linha: Filtros de Gestão */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filtro por Squad */}
            <div className="flex-1 lg:max-w-xs">
              <Select 
                value={managementFilters.squad || "todos"} 
                onValueChange={(value) => handleManagementFilterChange('squad', value === 'todos' ? '' : value)}
                disabled={squadsLoading}
              >
                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-odontoimpact-dark-card text-odontoimpact-dark dark:text-white focus:border-odontoimpact-primary focus:ring-shark-primary font-inter">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-odontoimpact-primary" />
                    <SelectValue placeholder="Todos os Squads" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600">
                  <SelectItem value="todos" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-odontoimpact-gray dark:text-gray-400" />
                      Todos os Squads
                    </div>
                  </SelectItem>
                  {squads.map((squad) => (
                    <SelectItem key={squad.id} value={squad.nome} className="text-odontoimpact-dark dark:text-white font-inter">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-odontoimpact-primary" />
                        {squad.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Head */}
            <div className="flex-1 lg:max-w-xs">
              <Select 
                value={managementFilters.head || "todos"} 
                onValueChange={(value) => handleManagementFilterChange('head', value === 'todos' ? '' : value)}
                disabled={headsLoading}
              >
                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-odontoimpact-dark-card text-odontoimpact-dark dark:text-white focus:border-odontoimpact-primary focus:ring-shark-primary font-inter">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-odontoimpact-primary" />
                    <SelectValue placeholder="Todos os Heads" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600">
                  <SelectItem value="todos" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-odontoimpact-gray dark:text-gray-400" />
                      Todos os Heads
                    </div>
                  </SelectItem>
                  {heads.map((head) => (
                    <SelectItem key={head.id} value={head.nome} className="text-odontoimpact-dark dark:text-white font-inter">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-odontoimpact-primary" />
                        {head.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Gestor */}
            <div className="flex-1 lg:max-w-xs">
              <Select 
                value={managementFilters.gestor || "todos"} 
                onValueChange={(value) => handleManagementFilterChange('gestor', value === 'todos' ? '' : value)}
                disabled={gestoresLoading}
              >
                <SelectTrigger className="border-gray-300 dark:border-gray-600 bg-white dark:bg-odontoimpact-dark-card text-odontoimpact-dark dark:text-white focus:border-odontoimpact-primary focus:ring-shark-primary font-inter">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-odontoimpact-primary" />
                    <SelectValue placeholder="Todos os Gestores" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-odontoimpact-dark-card border-gray-300 dark:border-gray-600">
                  <SelectItem value="todos" className="text-odontoimpact-dark dark:text-white font-inter">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-odontoimpact-gray dark:text-gray-400" />
                      Todos os Gestores
                    </div>
                  </SelectItem>
                  {gestores.map((gestor) => (
                    <SelectItem key={gestor.id} value={gestor.nome} className="text-odontoimpact-dark dark:text-white font-inter">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-odontoimpact-primary" />
                        {gestor.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};