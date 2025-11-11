'use client'

import { useMemo, useState, Fragment } from 'react'
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { MoreHorizontal, MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { Grievance } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { useUser } from '@/contexts/user-context'
import { AddGrievanceCommentDialog } from './add-grievance-comment-dialog'
import { Separator } from './ui/separator'
import { Input } from './ui/input'


interface GrievanceManagementProps {
  searchQuery: string;
  grievances: Grievance[];
  onStatusChange: (grievanceId: string, newStatus: Grievance['status'], comment?: string) => void;
  onAddComment: (grievanceId: string, commentText: string) => void;
}

export function GrievanceManagement({ searchQuery, grievances, onStatusChange, onAddComment }: GrievanceManagementProps) {
  const { currentUser } = useUser()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null)
  const [targetStatus, setTargetStatus] = useState<Grievance['status'] | null>(null)
  const [newComment, setNewComment] = useState<{[key: string]: string}>({})
  const [openCollapsibles, setOpenCollapsibles] = useState<Set<string>>(new Set());

  const toggleCollapsible = (id: string) => {
    setOpenCollapsibles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

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
  
  const handleStatusUpdate = (grievance: Grievance, status: Grievance['status']) => {
    if (status === 'In Progress' || status === 'Resolved') {
      setSelectedGrievance(grievance)
      setTargetStatus(status)
      setDialogOpen(true)
    } else {
      onStatusChange(grievance.id, status)
    }
  }
  
  const handleDialogSubmit = (comment: string) => {
    if (selectedGrievance && targetStatus) {
      onStatusChange(selectedGrievance.id, targetStatus, comment)
    }
  }
  
  const handleCommentSubmit = (e: React.FormEvent, grievanceId: string) => {
    e.preventDefault()
    const commentText = newComment[grievanceId]?.trim()
    if (commentText) {
      onAddComment(grievanceId, commentText)
      setNewComment(prev => ({...prev, [grievanceId]: ''}))
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
              <TableHead className="w-12"></TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrievances.map((grievance) => (
              <Fragment key={grievance.id}>
                <TableRow>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => toggleCollapsible(grievance.id)}>
                      {openCollapsibles.has(grievance.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      <span className="sr-only">Toggle Comments</span>
                    </Button>
                  </TableCell>
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
                          onClick={() => handleStatusUpdate(grievance, 'Pending')}
                        >
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(grievance, 'In Progress')}
                        >
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(grievance, 'Resolved')}
                        >
                          Mark as Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {openCollapsibles.has(grievance.id) && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                       <div className="p-4 space-y-4 bg-muted/50">
                        <p className="font-medium text-sm">Conversation History</p>
                        <p className="text-sm text-muted-foreground">{grievance.description}</p>
                        <Separator/>
                        {grievance.comments && grievance.comments.map(comment => (
                           <div key={comment.id} className="flex items-start gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                                <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="bg-background rounded-lg px-3 py-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="font-semibold text-sm">{comment.author.name}</p>
                                    {comment.status && <Badge variant={getStatusVariant(comment.status)}>{comment.status}</Badge>}
                                  </div>
                                  <p className="text-sm text-foreground/90">{comment.text}</p>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                        ))}
                         {(!grievance.comments || grievance.comments.length === 0) && (
                          <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
                         )}
                        <form onSubmit={(e) => handleCommentSubmit(e, grievance.id)} className="flex items-center gap-2 pt-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Input
                            value={newComment[grievance.id] || ''}
                            onChange={(e) => setNewComment(prev => ({...prev, [grievance.id]: e.target.value}))}
                            placeholder="Write a reply..."
                            className="flex-1 h-9"
                          />
                          <Button type="submit" size="icon" className="h-9 w-9">
                            <Send className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
       <AddGrievanceCommentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grievance={selectedGrievance}
        targetStatus={targetStatus}
        onSubmit={handleDialogSubmit}
      />
    </div>
  )
}
