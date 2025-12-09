'use client'

import { useMemo } from 'react'
import { MessageSquare, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Grievance } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface EmployeeGrievanceViewProps {
  grievances: Grievance[]
  onSelectGrievance: (grievance: Grievance) => void;
  onEdit: (grievance: Grievance) => void;
  onDelete: (grievance: Grievance) => void;
  getStatusVariant: (status: Grievance['status']) => 'default' | 'destructive' | 'secondary' | 'outline';
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function EmployeeGrievanceView({ 
  grievances, 
  onSelectGrievance, 
  onEdit, 
  onDelete, 
  getStatusVariant,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize
}: EmployeeGrievanceViewProps) {

  const paginatedGrievances = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return grievances.slice(startIndex, startIndex + pageSize);
  }, [grievances, currentPage, pageSize]);

  const totalPages = Math.ceil(grievances.length / pageSize);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };
  
  return (
    <>
      <div className="space-y-3">
        {paginatedGrievances.map((grievance) => (
          <div
            key={grievance.id}
            className="border rounded-lg p-4 flex flex-col cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectGrievance(grievance)}
          >
            <div className="flex-1 mb-3">
                <div className="flex justify-between items-start mb-2">
                    <div 
                      className="font-medium text-base"
                    >
                      {grievance.subject}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant(grievance.status)}>
                            {grievance.status}
                        </Badge>
                        {grievance.status === 'Pending' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onSelect={() => onEdit(grievance)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onSelect={() => onDelete(grievance)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            <div 
                className="flex items-center justify-between text-sm text-muted-foreground"
            >
                <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4"/>
                    <span>{grievance.comments?.length || 0}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(grievance.createdAt), { addSuffix: true })}
                </p>
            </div>
          </div>
        ))}
        {grievances.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
                You haven&apos;t submitted any grievances that match the current filters.
            </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Page {currentPage} of {totalPages}</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 5, 10, 20, 50].map(size => (
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
    </>
  )
}

    