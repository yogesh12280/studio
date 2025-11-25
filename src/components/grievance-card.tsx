'use client'

import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Grievance, User } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import { useUser } from '@/contexts/user-context'

interface GrievanceCardProps {
  grievance: Grievance;
  onAddComment: (grievanceId: string, commentText: string) => void;
  getStatusVariant: (status: Grievance['status']) => 'default' | 'destructive' | 'secondary' | 'outline';
}

export function GrievanceCard({ grievance, onAddComment, getStatusVariant }: GrievanceCardProps) {
  const { currentUser } = useUser()
  const [newComment, setNewComment] = useState('')

  if (!currentUser) return null;


  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const commentText = newComment.trim()
    if (commentText) {
      onAddComment(grievance.id, commentText)
      setNewComment('')
    }
  }

  return (
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
      
      <Separator />
      <div className="p-4 space-y-4">
          <h3 className="font-semibold text-sm">Conversation</h3>
          {grievance.comments && grievance.comments.length > 0 ? (
            grievance.comments.map(comment => (
                <div key={comment.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="bg-muted rounded-lg px-3 py-2">
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
            ))
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">
              No comments yet.
            </p>
          )}

          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 h-9"
            />
            <Button type="submit" size="icon" className="h-9 w-9">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
    </Card>
  )
}
