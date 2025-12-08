'use client'

import { useMemo } from 'react'
import type { Notification } from '@/lib/types'
import { NotificationList } from './notification-list'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface NotificationFeedProps {
  searchQuery: string
  notifications: Notification[]
  onSelectNotification: (notification: Notification) => void
  dateRange?: DateRange
}

export function NotificationFeed({ searchQuery, notifications, onSelectNotification, dateRange }: NotificationFeedProps) {

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(notification => {
        const searchLower = searchQuery.toLowerCase()
        const textMatch = notification.title.toLowerCase().includes(searchLower) ||
          notification.content.toLowerCase().includes(searchLower) ||
          notification.author.name.toLowerCase().includes(searchLower)

        const dateMatch = (() => {
            if (!dateRange?.from && !dateRange?.to) return true;
            const notificationDate = new Date(notification.createdAt);
            const start = dateRange.from ? startOfDay(dateRange.from) : undefined;
            const end = dateRange.to ? endOfDay(dateRange.to) : undefined;
            if (start && end) {
                return isWithinInterval(notificationDate, { start, end });
            }
            if (start) {
                return notificationDate >= start;
            }
            if (end) {
                return notificationDate <= end;
            }
            return true;
        })();

        return textMatch && dateMatch
      })
      .sort((a, b) => {
        const dateA = a.scheduledFor ? new Date(a.scheduledFor) : new Date(a.createdAt);
        const dateB = b.scheduledFor ? new Date(b.scheduledFor) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
  }, [notifications, searchQuery, dateRange])

  if (filteredNotifications.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">No notifications found.</p>
  }

  return (
    <div className="mt-6">
      <NotificationList notifications={filteredNotifications} onSelectNotification={onSelectNotification} />
    </div>
  )
}
