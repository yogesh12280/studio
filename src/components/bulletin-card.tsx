'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart,
  MessageCircle,
  Eye,
  MoreVertical,
  Trash2,
  Edit,
  Clock,
  CalendarOff,
  Send,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
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
import type { Bulletin, User, Comment } from '@/lib/types'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'

interface BulletinCardProps {
  bulletin: Bulletin
  onLikeToggle: (bulletinId: string) => void
  onDelete: (bulletinId: string) => void
  onAddComment: (bulletinId: string, commentText: string) => void
}

export function BulletinCard({ bulletin, onLikeToggle, onDelete, onAddComment }: BulletinCardProps) {
  const { currentUser, users } = useUser()
  const [isClient, setIsClient] = useState(false)
  const [likePopoverOpen, setLikePopoverOpen] = useState(false)
  const [viewPopoverOpen, setViewPopoverOpen] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isLiked = bulletin.likedBy.includes(currentUser.id)
  
  const now = new Date();
  const scheduledForDate = bulletin.scheduledFor ? new Date(bulletin.scheduledFor) : undefined;
  const isScheduled = scheduledForDate && scheduledForDate > now;
  const endDateDate = bulletin.endDate ? new Date(bulletin.endDate) : undefined;
  const isExpired = endDateDate && endDateDate < now;
  
  const createdAtDate = new Date(bulletin.createdAt);
  
  const formattedCreatedAt = isClient
    ? formatDistanceToNow(createdAtDate, { addSuffix: true })
    : ''
  const formattedScheduledFor = isClient && scheduledForDate
    ? format(scheduledForDate, "MMM d, yyyy 'at' p")
    : ''
  const formattedEndDate = isClient && endDateDate
    ? format(endDateDate, "MMM d, yyyy")
    : ''

  const likers = bulletin.likedBy
    .map(userId => users.find(u => u.id === userId))
    .filter((u): u is User => !!u);
  
  const viewers = (bulletin.viewedBy || [])
    .map(userId => users.find(u => u.id === userId))
    .filter((u): u is User => !!u);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(bulletin.id, newComment.trim())
      setNewComment('')
    }
  }

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage
            src={bulletin.author.avatarUrl}
            alt={bulletin.author.name}
          />
          <AvatarFallback>{bulletin.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{bulletin.author.name}</p>
              <p className="text-xs text-muted-foreground">
                {isClient ? (
                  <time dateTime={createdAtDate.toISOString()}>
                    {formattedCreatedAt}
                  </time>
                ) : (
                  <span>&nbsp;</span>
                )}
              </p>
            </div>
            {currentUser.role === 'Admin' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(bulletin.id)}
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
      <CardContent className="p-4 pt-0">
        <h2 className="text-xl font-bold font-headline mb-2">{bulletin.title}</h2>
        
        {isScheduled && (
            <Badge variant="secondary" className="mb-2">
                <Clock className="mr-1 h-3 w-3" />
                Scheduled for {formattedScheduledFor}
            </Badge>
        )}
        {currentUser.role === 'Admin' && isExpired && (
            <Badge variant="destructive" className="mb-2">
                <CalendarOff className="mr-1 h-3 w-3" />
                Expired on {formattedEndDate}
            </Badge>
        )}

        {bulletin.imageUrl && (
          <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={bulletin.imageUrl}
              alt={bulletin.title}
              fill
              className="object-cover"
              data-ai-hint="business chart"
            />
          </div>
        )}
        <p className="text-foreground/90 whitespace-pre-wrap">
          {bulletin.content}
        </p>
        {bulletin.link && (
          <Button asChild variant="link" className="px-0 mt-2">
            <Link href={bulletin.link.url} target="_blank" rel="noopener noreferrer">
              {bulletin.link.text}
            </Link>
          </Button>
        )}
      </CardContent>
      <Separator />
      <CardFooter className="p-2 flex justify-between">
        <div className="flex items-center gap-1">
          <Popover open={likePopoverOpen} onOpenChange={setLikePopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLikeToggle(bulletin.id)}
                onMouseEnter={() => setLikePopoverOpen(true)}
                onMouseLeave={() => setLikePopoverOpen(false)}
              >
                <Heart className={cn('h-4 w-4 mr-2', isLiked && 'fill-red-500 text-red-500')} />
                {bulletin.likes}
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
            {bulletin.comments.length}
          </Button>
        </div>
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
              <span>{bulletin.viewers} views</span>
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
      </CardFooter>
      {showComments && (
        <>
          <Separator />
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-sm">Comments</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {bulletin.comments.length > 0 ? (
                bulletin.comments.map((comment: Comment) => (
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
              <Button type="submit" size="icon" className="h-9 w-9">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  )
}
