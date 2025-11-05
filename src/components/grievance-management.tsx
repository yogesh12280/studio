'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MoreHorizontal } from 'lucide-react'
import { initialGrievances } from '@/lib/data'
import { Grievance } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface GrievanceManagementProps {
  searchQuery: string;
}

export function GrievanceManagement({ searchQuery }: GrievanceManagementProps) {
  const [grievances, setGrievances] = useState<Grievance[]>(initialGrievances)

  const handleStatusChange = (
    grievanceId: string,
    newStatus: Grievance['status']
  ) => {
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === grievanceId
          ? {
              ...g,
              status: newStatus,
              resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : undefined,
            }
          : g
      )
    )
  }

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
    const searchLower = searchQuery.toLowerCase();
    if (!searchLower) {
      return grievances.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return grievances
      .filter(g => 
        g.employeeName.toLowerCase().includes(searchLower) ||
        g.subject.toLowerCase().includes(searchLower) ||
        g.status.toLowerCase().includes(searchLower)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [grievances, searchQuery]);


  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold font-headline">Manage Grievances</h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrievances.map((grievance) => (
              <TableRow key={grievance.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={grievance.employeeAvatarUrl}
                        alt={grievance.employeeName}
                      />
                      <AvatarFallback>
                        {grievance.employeeName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{grievance.employeeName}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{grievance.subject}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(grievance.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(grievance.status)}>
                    {grievance.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(grievance.id, 'Pending')}
                      >
                        Mark as Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(grievance.id, 'In Progress')}
                      >
                        Mark as In Progress
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(grievance.id, 'Resolved')}
                      >
                        Mark as Resolved
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
