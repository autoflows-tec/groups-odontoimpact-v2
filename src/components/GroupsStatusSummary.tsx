import { Circle, TrendingUp, AlertTriangle, XCircle, MessageCircleOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatusFilter = 'todos' | 'estavel' | 'alerta' | 'critico' | 'sem-mensagens' | 'sem-interacao';

interface StatusSummary {
  estavel: number;
  alerta: number;
  critico: number;
  semInteracao?: number;
}

interface GroupsStatusSummaryProps {
  statusSummary: StatusSummary;
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
}

export const GroupsStatusSummary = ({ statusSummary, activeFilter, onFilterChange }: GroupsStatusSummaryProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Estável */}
      <Card 
        className={cn(
          "bg-white dark:bg-odontoimpact-dark-card border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md",
          activeFilter === 'estavel' 
            ? "border-green-500 dark:border-green-400 ring-2 ring-green-200 dark:ring-green-800" 
            : "border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600"
        )}
        onClick={() => onFilterChange(activeFilter === 'estavel' ? 'todos' : 'estavel')}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-md transition-colors duration-200",
              activeFilter === 'estavel' 
                ? "bg-green-200 dark:bg-green-800/50" 
                : "bg-green-100 dark:bg-green-900/30"
            )}>
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-inter text-odontoimpact-gray dark:text-gray-300">Grupos Estáveis</p>
              <p className="text-2xl font-poppins font-semibold text-green-600 dark:text-green-400">
                {statusSummary.estavel}
              </p>
            </div>
          </div>
          {activeFilter === 'estavel' && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-inter">
              ✓ Filtro ativo - clique para remover
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta */}
      <Card 
        className={cn(
          "bg-white dark:bg-odontoimpact-dark-card border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md",
          activeFilter === 'alerta' 
            ? "border-yellow-500 dark:border-yellow-400 ring-2 ring-yellow-200 dark:ring-yellow-800" 
            : "border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600"
        )}
        onClick={() => onFilterChange(activeFilter === 'alerta' ? 'todos' : 'alerta')}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-md transition-colors duration-200",
              activeFilter === 'alerta' 
                ? "bg-yellow-200 dark:bg-yellow-800/50" 
                : "bg-yellow-100 dark:bg-yellow-900/30"
            )}>
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-inter text-odontoimpact-gray dark:text-gray-300">Grupos em Alerta</p>
              <p className="text-2xl font-poppins font-semibold text-yellow-600 dark:text-yellow-400">
                {statusSummary.alerta}
              </p>
            </div>
          </div>
          {activeFilter === 'alerta' && (
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 font-inter">
              ✓ Filtro ativo - clique para remover
            </div>
          )}
        </CardContent>
      </Card>

      {/* Crítico */}
      <Card
        className={cn(
          "bg-white dark:bg-odontoimpact-dark-card border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md",
          activeFilter === 'critico'
            ? "border-red-500 dark:border-red-400 ring-2 ring-red-200 dark:ring-red-800"
            : "border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600"
        )}
        onClick={() => onFilterChange(activeFilter === 'critico' ? 'todos' : 'critico')}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-md transition-colors duration-200",
              activeFilter === 'critico'
                ? "bg-red-200 dark:bg-red-800/50"
                : "bg-red-100 dark:bg-red-900/30"
            )}>
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-inter text-odontoimpact-gray dark:text-gray-300">Grupos Críticos</p>
              <p className="text-2xl font-poppins font-semibold text-red-600 dark:text-red-400">
                {statusSummary.critico}
              </p>
            </div>
          </div>
          {activeFilter === 'critico' && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-inter">
              ✓ Filtro ativo - clique para remover
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sem Interação */}
      <Card
        className={cn(
          "bg-white dark:bg-odontoimpact-dark-card border-2 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md",
          activeFilter === 'sem-interacao'
            ? "border-gray-500 dark:border-gray-400 ring-2 ring-gray-200 dark:ring-gray-800"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        )}
        onClick={() => onFilterChange(activeFilter === 'sem-interacao' ? 'todos' : 'sem-interacao')}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-md transition-colors duration-200",
              activeFilter === 'sem-interacao'
                ? "bg-gray-200 dark:bg-gray-800/50"
                : "bg-gray-100 dark:bg-gray-900/30"
            )}>
              <MessageCircleOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-inter text-odontoimpact-gray dark:text-gray-300">Sem Interação Hoje</p>
              <p className="text-2xl font-poppins font-semibold text-gray-600 dark:text-gray-400">
                {statusSummary.semInteracao || 0}
              </p>
            </div>
          </div>
          {activeFilter === 'sem-interacao' && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 font-inter">
              ✓ Filtro ativo - clique para remover
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};