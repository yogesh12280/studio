'use client'

import { useState, useEffect } from 'react'
import { Heart, ArrowRight, MoreVertical, Edit, Trash2 } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { Appreciation, User } from '@/lib/types'
import { useUser } from '@/contexts/user-context'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { employees } from '@/lib/data'

interface AppreciationCardProps {
  appreciation: Appreciation
  onLikeToggle: (appreciationId: string) => void
  onEdit: () => void
  onDelete: () => void
}

export function AppreciationCard({ appreciation, onLikeToggle, onEdit, onDelete }: AppreciationCardProps) {
  const { currentUser, users } = useUser()
  const [isClient, setIsClient] = useState(false)
  const [likePopoverOpen, setLikePopoverOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!currentUser) return null;

  const isLiked = appreciation.likedBy.includes(currentUser.id)
  const canModify = appreciation.fromUser.id === currentUser.id && appreciation.likes === 0;
  
  const allUsers = [...users, ...employees];
  const likers = appreciation.likedBy
    .map(userId => allUsers.find(u => u.id === userId))
    .filter((u): u is User => !!u);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage
                src={appreciation.fromUser.avatarUrl}
                alt={appreciation.fromUser.name}
              />
              <AvatarFallback>{appreciation.fromUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm">{appreciation.fromUser.name}</p>
          </div>
          <ArrowRight className="h-6 w-6 text-muted-foreground shrink-0" />
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-12 w-12 mb-2">
              <AvatarImage
                src={appreciation.toUser.avatarUrl}
                alt={appreciation.toUser.name}
              />
              <AvatarFallback>{appreciation.toUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold text-sm">{appreciation.toUser.name}</p>
          </div>
        </div>
         {canModify && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="bg-muted p-4 rounded-lg text-center">
             <p className="text-foreground/90 whitespace-pre-wrap">
                &ldquo;{appreciation.message}&rdquo;
            </p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {isClient ? (
            <time dateTime={new Date(appreciation.createdAt).toISOString()}>
              {formatDistanceToNow(new Date(appreciation.createdAt), { addSuffix: true })}
            </time>
          ) : (
            <span>&nbsp;</span>
          )}
        </p>
         <Popover open={likePopoverOpen} onOpenChange={setLikePopoverOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onLikeToggle(appreciation.id)}
                onMouseEnter={() => setLikePopoverOpen(true)}
                onMouseLeave={() => setLikePopoverOpen(false)}
                className="gap-1"
            >
                <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
                <span>{appreciation.likes}</span>
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
      </CardFooter>
    </Card>
  )
}
