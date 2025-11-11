'use client'

import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Eye, CalendarOff, Clock } from 'lucide-react'
import type { Bulletin } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface BulletinListProps {
  bulletins: Bulletin[]
  onSelectBulletin: (bulletin: Bulletin) => void
}

export function BulletinList({ bulletins, onSelectBulletin }: BulletinListProps) {

  const getBadge = (bulletin: Bulletin) => {
    const now = new Date();
    const scheduledForDate = bulletin.scheduledFor ? new Date(bulletin.scheduledFor) : undefined;
    const isScheduled = scheduledForDate && scheduledForDate > now;
    const endDateDate = bulletin.endDate ? new Date(bulletin.endDate) : undefined;
    const isExpired = endDateDate && endDateDate < now;
    
    if (isScheduled) {
      return (
        <Badge variant="secondary" className="whitespace-nowrap">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
        </Badge>
      )
    }

    if (isExpired) {
       return (
        <Badge variant="destructive" className="whitespace-nowrap">
            <CalendarOff className="mr-1 h-3 w-3" />
            Expired
        </Badge>
       )
    }
    return null;
  }

  return (
    <div className="space-y-3">
      {bulletins.map((bulletin) => (
        <div 
          key={bulletin.id} 
          onClick={() => onSelectBulletin(bulletin)} 
          className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col"
        >
          <div className="flex-1 mb-3">
            <div className="flex items-center gap-2 mb-1">
              {getBadge(bulletin)}
              <span className="font-medium text-base">{bulletin.title}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              By {bulletin.author.name} &middot; {formatDistanceToNow(new Date(bulletin.createdAt), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground self-start">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4"/>
              <span>{bulletin.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4"/>
              <span>{bulletin.comments.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4"/>
              <span>{bulletin.viewers}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
