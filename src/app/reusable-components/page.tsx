'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { ReusableComponentFeed } from '@/components/reusable-component-feed'
import { useUser } from '@/contexts/user-context'
import type { ReusableComponent, Comment } from '@/lib/types'
import { ReusableComponentCard } from '@/components/reusable-component-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, PlusCircle } from 'lucide-react'
import { FeaturedReusableComponents } from '@/components/featured-reusable-components'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { CreateReusableComponentDialog } from '@/components/create-reusable-component-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DeleteReusableComponentDialog } from '@/components/delete-reusable-component-dialog'

export default function ReusableComponentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [components, setComponents] = useState<ReusableComponent[]>([])
  const { currentUser } = useUser()
  const [selectedComponent, setSelectedComponent] = useState<ReusableComponent | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState('Most Recent');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [componentToEdit, setComponentToEdit] = useState<ReusableComponent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<ReusableComponent | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/reusable-components');
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error("Failed to fetch components:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    setFilterStartDate(oneYearAgo);
    setFilterEndDate(today);

    fetchComponents();
  }, []);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  }

  if (!currentUser) return null;

  const handleAddComponent = async (newComponentData: Omit<ReusableComponent, 'id' | 'registeredBy' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'registeredDate'>) => {
    const fullComponentData = {
        ...newComponentData,
        registeredBy: {
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
        },
    };
    
    const tempId = `temp-${Date.now()}`;
    const optimisticComponent: ReusableComponent = {
      ...fullComponentData,
      id: tempId,
      likes: 0,
      likedBy: [],
      viewers: 0,
      viewedBy: [],
      comments: [],
      registeredDate: new Date().toISOString(),
    };
    setComponents(prev => [optimisticComponent, ...prev]);

    try {
        const response = await fetch('/api/reusable-components', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fullComponentData),
        });
        const savedComponent = await response.json();
        setComponents(prev => prev.map(c => c.id === tempId ? savedComponent : c));
    } catch (error) {
        console.error("Failed to save component:", error);
        setComponents(prev => prev.filter(c => c.id !== tempId));
    }
  }
  
  const handleEditComponent = async (updatedComponent: ReusableComponent) => {
    const originalComponents = [...components];
    setComponents(prev => prev.map(c => (c.id === updatedComponent.id ? updatedComponent : c)));
    if (selectedComponent?.id === updatedComponent.id) {
        setSelectedComponent(updatedComponent);
    }
    setIsEditDialogOpen(false);

    try {
      const response = await fetch(`/api/reusable-components/${updatedComponent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedComponent),
      });
      if (!response.ok) throw new Error('Failed to update component');
      const savedComponent = await response.json();
       setComponents(prev => prev.map(c => (c.id === savedComponent.id ? savedComponent : c)));
       if (selectedComponent?.id === savedComponent.id) {
          setSelectedComponent(savedComponent);
      }
    } catch (error) {
      console.error(error);
      setComponents(originalComponents);
    }
  };

  const handleDelete = async (componentId: string) => {
    const originalComponents = [...components];
    setComponents(prev => prev.filter(c => c.id !== componentId));
    if (selectedComponent?.id === componentId) {
        setSelectedComponent(null);
    }
    setIsDeleteDialogOpen(false);
    
    try {
      const response = await fetch(`/api/reusable-components/${componentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete component');
    } catch (error) {
      console.error(error);
      setComponents(originalComponents);
    }
  }
  
  const handleLikeToggle = (componentId: string) => {
    const originalComponents = [...components];
    
    const updatedComponents = components.map(c => {
        if (c.id === componentId) {
          const isLiked = c.likedBy.includes(currentUser.id)
          return {
            ...c,
            likes: isLiked ? c.likes - 1 : c.likes + 1,
            likedBy: isLiked ? c.likedBy.filter(id => id !== currentUser.id) : [...c.likedBy, currentUser.id]
          };
        }
        return c
      });

    setComponents(updatedComponents);
     if (selectedComponent && selectedComponent.id === componentId) {
        setSelectedComponent(updatedComponents.find(c => c.id === componentId) || null);
    }

    fetch(`/api/reusable-components/${componentId}/like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to update like status");
        return res.json();
    })
    .then(updatedComponentFromServer => {
        setComponents(prev => 
          prev.map(c => c.id === updatedComponentFromServer.id ? updatedComponentFromServer : c)
        );
        if (selectedComponent && selectedComponent.id === updatedComponentFromServer.id) {
            setSelectedComponent(updatedComponentFromServer);
        }
    })
    .catch(error => {
        console.error(error);
        setComponents(originalComponents);
    });
  }
  
  const handleAddComment = (componentId: string, commentText: string) => {
    const tempId = `temp-comment-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      text: commentText,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    const updateUI = (updater: (prev: ReusableComponent[]) => ReusableComponent[]) => {
      setComponents(updater);
      if (selectedComponent) {
        setSelectedComponent(prev => prev ? {...prev, comments: updater([prev])[0].comments} : null);
      }
    };

    updateUI(prev => prev.map(c => 
      c.id === componentId ? { ...c, comments: [...c.comments, optimisticComment] } : c
    ));

    fetch(`/api/reusable-components/${componentId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentText, user: currentUser }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save comment');
      return res.json();
    })
    .then(savedComment => {
      updateUI(prev => prev.map(c => 
        c.id === componentId ? { ...c, comments: c.comments.map(comment => comment.id === tempId ? savedComment : comment) } : c
      ));
    })
    .catch(error => {
      console.error(error);
      updateUI(prev => prev.map(c => 
        c.id === componentId ? { ...c, comments: c.comments.filter(c => c.id !== tempId) } : c
      ));
    });
  }
  
  const handleAddReply = (componentId: string, commentId: string, replyText: string) => {
    const tempId = `temp-reply-${Date.now()}`;
    const optimisticReply: Comment = {
      id: tempId,
      user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      text: replyText,
      timestamp: new Date().toISOString(),
    };

    const updateUI = (updater: (prev: ReusableComponent[]) => ReusableComponent[]) => {
      setComponents(updater);
      if (selectedComponent) {
        const updatedSelected = updater([selectedComponent])[0];
        setSelectedComponent(updatedSelected);
      }
    };
    
    const originalComponents = JSON.parse(JSON.stringify(components));

    updateUI(prev => prev.map(c => {
      if (c.id === componentId) {
        return {
          ...c,
          comments: c.comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, replies: [...(comment.replies || []), optimisticReply] };
            }
            return comment;
          })
        };
      }
      return c;
    }));

    fetch(`/api/reusable-components/${componentId}/comments/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ replyText, user: currentUser }),
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to save reply');
      return res.json();
    })
    .then(savedReply => {
      updateUI(prev => prev.map(c => {
        if (c.id === componentId) {
          return {
            ...c,
            comments: c.comments.map(comment => {
              if (comment.id === commentId) {
                return { ...comment, replies: (comment.replies || []).map(r => r.id === tempId ? savedReply : r) };
              }
              return comment;
            })
          };
        }
        return c;
      }));
    })
    .catch(error => {
      console.error(error);
      setComponents(originalComponents);
      if (selectedComponent) {
        setSelectedComponent(originalComponents.find((c: ReusableComponent) => c.id === selectedComponent.id) || null);
      }
    });
  };

  const handleSelectComponent = (component: ReusableComponent) => {
    setSelectedComponent(component);
  };
  
  const openEditDialog = (component: ReusableComponent) => {
    setComponentToEdit(component);
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (component: ReusableComponent) => {
    setComponentToDelete(component);
    setIsDeleteDialogOpen(true);
  };

  const handleBackToList = () => {
    setSelectedComponent(null);
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
          title="Reusable Components"
        >
             <CreateReusableComponentDialog 
                onSave={handleAddComponent} 
                open={isCreateDialogOpen} 
                onOpenChange={setIsCreateDialogOpen}
              >
                <Button size="sm" className="gap-1" onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Register Component</span>
                </Button>
            </CreateReusableComponentDialog>
        </AppHeader>
        <main className="p-4 sm:p-6">
          {loading ? renderLoadingState() : (
            selectedComponent ? (
              <div className="mx-auto">
                <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to all components
                </Button>
                <ReusableComponentCard 
                  component={selectedComponent}
                  onLikeToggle={handleLikeToggle}
                  onDelete={() => openDeleteDialog(selectedComponent)}
                  onAddComment={handleAddComment}
                  onEdit={() => openEditDialog(selectedComponent)}
                  onAddReply={handleAddReply}
                  currentUser={currentUser}
                />
              </div>
            ) : (
              <>
                <FeaturedReusableComponents components={components} onSelectComponent={handleSelectComponent} />
                <div className="mb-4 flex flex-col md:flex-row items-center gap-2">
                    <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search components..."
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
                          <SelectItem value="Most Utilized">Most Utilized</SelectItem>
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
                <ReusableComponentFeed
                  searchQuery={searchQuery}
                  components={components}
                  onSelectComponent={handleSelectComponent}
                  dateRange={{from: filterStartDate, to: filterEndDate}}
                  sortBy={sortBy}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  setCurrentPage={setCurrentPage}
                />
              </>
            )
          )}
        </main>
         {componentToEdit && (
          <CreateReusableComponentDialog
            mode="edit"
            componentToEdit={componentToEdit}
            onSave={handleEditComponent}
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
          />
        )}
        {componentToDelete && (
          <DeleteReusableComponentDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={() => handleDelete(componentToDelete.id)}
            component={componentToDelete}
          />
        )}
      </div>
    </SidebarProvider>
  )
}
