'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { NotificationFeed } from '@/components/notification-feed'
import { initialNotifications } from '@/lib/data'
import { useUser } from '@/contexts/user-context'
import type { Notification } from '@/lib/types'
import { NotificationCard } from '@/components/notification-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { FeaturedNotifications } from '@/components/featured-notifications'

export default function SEMBBlastPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)
  const { currentUser } = useUser()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const handleAddNotification = (newNotificationData: Omit<Notification, 'id' | 'author' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'createdAt'>) => {
    const newNotification: Notification = {
        id: `notification-${Date.now()}`,
        author: {
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
        },
        likes: 0,
        likedBy: [],
        viewers: 0,
        viewedBy: [],
        comments: [],
        createdAt: new Date().toISOString(),
        ...newNotificationData,
    }
    setNotifications(prev => [newNotification, ...prev])
  }
  
  const handleEditNotification = (updatedNotification: Notification) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(b =>
        b.id === updatedNotification.id ? updatedNotification : b
      )
    );
    if (selectedNotification && selectedNotification.id === updatedNotification.id) {
      setSelectedNotification(updatedNotification);
    }
  };


  const handleLikeToggle = (notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(b => {
        if (b.id === notificationId) {
          const isLiked = b.likedBy.includes(currentUser.id)
          const updatedNotification = {
            ...b,
            likes: isLiked ? b.likes - 1 : b.likes + 1,
            likedBy: isLiked ? b.likedBy.filter(id => id !== currentUser.id) : [...b.likedBy, currentUser.id]
          };
          if (selectedNotification && selectedNotification.id === notificationId) {
            setSelectedNotification(updatedNotification);
          }
          return updatedNotification;
        }
        return b
      })
    )
  }

  const handleDelete = (notificationId: string) => {
    setNotifications(prevNotifications => prevNotifications.filter(b => b.id !== notificationId));
    if (selectedNotification && selectedNotification.id === notificationId) {
      setSelectedNotification(null);
    }
  }
  
  const handleAddComment = (notificationId: string, commentText: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(b => {
        if (b.id === notificationId) {
          const newComment = {
            id: `comment-${Date.now()}`,
            user: {
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
            },
            text: commentText,
            timestamp: new Date().toISOString(),
          }
          const updatedNotification = {
            ...b,
            comments: [...b.comments, newComment],
          };
          if (selectedNotification && selectedNotification.id === notificationId) {
            setSelectedNotification(updatedNotification);
          }
          return updatedNotification;
        }
        return b
      })
    )
  }

  const handleSelectNotification = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleBackToList = () => {
    setSelectedNotification(null);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Notifications"
          onAddNotification={handleAddNotification}
        />
        <main className="p-4 sm:p-6">
          {selectedNotification ? (
            <div className="max-w-2xl mx-auto">
              <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all notifications
              </Button>
              <NotificationCard 
                notification={selectedNotification}
                onLikeToggle={handleLikeToggle}
                onDelete={handleDelete}
                onAddComment={handleAddComment}
                onEditNotification={handleEditNotification}
              />
            </div>
          ) : (
            <>
              <FeaturedNotifications notifications={notifications} onSelectNotification={handleSelectNotification} />
              <NotificationFeed 
                searchQuery={searchQuery}
                notifications={notifications}
                onSelectNotification={handleSelectNotification}
              />
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
