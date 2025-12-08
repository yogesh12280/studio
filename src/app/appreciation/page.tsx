
'use client'

import { useState, useMemo, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { initialAppreciations } from '@/lib/data'
import type { Appreciation } from '@/lib/types'
import { CreateAppreciationDialog } from '@/components/create-appreciation-dialog'
import { DeleteAppreciationDialog } from '@/components/delete-appreciation-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { DatePicker } from '@/components/ui/date-picker'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AppreciationList } from '@/components/appreciation-list'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'

export default function AppreciationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [appreciations, setAppreciations] = useState<Appreciation[]>([])
  const [appreciationToEdit, setAppreciationToEdit] = useState<Appreciation | null>(null)
  const [appreciationToDelete, setAppreciationToDelete] = useState<Appreciation | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(1);


  useEffect(() => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setAppreciations(initialAppreciations);
      setLoading(false);
    }, 1000);

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    setStartDate(oneYearAgo);
    setEndDate(today);
  }, []);

  if (!currentUser) return null;

  const handleAddAppreciation = (newAppreciationData: Omit<Appreciation, 'id' | 'fromUser' | 'createdAt' | 'likes' | 'likedBy'>) => {
    const newAppreciation: Appreciation = {
      id: `appreciation-${Date.now()}`,
      fromUser: {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      ...newAppreciationData,
    }
    setAppreciations(prev => [newAppreciation, ...prev])
  }
  
  const handleEditAppreciation = (updatedAppreciation: Appreciation) => {
    setAppreciations(prev => prev.map(a => a.id === updatedAppreciation.id ? updatedAppreciation : a));
    setAppreciationToEdit(null);
    setIsEditOpen(false);
  }

  const handleDeleteAppreciation = (appreciationId: string) => {
    setAppreciations(prev => prev.filter(a => a.id !== appreciationId));
    setAppreciationToDelete(null);
    setIsDeleteOpen(false);
  }

  const handleLikeToggle = (appreciationId: string) => {
    setAppreciations(prevAppreciations =>
      prevAppreciations.map(a => {
        if (a.id === appreciationId) {
          const isLiked = a.likedBy.includes(currentUser.id)
          return {
            ...a,
            likes: isLiked ? a.likes - 1 : a.likes + 1,
            likedBy: isLiked ? a.likedBy.filter(id => id !== currentUser.id) : [...a.likedBy, currentUser.id],
          }
        }
        return a
      })
    )
  }
  
  const openEditDialog = (appreciation: Appreciation) => {
    setAppreciationToEdit(appreciation);
    setIsEditOpen(true);
  }

  const openDeleteDialog = (appreciation: Appreciation) => {
    setAppreciationToDelete(appreciation);
    setIsDeleteOpen(true);
  }

  const filteredAppreciations = useMemo(() => {
    return appreciations
      .filter(appreciation => {
        const searchLower = searchQuery.toLowerCase()
        const textMatch = (
          appreciation.message.toLowerCase().includes(searchLower) ||
          appreciation.fromUser.name.toLowerCase().includes(searchLower) ||
          appreciation.toUser.name.toLowerCase().includes(searchLower)
        )

        const dateMatch = (() => {
            if (!startDate && !endDate) return true;
            const appreciationDate = new Date(appreciation.createdAt);
            const start = startDate ? startOfDay(startDate) : undefined;
            const end = endDate ? endOfDay(endDate) : undefined;
            if (start && end) {
                return isWithinInterval(appreciationDate, { start, end });
            }
            if (start) {
                return appreciationDate >= start;
            }
            if (end) {
                return appreciationDate <= end;
            }
            return true;
        })();
        
        return textMatch && dateMatch
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [appreciations, searchQuery, startDate, endDate])

  const paginatedAppreciations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAppreciations.slice(startIndex, startIndex + pageSize);
  }, [filteredAppreciations, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredAppreciations.length / pageSize);


  const renderLoadingState = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          <Skeleton className="h-16 w-full mt-4" />
          <div className="flex justify-between items-center mt-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Appreciation"
          onAddAppreciation={handleAddAppreciation}
        />
        <main className="p-4 sm:p-6 space-y-4">
            {loading ? renderLoadingState() : (
              <>
                <div className="mb-4 flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search appreciations..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <DatePicker 
                      date={startDate} 
                      onDateChange={setStartDate} 
                      placeholder="Start date" 
                      disabled={{ after: endDate }}
                    />
                    <DatePicker 
                      date={endDate} 
                      onDateChange={setEndDate} 
                      placeholder="End date" 
                      disabled={{ before: startDate }}
                    />
                </div>
                <AppreciationList
                    appreciations={paginatedAppreciations}
                    onLikeToggle={handleLikeToggle}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                    totalAppreciations={filteredAppreciations.length}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
              </>
            )}
        </main>
        {appreciationToEdit && (
          <CreateAppreciationDialog
            mode="edit"
            appreciationToEdit={appreciationToEdit}
            onSave={handleEditAppreciation}
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
          />
        )}
        {appreciationToDelete && (
          <DeleteAppreciationDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={() => handleDeleteAppreciation(appreciationToDelete.id)}
            appreciation={appreciationToDelete}
          />
        )}
      </div>
    </SidebarProvider>
  )
}
