'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { NotificationFeed } from '@/components/notification-feed'
import { useUser } from '@/contexts/user-context'
import type { Notification, Comment } from '@/lib/types'
import { NotificationCard } from '@/components/notification-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { FeaturedNotifications } from '@/components/featured-notifications'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { currentUser } = useUser()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notifications');
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (!currentUser) return null;

  const handleAddNotification = async (newNotificationData: Omit<Notification, 'id' | 'author' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'createdAt'>) => {
    const fullNotificationData = {
        ...newNotificationData,
        author: {
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
        },
    };
    
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticNotification: Notification = {
      ...fullNotificationData,
      id: tempId,
      likes: 0,
      likedBy: [],
      viewers: 0,
      viewedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [optimisticNotification, ...prev]);

    try {
        const response = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullNotificationData),
        });
        const savedNotification = await response.json();
        
        // Replace optimistic update with real data
        setNotifications(prev => prev.map(n => n.id === tempId ? savedNotification : n));
    } catch (error) {
        console.error("Failed to save notification:", error);
        // Revert optimistic update on failure
        setNotifications(prev => prev.filter(n => n.id !== tempId));
    }
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
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            user: {
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
            },
            text: commentText,
            timestamp: new Date().toISOString(),
            replies: [],
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
  
  const handleAddReply = (notificationId: string, commentId: string, replyText: string) => {
    const newNotifications = notifications.map(b => {
      if (b.id === notificationId) {
        const newReply: Comment = {
          id: `reply-${Date.now()}`,
          user: {
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
          },
          text: replyText,
          timestamp: new Date().toISOString(),
        };

        const updatedComments = b.comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        });

        const updatedNotification = { ...b, comments: updatedComments };
        
        if (selectedNotification && selectedNotification.id === notificationId) {
            setSelectedNotification(updatedNotification);
        }
        return updatedNotification;
      }
      return b;
    });
    setNotifications(newNotifications);
  };

  const handleSelectNotification = (notification: Notification) => {
    setSelectedNotification(notification);
  };

  const handleBackToList = () => {
    setSelectedNotification(null);
  }
  
  const renderLoadingState = () => (
    <>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </>
  )

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
          {loading ? renderLoadingState() : (
            selectedNotification ? (
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
                  onAddReply={handleAddReply}
                  currentUser={currentUser}
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
            )
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
