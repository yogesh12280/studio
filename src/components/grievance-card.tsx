'use client'

import { useState, useEffect } from 'react'
import { Send, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Grievance, GrievanceComment, User } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Separator } from './ui/separator'
import { Input } from './ui/input'
import { useUser } from '@/contexts/user-context'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface ReplyInputProps {
  commentId: string;
  onAddReply: (commentId: string, replyText: string) => void;
  currentUser: User;
}

function ReplyInput({ commentId, onAddReply, currentUser }: ReplyInputProps) {
  const [replyText, setReplyText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setReplyText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(commentId, replyText.trim());
      setReplyText('');
    }
  };

  return (
    <form onSubmit={handleReplySubmit} className="flex items-center gap-2 mt-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
        <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <Input
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        className="flex-1 h-9"
      />
       <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-0">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </PopoverContent>
      </Popover>
      <Button type="submit" size="icon" className="h-9 w-9">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}

interface CommentWithRepliesProps {
  comment: GrievanceComment;
  grievanceId: string;
  onAddReply: (grievanceId: string, commentId: string, replyText: string) => void;
  currentUser: User;
  isClient: boolean;
  getStatusVariant: (status: Grievance['status']) => 'default' | 'destructive' | 'secondary' | 'outline';
}

function CommentWithReplies({ comment, grievanceId, onAddReply, currentUser, isClient, getStatusVariant }: CommentWithRepliesProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
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
        <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground mt-1">
            {isClient ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : ''}
            </p>
            <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => setShowReplyInput(!showReplyInput)}>
                Reply
            </Button>
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map(reply => (
              <div key={reply.id} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.author.avatarUrl} alt={reply.author.name} />
                  <AvatarFallback>{reply.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-background rounded-lg px-3 py-2 border">
                    <p className="font-semibold text-sm">{reply.author.name}</p>
                    <p className="text-sm text-foreground/90">{reply.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isClient ? formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {showReplyInput && (
          <ReplyInput
            commentId={comment.id}
            onAddReply={(commentId, replyText) => onAddReply(grievanceId, commentId, replyText)}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}

interface GrievanceCardProps {
  grievance: Grievance;
  onAddComment: (grievanceId: string, commentText: string) => void;
  onAddReply: (grievanceId: string, commentId: string, replyText: string) => void;
  getStatusVariant: (status: Grievance['status']) => 'default' | 'destructive' | 'secondary' | 'outline';
}

export function GrievanceCard({ grievance, onAddComment, onAddReply, getStatusVariant }: GrievanceCardProps) {
  const { currentUser } = useUser()
  const [newComment, setNewComment] = useState('')
  const [isClient, setIsClient] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!currentUser) return null;

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

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
            grievance.comments
              .filter(c => !c.parentId)
              .map(comment => (
                <CommentWithReplies
                    key={comment.id}
                    comment={comment}
                    grievanceId={grievance.id}
                    onAddReply={onAddReply}
                    currentUser={currentUser}
                    isClient={isClient}
                    getStatusVariant={getStatusVariant}
                />
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
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-9 w-9">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </PopoverContent>
            </Popover>
            <Button type="submit" size="icon" className="h-9 w-9">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
    </Card>
  )
}
