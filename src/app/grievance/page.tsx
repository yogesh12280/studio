'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { GrievanceManagement } from '@/components/grievance-management'
import { EmployeeGrievanceView } from '@/components/employee-grievance-view'
import { initialGrievances } from '@/lib/data'
import type { Grievance } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { GrievanceCard } from '@/components/grievance-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { RegisterGrievanceDialog } from '@/components/register-grievance-dialog'
import { DeleteGrievanceDialog } from '@/components/delete-grievance-dialog'
import { Skeleton } from '@/components/ui/skeleton'

export default function GrievancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [grievances, setGrievances] = useState<Grievance[]>([])
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isBirthdateVerified, setIsBirthdateVerified] = useState(false);
  const [birthdateInput, setBirthdateInput] = useState('');
  const [grievanceToEdit, setGrievanceToEdit] = useState<Grievance | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [grievanceToDelete, setGrievanceToDelete] = useState<Grievance | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setGrievances(initialGrievances);
      setLoading(false);
    }, 1000);
  }, []);

  if (!currentUser) return null;


  const handleAddGrievance = (newGrievanceData: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => {
    const newGrievance: Grievance = {
      id: `grievance-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatarUrl: currentUser.avatarUrl,
      createdAt: new Date().toISOString(),
      comments: [],
      ...newGrievanceData,
    }
    setGrievances(prev => [newGrievance, ...prev])
  }
  
  const handleEditGrievance = (updatedGrievance: Grievance) => {
    setGrievances(prev => prev.map(g => (g.id === updatedGrievance.id ? updatedGrievance : g)));
    setGrievanceToEdit(null);
    setIsEditOpen(false);
  };
  
  const handleDeleteGrievance = (grievanceId: string) => {
    setGrievances(prev => prev.filter(g => g.id !== grievanceId));
    setGrievanceToDelete(null);
    setIsDeleteOpen(false);
  };

  const openEditDialog = (grievance: Grievance) => {
    setGrievanceToEdit(grievance);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (grievance: Grievance) => {
    setGrievanceToDelete(grievance);
    setIsDeleteOpen(true);
  };


  const handleStatusChange = (
    grievanceId: string,
    newStatus: Grievance['status'],
    comment?: string
  ) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id === grievanceId) {
          const newComment = comment ? {
            id: `g-comment-${Date.now()}`,
            text: comment,
            author: {
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
            },
            createdAt: new Date().toISOString(),
            status: newStatus,
          } : undefined;

          const updatedComments = newComment ? [...(g.comments || []), newComment] : g.comments;

          const updatedGrievance = {
              ...g,
              status: newStatus,
              resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : g.resolvedAt,
              comments: updatedComments,
            };
            if(selectedGrievance?.id === grievanceId) {
                setSelectedGrievance(updatedGrievance);
            }
            return updatedGrievance;
        }
        return g
      }
      )
    )
  }

  const handleAddComment = (grievanceId: string, commentText: string) => {
    setGrievances(prevGrievances =>
      prevGrievances.map(g => {
        if (g.id === grievanceId) {
          const newComment = {
            id: `g-comment-${Date.now()}`,
            text: commentText,
            author: {
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
            },
            createdAt: new Date().toISOString(),
          };
          const updatedGrievance = {
            ...g,
            comments: [...(g.comments || []), newComment],
          };

          if(selectedGrievance?.id === grievanceId) {
            setSelectedGrievance(updatedGrievance);
          }

          return updatedGrievance;
        }
        return g;
      })
    );
  };

  const handleSelectGrievance = (grievance: Grievance) => {
    setSelectedGrievance(grievance);
  };

  const handleBackToList = () => {
    setSelectedGrievance(null);
  };

  const handleBirthdateVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (birthdateInput === currentUser.birthdate) {
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
              <CardDescription>Please enter your birthdate (YYYY-MM-DD) to access the grievance section.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBirthdateVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birthdate</Label>
                  <Input 
                    id="birthdate"
                    type="text" 
                    placeholder="YYYY-MM-DD"
                    value={birthdateInput}
                    onChange={(e) => setBirthdateInput(e.target.value)}
                    required
                  />
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
          onAddGrievance={handleAddGrievance}
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
