'use client'

import { useState, useEffect } from 'react'
import { ThumbsUp, Send } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import type { Suggestion, User, Comment } from '@/lib/types'
import { useUser } from '@/contexts/user-context'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface SuggestionCardProps {
  suggestion: Suggestion
  onUpvoteToggle: (suggestionId: string) => void
  onAddComment: (suggestionId: string, commentText: string) => void
  currentUser: User
}

export function SuggestionCard({ suggestion, onUpvoteToggle, onAddComment, currentUser }: SuggestionCardProps) {
  const [isClient, setIsClient] = useState(false)
  const [newComment, setNewComment] = useState('')
  const { users } = useUser()
  const adminUser = users.find(u => u.role === 'Admin');


  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const isUpvoted = suggestion.upvotedBy.includes(currentUser.id)

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(suggestion.id, newComment.trim())
      setNewComment('')
    }
  }

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage
            src={suggestion.employeeAvatarUrl}
            alt={suggestion.employeeName}
          />
          <AvatarFallback>{suggestion.employeeName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div>
            <p className="font-semibold">{suggestion.employeeName}</p>
            <p className="text-xs text-muted-foreground">
              {isClient ? (
                <time dateTime={new Date(suggestion.createdAt).toISOString()}>
                  {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                </time>
              ) : (
                <span>&nbsp;</span>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h2 className="text-xl font-bold font-headline mb-2">{suggestion.title}</h2>
        <p className="text-foreground/90 whitespace-pre-wrap">
          {suggestion.description}
        </p>
      </CardContent>
      <Separator />
      <CardFooter className="p-2">
        <Button 
            variant={isUpvoted ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => onUpvoteToggle(suggestion.id)}
            className="flex-1"
        >
            <ThumbsUp className={cn('mr-2 h-4 w-4', isUpvoted && "fill-current")} />
            <span>Upvote ({suggestion.upvotes})</span>
        </Button>
      </CardFooter>
      
        <>
          <Separator />
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Comments</h3>
            {adminUser && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={adminUser.avatarUrl} alt={adminUser.name} />
                        <AvatarFallback>{adminUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>Comments will be replied to by <strong>{adminUser.name}</strong> (Admin).</span>
                </div>
            )}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {suggestion.comments.length > 0 ? (
                suggestion.comments.map((comment: Comment) => (
                  <div key={comment.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                      <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg px-3 py-2">
                        <p className="font-semibold text-sm">{comment.user.name}</p>
                        <p className="text-sm text-foreground/90">{comment.text}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isClient ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true }) : ''}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No comments yet. Be the first to comment.
                </p>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 h-9"
              />
              <Button type="submit" size="icon" className="h-9 w-9">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
    </Card>
  )
}
