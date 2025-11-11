'use client'

import { useState } from 'react'
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

export default function GrievancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [grievances, setGrievances] = useState<Grievance[]>(initialGrievances)
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [isBirthdateVerified, setIsBirthdateVerified] = useState(false);
  const [birthdateInput, setBirthdateInput] = useState('');
  const { toast } = useToast();


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
        <EmployeeGrievanceView 
          searchQuery={searchQuery} 
          grievances={grievances.filter(g => g.employeeId === currentUser.id)}
          onAddGrievance={handleAddGrievance}
          onSelectGrievance={handleSelectGrievance}
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
