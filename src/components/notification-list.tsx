'use client'

import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Eye, CalendarOff, Clock } from 'lucide-react'
import type { Notification } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface NotificationListProps {
  notifications: Notification[]
  onSelectNotification: (notification: Notification) => void
}

export function NotificationList({ notifications, onSelectNotification }: NotificationListProps) {

  const getBadge = (notification: Notification) => {
    const now = new Date();
    const scheduledForDate = notification.scheduledFor ? new Date(notification.scheduledFor) : undefined;
    const isScheduled = scheduledForDate && scheduledForDate > now;
    const endDateDate = notification.endDate ? new Date(notification.endDate) : undefined;
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
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          onClick={() => onSelectNotification(notification)} 
          className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col"
        >
          <div className="flex-1 mb-3">
            <div className="flex items-center gap-2 mb-1">
              {getBadge(notification)}
              <span className="font-medium text-base">{notification.title}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                <Heart className="h-4 w-4"/>
                <span>{notification.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4"/>
                <span>{notification.comments.length}</span>
                </div>
                <div className="flex items-center gap-1">
                <Eye className="h-4 w-4"/>
                <span>{notification.viewers}</span>
                </div>
            </div>
            <p className="text-sm text-muted-foreground">
              By {notification.author.name} &middot; {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
