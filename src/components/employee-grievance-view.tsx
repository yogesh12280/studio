'use client'

import { useMemo } from 'react'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RegisterGrievanceDialog } from '@/components/register-grievance-dialog'
import type { Grievance } from '@/lib/types'
import { format } from 'date-fns'

interface EmployeeGrievanceViewProps {
  searchQuery: string
  grievances: Grievance[]
  onAddGrievance: (newGrievance: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => void
}

export function EmployeeGrievanceView({ searchQuery, grievances, onAddGrievance }: EmployeeGrievanceViewProps) {
  const getStatusVariant = (status: Grievance['status']) => {
    switch (status) {
      case 'Pending':
        return 'destructive'
      case 'In Progress':
        return 'secondary'
      case 'Resolved':
        return 'default'
      default:
        return 'outline'
    }
  }

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGrievances.map((grievance) => (
          <Card key={grievance.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{grievance.subject}</CardTitle>
                <Badge variant={getStatusVariant(grievance.status)}>
                  {grievance.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                {grievance.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted on {format(new Date(grievance.createdAt), 'PPP')}
              </p>
              {grievance.resolvedAt && (
                 <p className="text-xs text-muted-foreground">
                    Resolved on {format(new Date(grievance.resolvedAt), 'PPP')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredGrievances.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 text-center text-muted-foreground py-12">
                You haven&apos;t submitted any grievances yet.
            </div>
        )}
      </div>
    </div>
  )
}
