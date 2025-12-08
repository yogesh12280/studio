'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { GrievanceManagement } from '@/components/grievance-management'
import { EmployeeGrievanceView } from '@/components/employee-grievance-view'
import type { Grievance, GrievanceComment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CalendarIcon } from 'lucide-react'
import { GrievanceCard } from '@/components/grievance-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { RegisterGrievanceDialog } from '@/components/register-grievance-dialog'
import { DeleteGrievanceDialog } from '@/components/delete-grievance-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format, parse } from 'date-fns'
import { cn } from '@/lib/utils'

export default function GrievancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isBirthdateVerified, setIsBirthdateVerified] = useState(false);
  const [birthdateInput, setBirthdateInput] = useState<Date | undefined>();
  const [birthdateInputString, setBirthdateInputString] = useState<string>('');
  const [grievanceToEdit, setGrievanceToEdit] = useState<Grievance | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [grievanceToDelete, setGrievanceToDelete] = useState<Grievance | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/grievances');
        if (!response.ok) throw new Error("Failed to fetch grievances");
        const data = await response.json();
        setGrievances(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error fetching grievances',
          description: (error as Error).message
        });
      } finally {
        setLoading(false);
      }
    };
    fetchGrievances();
  }, [toast]);

  useEffect(() => {
    if (birthdateInput) {
      setBirthdateInputString(format(birthdateInput, 'dd/MM/yyyy'));
    }
  }, [birthdateInput]);

  if (!currentUser) return null;


  const handleAddGrievance = async (newGrievanceData: Omit<Grievance, 'id' | 'createdAt' | 'comments'>) => {
    const optimisticGrievance: Grievance = {
      ...newGrievanceData,
      id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    setGrievances(prev => [optimisticGrievance, ...prev]);

    try {
      const response = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGrievanceData),
      });
      if (!response.ok) throw new Error('Failed to save grievance');
      const savedGrievance = await response.json();
      setGrievances(prev => prev.map(g => (g.id === optimisticGrievance.id ? savedGrievance : g)));
    } catch (error) {
      console.error(error);
      setGrievances(prev => prev.filter(g => g.id !== optimisticGrievance.id));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not save grievance. Please try again.',
      });
    }
  }
  
  const handleEditGrievance = async (updatedGrievance: Grievance) => {
    const originalGrievances = [...grievances];
    setGrievances(prev => prev.map(g => (g.id === updatedGrievance.id ? updatedGrievance : g)));
    setGrievanceToEdit(null);
    setIsEditOpen(false);

    try {
      const response = await fetch(`/api/grievances/${updatedGrievance.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGrievance),
      });
      if (!response.ok) throw new Error('Failed to update grievance');
      const savedGrievance = await response.json();
      setGrievances(prev => prev.map(g => (g.id === savedGrievance.id ? savedGrievance : g)));
    } catch (error) {
      console.error(error);
      setGrievances(originalGrievances);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update grievance. Please try again.',
      });
    }
  };
  
  const handleDeleteGrievance = async (grievanceId: string) => {
    const originalGrievances = [...grievances];
    setGrievances(prev => prev.filter(g => g.id !== grievanceId));
    setGrievanceToDelete(null);
    setIsDeleteOpen(false);

    try {
      const response = await fetch(`/api/grievances/${grievanceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete grievance');
    } catch (error) {
      console.error(error);
      setGrievances(originalGrievances);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete grievance. Please try again.',
      });
    }
  };

  const openEditDialog = (grievance: Grievance) => {
    setGrievanceToEdit(grievance);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (grievance: Grievance) => {
    setGrievanceToDelete(grievance);
    setIsDeleteOpen(true);
  };


  const handleStatusChange = async (
    grievanceId: string,
    newStatus: Grievance['status'],
    comment?: string
  ) => {
    const originalGrievances = [...grievances];
    const updateUI = (updater: (prev: Grievance[]) => Grievance[]) => {
      setGrievances(updater);
      if (selectedGrievance?.id === grievanceId) {
        setSelectedGrievance(prev => prev ? {...updater([prev])[0]} : null);
      }
    };
    
    updateUI(prev => prev.map(g => {
        if (g.id === grievanceId) {
          const newCommentEntry: GrievanceComment | undefined = comment ? {
            id: `g-comment-temp-${Date.now()}`,
            text: comment,
            user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
            author: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
            createdAt: new Date().toISOString(),
            status: newStatus,
            replies: [],
          } : undefined;
          return {
            ...g,
            status: newStatus,
            resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : g.resolvedAt,
            comments: newCommentEntry ? [...(g.comments || []), newCommentEntry] : g.comments,
          };
        }
        return g;
      })
    );

    try {
        const response = await fetch(`/api/grievances/${grievanceId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newStatus, comment, user: currentUser }),
        });
        if (!response.ok) throw new Error('Failed to update status');
        const updatedGrievanceFromServer = await response.json();
        
        setGrievances(prev => prev.map(g => g.id === grievanceId ? updatedGrievanceFromServer : g));
         if (selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(updatedGrievanceFromServer);
        }

    } catch (error) {
        console.error(error);
        setGrievances(originalGrievances);
        if (selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(originalGrievances.find(g => g.id === grievanceId) || null);
        }
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update status. Please try again.",
        });
    }
  }

  const handleAddComment = async (grievanceId: string, commentText: string) => {
    const optimisticComment: GrievanceComment = {
      id: `g-comment-temp-${Date.now()}`,
      text: commentText,
      user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      author: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      createdAt: new Date().toISOString(),
      replies: [],
    };
    
    const originalGrievances = JSON.parse(JSON.stringify(grievances));

    const updateUI = (updater: (prev: Grievance[]) => Grievance[]) => {
        setGrievances(updater);
        if (selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(prev => prev ? {...updater([prev])[0]} : null);
        }
    };
    
    updateUI(prev => prev.map(g => 
        g.id === grievanceId ? { ...g, comments: [...(g.comments || []), optimisticComment] } : g
    ));

    try {
        const response = await fetch(`/api/grievances/${grievanceId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commentText, user: currentUser }),
        });
        if (!response.ok) throw new Error('Failed to add comment');
        const updatedGrievanceFromServer = await response.json();

        setGrievances(prev => prev.map(g => g.id === grievanceId ? updatedGrievanceFromServer : g));
        if (selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(updatedGrievanceFromServer);
        }

    } catch (error) {
        console.error(error);
        setGrievances(originalGrievances);
        if (selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(originalGrievances.find((g: Grievance) => g.id === grievanceId) || null);
        }
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add comment. Please try again.",
        });
    }
  };

  const handleAddReply = async (grievanceId: string, commentId: string, replyText: string) => {
    const originalGrievances = JSON.parse(JSON.stringify(grievances));

    const optimisticReply: GrievanceComment = {
      id: `g-reply-temp-${Date.now()}`,
      text: replyText,
      user: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      author: { name: currentUser.name, avatarUrl: currentUser.avatarUrl },
      createdAt: new Date().toISOString(),
      parentId: commentId,
      replies: [],
    };

    const addReplyRecursively = (comments: GrievanceComment[]): GrievanceComment[] => {
      return comments.map(c => {
        if (c.id === commentId) {
          return { ...c, replies: [...(c.replies || []), optimisticReply] };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: addReplyRecursively(c.replies) };
        }
        return c;
      });
    };
    
    const updateUI = (updater: (prev: Grievance[]) => Grievance[]) => {
      setGrievances(updater);
      if (selectedGrievance?.id === grievanceId) {
        const newSelected = updater([selectedGrievance])[0];
        setSelectedGrievance(newSelected);
      }
    };
    
    updateUI(prevGrievances => prevGrievances.map(g => {
        if (g.id === grievanceId) {
            return {...g, comments: addReplyRecursively(g.comments || [])}
        }
        return g;
    }));

    try {
        const response = await fetch(`/api/grievances/${grievanceId}/comments/${commentId}/replies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ replyText, user: currentUser }),
        });
        if (!response.ok) throw new Error('Failed to add reply');
        const updatedGrievanceFromServer = await response.json();
        
        setGrievances(prev => prev.map(g => g.id === grievanceId ? updatedGrievanceFromServer : g));
        if (selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(updatedGrievanceFromServer);
        }
    } catch (error) {
        console.error(error);
        setGrievances(originalGrievances);
         if (selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(originalGrievances.find((g: Grievance) => g.id === grievanceId) || null);
        }
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add reply. Please try again.",
        });
    }
  };

  const handleSelectGrievance = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
  };

  const handleBackToList = () => {
    setSelectedGrievance(null);
  };

  const handleBirthdateVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthdateInput) {
      const formattedInput = format(birthdateInput, 'yyyy-MM-dd');
      if (formattedInput === currentUser.birthdate) {
        setIsBirthdateVerified(true);
        toast({
          title: "Verification Successful",
          description: "You can now access your grievances.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: "The birthdate you entered is incorrect. Please try again.",
        });
      }
    } else {
        toast({
            variant: "destructive",
            title: "Missing Birthdate",
            description: "Please select your birthdate.",
        });
    }
  };
  
  const handleBirthdateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    let formattedValue = '';
  
    if (rawValue.length > 0) {
      formattedValue = rawValue.substring(0, 2);
    }
    if (rawValue.length > 2) {
      formattedValue += '/' + rawValue.substring(2, 4);
    }
    if (rawValue.length > 4) {
      formattedValue += '/' + rawValue.substring(4, 8);
    }
    
    setBirthdateInputString(formattedValue);

    if (formattedValue.length === 10) {
        try {
            const parsedDate = parse(formattedValue, 'dd/MM/yyyy', new Date());
            if (!isNaN(parsedDate.getTime())) {
              setBirthdateInput(parsedDate);
            } else {
              setBirthdateInput(undefined);
            }
        } catch(e) {
            setBirthdateInput(undefined)
        }
    } else {
        setBirthdateInput(undefined);
    }
  };

  const renderAdminLoadingState = () => (
     <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-6 w-32" /></TableCell>
              <TableCell><Skeleton className="h-6 w-48" /></TableCell>
              <TableCell><Skeleton className="h-6 w-24" /></TableCell>
              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderEmployeeLoadingState = () => (
    <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
        ))}
    </div>
  );

  const renderEmployeeView = () => {
    if (currentUser.role === 'Employee' && !isBirthdateVerified) {
      return (
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Verify Your Identity</CardTitle>
              <CardDescription>Please enter your birthdate to access the grievance section.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBirthdateVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birthdate</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <Input
                          id="birthdate"
                          placeholder="dd/mm/yyyy"
                          value={birthdateInputString}
                          onChange={handleBirthdateInputChange}
                          maxLength={10}
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={birthdateInput}
                        onSelect={setBirthdateInput}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button type="submit" className="w-full">Verify</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    if (selectedGrievance) {
        return (
             <div className="max-w-2xl mx-auto">
                <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to all grievances
                </Button>
                <GrievanceCard 
                    grievance={selectedGrievance} 
                    onAddComment={handleAddComment}
                    onAddReply={handleAddReply}
                    getStatusVariant={getBadgeVariant}
                />
             </div>
        )
    }
    
    return (
        loading ? renderEmployeeLoadingState() :
        <EmployeeGrievanceView 
          searchQuery={searchQuery} 
          grievances={grievances.filter(g => g.employeeId === currentUser.id)}
          onAddGrievance={(data) => handleAddGrievance({
            ...data,
            employeeId: currentUser.id,
            employeeName: currentUser.name,
            employeeAvatarUrl: currentUser.avatarUrl,
          })}
          onSelectGrievance={handleSelectGrievance}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          getStatusVariant={getBadgeVariant}
        />
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Grievance"
        />
        <main className="p-4 sm:p-6">
          {currentUser.role === 'Admin' ? (
             loading ? renderAdminLoadingState() : 
             <GrievanceManagement 
              searchQuery={searchQuery} 
              grievances={grievances}
              onStatusChange={handleStatusChange}
              onAddComment={handleAddComment}
              onAddReply={handleAddReply}
            />
          ) : (
             renderEmployeeView()
          )}
        </main>
        {grievanceToEdit && (
            <RegisterGrievanceDialog
                mode="edit"
                grievanceToEdit={grievanceToEdit}
                onGrievanceSubmit={handleEditGrievance}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        )}
        {grievanceToDelete && (
            <DeleteGrievanceDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={() => handleDeleteGrievance(grievanceToDelete.id)}
                grievance={grievanceToDelete}
            />
        )}
      </div>
    </SidebarProvider>
  )
}


const getBadgeVariant = (status: Grievance['status']) => {
    switch (status) {
      case 'Pending':
        return 'destructive' as const
      case 'In Progress':
        return 'secondary' as const
      case 'Resolved':
        return 'default' as const
      default:
        return 'outline' as const
    }
  }

    

    

    

