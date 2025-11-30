'use client'

import { useState, useMemo } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { initialAppreciations } from '@/lib/data'
import type { Appreciation } from '@/lib/types'
import { AppreciationCard } from '@/components/appreciation-card'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateAppreciationDialog } from '@/components/create-appreciation-dialog'
import { DeleteAppreciationDialog } from '@/components/delete-appreciation-dialog'

export default function AppreciationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [appreciations, setAppreciations] = useState<Appreciation[]>(initialAppreciations)
  const [appreciationToEdit, setAppreciationToEdit] = useState<Appreciation | null>(null)
  const [appreciationToDelete, setAppreciationToDelete] = useState<Appreciation | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

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
        return (
          appreciation.message.toLowerCase().includes(searchLower) ||
          appreciation.fromUser.name.toLowerCase().includes(searchLower) ||
          appreciation.toUser.name.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [appreciations, searchQuery])

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
            {filteredAppreciations.map(appreciation => (
                <AppreciationCard 
                    key={appreciation.id}
                    appreciation={appreciation}
                    onLikeToggle={handleLikeToggle}
                    onEdit={() => openEditDialog(appreciation)}
                    onDelete={() => openDeleteDialog(appreciation)}
                />
            ))}
            {filteredAppreciations.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                    No appreciations yet. Be the first to send one!
                </div>
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
