'use client'

import type { Appreciation } from '@/lib/types';
import { AppreciationCard } from './appreciation-card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AppreciationListProps {
  appreciations: Appreciation[];
  onLikeToggle: (appreciationId: string) => void;
  onEdit: (appreciation: Appreciation) => void;
  onDelete: (appreciation: Appreciation) => void;
  totalAppreciations: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function AppreciationList({
  appreciations,
  onLikeToggle,
  onEdit,
  onDelete,
  totalAppreciations,
  currentPage,
  pageSize,
  totalPages,
  setCurrentPage,
  setPageSize,
}: AppreciationListProps) {

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  if (appreciations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No appreciations found for the selected criteria.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {appreciations.map(appreciation => (
          <AppreciationCard 
            key={appreciation.id}
            appreciation={appreciation}
            onLikeToggle={() => onLikeToggle(appreciation.id)}
            onEdit={() => onEdit(appreciation)}
            onDelete={() => onDelete(appreciation)}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Page {currentPage} of {totalPages}</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
