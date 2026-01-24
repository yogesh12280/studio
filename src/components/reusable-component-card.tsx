'use client'

import { useState, useEffect } from 'react'
import {
  Heart,
  MessageCircle,
  Eye,
  MoreVertical,
  Trash2,
  Edit,
  Send,
  Smile,
  Rocket
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from './ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Input } from './ui/input'
import type { ReusableComponent, User, Comment } from '@/lib/types'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'
import { ManageUtilizationDialog } from './manage-utilization-dialog'

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
  comment: Comment;
  componentId: string;
  onAddReply: (componentId: string, commentId: string, replyText: string) => void;
  currentUser: User;
  isClient: boolean;
}

function CommentWithReplies({ comment, componentId, onAddReply, currentUser, isClient }: CommentWithRepliesProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);

  return (
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
        <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground mt-1">
            {isClient ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true }) : ''}
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
                  <AvatarImage src={reply.user.avatarUrl} alt={reply.user.name} />
                  <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-background rounded-lg px-3 py-2 border">
                    <p className="font-semibold text-sm">{reply.user.name}</p>
                    <p className="text-sm text-foreground/90">{reply.text}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isClient ? formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {showReplyInput && (
          <ReplyInput
            commentId={comment.id}
            onAddReply={(commentId, replyText) => onAddReply(componentId, commentId, replyText)}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
}


interface ReusableComponentCardProps {
  component: ReusableComponent
  onLikeToggle: (componentId: string) => void
  onDelete: (componentId: string) => void
  onAddComment: (componentId: string, commentText: string) => void
  onEdit: (component: ReusableComponent) => void
  onUpdate: (component: ReusableComponent) => void
  onAddReply: (componentId: string, commentId: string, replyText: string) => void;
  currentUser: User | null;
}

export function ReusableComponentCard({ component, onLikeToggle, onDelete, onAddComment, onEdit, onUpdate, onAddReply, currentUser }: ReusableComponentCardProps) {
  const { users } = useUser()
  const [isClient, setIsClient] = useState(false)
  const [likePopoverOpen, setLikePopoverOpen] = useState(false)
  const [viewPopoverOpen, setViewPopoverOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUtilizationDialogOpen, setIsUtilizationDialogOpen] = useState(false);

  if (!currentUser) return null;
  
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isLiked = component.likedBy.includes(currentUser.id)
  const isCreator = component.registeredBy.name === currentUser.name;
  const canModify = isCreator && component.utilizationByProjects.length === 0;
  
  const createdAtDate = new Date(component.registeredDate);
  
  const formattedCreatedAt = isClient
    ? formatDistanceToNow(createdAtDate, { addSuffix: true })
    : ''

  const likers = component.likedBy
    .map(userId => users.find(u => u.id === userId))
    .filter((u): u is User => !!u);
  
  const viewers = (component.viewedBy || [])
    .map(userId => users.find(u => u.id === userId))
    .filter((u): u is User => !!u);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(component.id, newComment.trim())
      setNewComment('')
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-start gap-4 p-4">
          <Avatar>
            <AvatarImage
              src={component.registeredBy.avatarUrl}
              alt={component.registeredBy.name}
            />
            <AvatarFallback>{component.registeredBy.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{component.registeredBy.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isClient ? (
                    <time dateTime={createdAtDate.toISOString()}>
                      Registered {formattedCreatedAt}
                    </time>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </p>
              </div>
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(component)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(component.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div>
              <Badge variant={
                  component.technology === 'Web' ? 'default' 
                  : (component.technology === 'AI' || component.technology === 'QC') ? 'secondary' 
                  : 'outline'
                }>
                  {component.technology}
              </Badge>
              <h2 className="text-xl font-bold font-headline mt-2">{component.name}</h2>
          </div>
          
          <div className="prose dark:prose-invert max-w-none text-sm" dangerouslySetInnerHTML={{ __html: component.description }} />
          
          <div>
              <h3 className="font-semibold text-sm mb-1">Benefit</h3>
              <p className="text-sm text-foreground/80">{component.benefit}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <div className="mb-4">
                    <h3 className="font-semibold text-sm mb-1">Origin Project</h3>
                    <p className="text-sm text-foreground/80">{component.originProject}</p>
                  </div>
                   {component.bitBucketUrl && (
                    <div>
                      <h3 className="font-semibold text-sm mb-1">Bit Bucket URL</h3>
                      <Button asChild variant="link" className="p-0 h-auto text-sm text-left">
                        <a href={component.bitBucketUrl} target="_blank" rel="noopener noreferrer" className="break-all">
                          {component.bitBucketUrl}
                        </a>
                      </Button>
                    </div>
                  )}
              </div>
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">Utilized In</h3>
                      <Button size="sm" variant="default" className="h-6 px-2" onClick={() => setIsUtilizationDialogOpen(true)}>
                          Manage
                      </Button>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                      {component.utilizationByProjects.map(util => (
                          <li key={util.projectId} className="text-sm text-foreground/80">
                              {util.projectName} <span className="text-muted-foreground">({util.utilizedBy.name})</span>
                          </li>
                      ))}
                      {component.utilizationByProjects.length === 0 && (
                          <p className="text-sm text-muted-foreground">Not used by any projects yet.</p>
                      )}
                  </ul>
              </div>
          </div>
          
        </CardContent>
        <Separator />
        <CardFooter className="p-2 flex justify-between">
          <div className="flex items-center gap-1">
            <Popover open={likePopoverOpen} onOpenChange={setLikePopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onLikeToggle(component.id)}
                  onMouseEnter={() => setLikePopoverOpen(true)}
                  onMouseLeave={() => setLikePopoverOpen(false)}
                >
                  <Heart className={cn('h-4 w-4 mr-2', isLiked && 'fill-red-500 text-red-500')} />
                  {component.likes}
                </Button>
              </PopoverTrigger>
              {likers.length > 0 && (
                <PopoverContent className="w-auto max-w-xs">
                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-sm">Liked by</p>
                    <div className="flex flex-wrap gap-2">
                      {likers.map(user => (
                        <div key={user.id} className="flex items-center gap-2 text-xs">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              )}
            </Popover>
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              {component.comments.length}
            </Button>
          </div>
          <div className="flex items-center gap-2">
              <Popover open={viewPopoverOpen} onOpenChange={setViewPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-xs text-muted-foreground"
                    onMouseEnter={() => setViewPopoverOpen(true)}
                    onMouseLeave={() => setViewPopoverOpen(false)}
                  >
                    <Eye className="h-4 w-4" />
                    <span>{component.viewers} views</span>
                  </Button>
                </PopoverTrigger>
                {viewers.length > 0 && (
                    <PopoverContent className="w-auto max-w-xs">
                      <div className="flex flex-col gap-2">
                        <p className="font-semibold text-sm">Viewed by</p>
                        <div className="flex flex-wrap gap-2">
                          {viewers.map(user => (
                            <div key={user.id} className="flex items-center gap-2 text-xs">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span>{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  )}
              </Popover>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Rocket className="h-4 w-4" />
                  <span>{component.utilizationByProjects.length} projects</span>
              </div>
          </div>
        </CardFooter>
        {showComments && (
          <>
            <Separator />
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-sm">Comments</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {component.comments.length > 0 ? (
                  component.comments.map((comment: Comment) => (
                    <CommentWithReplies
                      key={comment.id}
                      comment={comment}
                      componentId={component.id}
                      onAddReply={onAddReply}
                      currentUser={currentUser}
                      isClient={isClient}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No comments yet.
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
          </>
        )}
      </Card>
      <ManageUtilizationDialog
        open={isUtilizationDialogOpen}
        onOpenChange={setIsUtilizationDialogOpen}
        component={component}
        currentUser={currentUser}
        onUpdate={onUpdate}
      />
    </>
  )
}
