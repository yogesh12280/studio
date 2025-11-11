'use client'

import { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

  const organizationNotifications = filteredNotifications.filter(
    (b) => b.category === 'Organization'
  )
  const employeeNotifications = filteredNotifications.filter(
    (b) => b.category === 'Employee'
  )

  const renderNotificationList = (notificationList: Notification[]) => {
    if (notificationList.length === 0) {
      return <p className="text-muted-foreground mt-4 text-center">No notifications found.</p>
    }
    return (
      <NotificationList notifications={notificationList} onSelectNotification={onSelectNotification} />
    )
  }

  return (
    <Tabs defaultValue="organization" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="employee">Employee</TabsTrigger>
      </TabsList>
      <TabsContent value="organization" className="mt-6">
        {renderNotificationList(organizationNotifications)}
      </TabsContent>
      <TabsContent value="employee" className="mt-6">
        {renderNotificationList(employeeNotifications)}
      </TabsContent>
    </Tabs>
  )
}
