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
import { ArrowLeft, Search, PlusCircle } from 'lucide-react'
import { FeaturedNotifications } from '@/components/featured-notifications'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { CreateNotificationDialog } from '@/components/create-notification-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { currentUser } = useUser()
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState('Most Recent');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);


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
    
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    setFilterStartDate(oneYearAgo);
    setFilterEndDate(today);

    fetchNotifications();
  }, []);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  }


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
    const originalNotifications = [...notifications];
    
    const updatedNotifications = notifications.map(b => {
        if (b.id === notificationId) {
          const isLiked = b.likedBy.includes(currentUser.id)
          return {
            ...b,
            likes: isLiked ? b.likes - 1 : b.likes + 1,
            likedBy: isLiked ? b.likedBy.filter(id => id !== currentUser.id) : [...b.likedBy, currentUser.id]
          };
        }
        return b
      });

    setNotifications(updatedNotifications);
     if (selectedNotification && selectedNotification.id === notificationId) {
        setSelectedNotification(updatedNotifications.find(n => n.id === notificationId) || null);
    }

    fetch(`/api/notifications/${notificationId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Failed to update like status");
        }
        return res.json();
    })
    .then(updatedNotificationFromServer => {
        // Sync with server state
        setNotifications(prev => 
          prev.map(n => n.id === updatedNotificationFromServer.id ? updatedNotificationFromServer : n)
        );
        if (selectedNotification && selectedNotification.id === updatedNotificationFromServer.id) {
            setSelectedNotification(updatedNotificationFromServer);
        }
    })
    .catch(error => {
        console.error(error);
        setNotifications(originalNotifications); // Revert on error
    });
  }

  const handleDelete = (notificationId: string) => {
    setNotifications(prevNotifications => prevNotifications.filter(b => b.id !== notificationId));
    if (selectedNotification && selectedNotification.id === notificationId) {
      setSelectedNotification(null);
    }
  }
  
  const handleAddComment = (notificationId: string, commentText: string) => {
    const tempId = `temp-comment-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      text: commentText,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    const updateUI = (updater: (prev: Notification[]) => Notification[]) => {
      setNotifications(updater);
      if (selectedNotification) {
        setSelectedNotification(prev => prev ? {...prev, comments: updater([prev])[0].comments} : null);
      }
    };

    updateUI(prev => prev.map(n => 
      n.id === notificationId ? { ...n, comments: [...n.comments, optimisticComment] } : n
    ));

    fetch(`/api/notifications/${notificationId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentText, user: currentUser }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save comment');
      return res.json();
    })
    .then(savedComment => {
      updateUI(prev => prev.map(n => 
        n.id === notificationId ? { ...n, comments: n.comments.map(c => c.id === tempId ? savedComment : c) } : n
      ));
    })
    .catch(error => {
      console.error(error);
      updateUI(prev => prev.map(n => 
        n.id === notificationId ? { ...n, comments: n.comments.filter(c => c.id !== tempId) } : n
      ));
    });
  }
  
  const handleAddReply = (notificationId: string, commentId: string, replyText: string) => {
    const tempId = `temp-reply-${Date.now()}`;
    const optimisticReply: Comment = {
      id: tempId,
      user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      text: replyText,
      timestamp: new Date().toISOString(),
    };

    const updateUI = (updater: (prev: Notification[]) => Notification[]) => {
      setNotifications(updater);
      if (selectedNotification) {
        const updatedSelected = updater([selectedNotification])[0];
        setSelectedNotification(updatedSelected);
      }
    };
    
    const originalNotifications = JSON.parse(JSON.stringify(notifications));

    updateUI(prev => prev.map(n => {
      if (n.id === notificationId) {
        return {
          ...n,
          comments: n.comments.map(c => {
            if (c.id === commentId) {
              return { ...c, replies: [...(c.replies || []), optimisticReply] };
            }
            return c;
          })
        };
      }
      return n;
    }));

    fetch(`/api/notifications/${notificationId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyText, user: currentUser }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save reply');
      return res.json();
    })
    .then(savedReply => {
      updateUI(prev => prev.map(n => {
        if (n.id === notificationId) {
          return {
            ...n,
            comments: n.comments.map(c => {
              if (c.id === commentId) {
                return { ...c, replies: (c.replies || []).map(r => r.id === tempId ? savedReply : r) };
              }
              return c;
            })
          };
        }
        return n;
      }));
    })
    .catch(error => {
      console.error(error);
      setNotifications(originalNotifications);
      if (selectedNotification) {
        setSelectedNotification(originalNotifications.find((n: Notification) => n.id === selectedNotification.id) || null);
      }
    });
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
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
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
        >
             <CreateNotificationDialog 
                onSave={handleAddNotification} 
                open={isCreateDialogOpen} 
                onOpenChange={setIsCreateDialogOpen}
              >
                <Button size="sm" className="gap-1" onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Create Notification</span>
                </Button>
            </CreateNotificationDialog>
        </AppHeader>
        <main className="p-4 sm:p-6">
          {loading ? renderLoadingState() : (
            selectedNotification ? (
              <div className="mx-auto">
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
                <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
                    <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search notifications..."
                        className="w-full rounded-lg bg-background pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                      <DatePicker 
                        date={filterStartDate} 
                        onDateChange={setFilterStartDate} 
                        placeholder="Start date" 
                        disabled={{ after: filterEndDate }}
                        className="w-full md:w-auto"
                      />
                      <DatePicker 
                        date={filterEndDate} 
                        onDateChange={setFilterEndDate} 
                        placeholder="End date" 
                        disabled={{ before: filterStartDate }}
                        className="w-full md:w-auto"
                      />
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                      <Label htmlFor="sort-by" className="text-sm font-medium shrink-0">Sort by:</Label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-[180px]" id="sort-by">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Most Recent">Most Recent</SelectItem>
                          <SelectItem value="Most Liked">Most Liked</SelectItem>
                          <SelectItem value="Most Commented">Most Commented</SelectItem>
                          <SelectItem value="Most Viewed">Most Viewed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-full md:w-auto items-center gap-2">
                      <Label htmlFor="page-size" className="shrink-0">Show:</Label>
                      <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-full md:w-[70px]" id="page-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 20, 50].map(size => (
                            <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  </div>
                </div>
                <NotificationFeed 
                  searchQuery={searchQuery}
                  notifications={notifications}
                  onSelectNotification={handleSelectNotification}
                  dateRange={{from: filterStartDate, to: filterEndDate}}
                  sortBy={sortBy}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  setCurrentPage={setCurrentPage}
                  setPageSize={setPageSize}
                />
              </>
            )
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}

    