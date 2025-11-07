'use client'

import { useMemo } from 'react'
import { PlusCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RegisterGrievanceDialog } from '@/components/register-grievance-dialog'
import type { Grievance } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from './ui/separator'

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
          <Collapsible asChild key={grievance.id}>
            <Card>
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
              {grievance.comments && grievance.comments.length > 0 && (
                <>
                <CardFooter className="pb-4">
                  <CollapsibleTrigger asChild>
                     <Button variant="link" className="text-xs p-0 h-auto">
                        <MessageSquare className="mr-2 h-4 w-4"/>
                        Show admin comments ({grievance.comments.length})
                    </Button>
                  </CollapsibleTrigger>
                </CardFooter>
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-4 bg-muted/50">
                    {grievance.comments.map(comment => (
                       <div key={comment.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-background rounded-lg px-3 py-2">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-sm">{comment.author.name}</p>
                                <Badge variant={getStatusVariant(comment.status)}>{comment.status}</Badge>
                              </div>
                              <p className="text-sm text-foreground/90">{comment.text}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </CollapsibleContent>
                </>
              )}
            </Card>
          </Collapsible>
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
