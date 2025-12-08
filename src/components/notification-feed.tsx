'use client'

import { useMemo } from 'react'
import type { Notification } from '@/lib/types'
import { NotificationList } from './notification-list'

interface NotificationFeedProps {
  searchQuery: string
  notifications: Notification[]
  onSelectNotification: (notification: Notification) => void
}

export function NotificationFeed({ searchQuery, notifications, onSelectNotification }: NotificationFeedProps) {

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(notification => {
        const searchLower = searchQuery.toLowerCase()
        return (
          notification.title.toLowerCase().includes(searchLower) ||
          notification.content.toLowerCase().includes(searchLower) ||
          notification.author.name.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => {
        const dateA = a.scheduledFor ? new Date(a.scheduledFor) : new Date(a.createdAt);
        const dateB = b.scheduledFor ? new Date(b.scheduledFor) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
  }, [notifications, searchQuery])

  if (filteredNotifications.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">No notifications found.</p>
  }

  return (
    <div className="mt-6">
      <NotificationList notifications={filteredNotifications} onSelectNotification={onSelectNotification} />
    </div>
  )
}
