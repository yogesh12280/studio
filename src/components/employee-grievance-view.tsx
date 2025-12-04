'use client'

import { useMemo } from 'react'
import { PlusCircle, MessageSquare, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { RegisterGrievanceDialog } from '@/components/register-grievance-dialog'
import type { Grievance } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface EmployeeGrievanceViewProps {
  searchQuery: string
  grievances: Grievance[]
  onAddGrievance: (newGrievance: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => void
  onSelectGrievance: (grievance: Grievance) => void;
  onEdit: (grievance: Grievance) => void;
  onDelete: (grievance: Grievance) => void;
  getStatusVariant: (status: Grievance['status']) => 'default' | 'destructive' | 'secondary' | 'outline';
}

export function EmployeeGrievanceView({ searchQuery, grievances, onAddGrievance, onSelectGrievance, onEdit, onDelete, getStatusVariant }: EmployeeGrievanceViewProps) {

  const filteredGrievances = useMemo(() => {
    return grievances.filter(grievance => 
      grievance.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grievance.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [grievances, searchQuery])
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">Your Grievances</h2>
        <RegisterGrievanceDialog mode="create" onGrievanceSubmit={onAddGrievance}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Register New Grievance
          </Button>
        </RegisterGrievanceDialog>
      </div>
      <div className="space-y-3">
        {filteredGrievances.map((grievance) => (
          <div
            key={grievance.id}
            className="border rounded-lg p-4 flex flex-col cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectGrievance(grievance)}
          >
            <div className="flex-1 mb-3">
                <div className="flex justify-between items-start mb-2">
                    <div 
                      className="font-medium text-base hover:underline"
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
        {filteredGrievances.length === 0 && (
            <div className="text-center text-muted-foreground py-12">
                You haven&apos;t submitted any grievances yet.
            </div>
        )}
      </div>
    </div>
  )
}
