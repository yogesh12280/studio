'use client'

import { useMemo } from 'react'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RegisterGrievanceDialog } from '@/components/register-grievance-dialog'
import type { Grievance } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { Separator } from './ui/separator'

interface EmployeeGrievanceViewProps {
  searchQuery: string
  grievances: Grievance[]
  onAddGrievance: (newGrievance: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => void
  onSelectGrievance: (grievance: Grievance) => void;
  getStatusVariant: (status: Grievance['status']) => 'default' | 'destructive' | 'secondary' | 'outline';
}

export function EmployeeGrievanceView({ searchQuery, grievances, onAddGrievance, onSelectGrievance, getStatusVariant }: EmployeeGrievanceViewProps) {

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
        <RegisterGrievanceDialog onGrievanceSubmit={onAddGrievance}>
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
            onClick={() => onSelectGrievance(grievance)}
            className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-base">{grievance.subject}</span>
                <Badge variant={getStatusVariant(grievance.status)}>
                    {grievance.status}
                </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
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