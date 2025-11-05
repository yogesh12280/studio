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
import type { Bulletin } from '@/lib/types'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'

interface BulletinCardProps {
  bulletin: Bulletin
  onLikeToggle: (bulletinId: string) => void
  onDelete: (bulletinId: string) => void
}

export function BulletinCard({ bulletin, onLikeToggle, onDelete }: BulletinCardProps) {
  const { currentUser } = useUser()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isLiked = bulletin.likedBy.includes(currentUser.id)

  const isScheduled = bulletin.scheduledFor && bulletin.scheduledFor > new Date()
  const isExpired = bulletin.endDate && bulletin.endDate < new Date()

  const formattedCreatedAt = isClient
    ? formatDistanceToNow(bulletin.createdAt, { addSuffix: true })
    : ''
  const formattedScheduledFor = isClient && bulletin.scheduledFor
    ? format(bulletin.scheduledFor, "MMM d, yyyy 'at' p")
    : ''
  const formattedEndDate = isClient && bulletin.endDate
    ? format(bulletin.endDate, "MMM d, yyyy")
    : ''

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
                <time dateTime={bulletin.createdAt.toISOString()}>
                  {formattedCreatedAt}
                </time>
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
        
        {currentUser.role === 'Admin' && isScheduled && (
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
          <Button variant="ghost" size="sm" onClick={() => onLikeToggle(bulletin.id)}>
            <Heart className={cn('h-4 w-4 mr-2', isLiked && 'fill-red-500 text-red-500')} />
            {bulletin.likes}
          </Button>
          <Button variant="ghost" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            {bulletin.comments.length}
          </Button>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>{bulletin.viewers} views</span>
        </div>
      </CardFooter>
    </Card>
  )
}
