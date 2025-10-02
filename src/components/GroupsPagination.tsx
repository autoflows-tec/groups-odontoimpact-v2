import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupsPaginationProps {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const GroupsPagination = ({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems,
  onPageChange
}: GroupsPaginationProps) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Máximo de números visíveis
    
    if (totalPages <= maxVisible) {
      // Se há poucas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para páginas com ellipsis
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Páginas ao redor da atual
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
      <div className="text-sm text-odontoimpact-dark dark:text-white font-inter">
        Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} grupos
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-300 dark:border-gray-600 text-odontoimpact-dark dark:text-white hover:bg-odontoimpact-primary hover:text-white hover:border-odontoimpact-primary font-inter"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Anterior</span>
        </Button>
        
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <div key={`ellipsis-${index}`} className="px-2">
                <MoreHorizontal className="h-4 w-4 text-odontoimpact-gray dark:text-gray-400" />
              </div>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={`
                  min-w-[2.5rem] h-9
                  ${currentPage === page 
                    ? "bg-odontoimpact-primary text-white hover:bg-odontoimpact-primary/90 border-odontoimpact-primary" 
                    : "border-gray-300 dark:border-gray-600 text-odontoimpact-dark dark:text-white hover:bg-odontoimpact-primary hover:text-white hover:border-odontoimpact-primary"
                  }
                  font-inter
                `}
              >
                {page}
              </Button>
            )
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-gray-300 dark:border-gray-600 text-odontoimpact-dark dark:text-white hover:bg-odontoimpact-primary hover:text-white hover:border-odontoimpact-primary font-inter"
        >
          <span className="hidden sm:inline mr-1">Próxima</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};