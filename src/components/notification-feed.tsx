'use client'

import { useMemo } from 'react'
import type { Notification } from '@/lib/types'
import { NotificationList } from './notification-list'
import type { DateRange } from 'react-day-picker'
import { isWithinInterval } from 'date-fns'

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

        const dateMatch = dateRange?.from && dateRange?.to 
          ? isWithinInterval(new Date(notification.createdAt), { start: dateRange.from, end: dateRange.to })
          : true

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
