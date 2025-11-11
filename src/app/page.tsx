'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { BulletinFeed } from '@/components/bulletin-feed'
import { initialBulletins } from '@/lib/data'
import { useUser } from '@/contexts/user-context'
import type { Bulletin } from '@/lib/types'
import { BulletinCard } from '@/components/bulletin-card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function SEMBBlastPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [bulletins, setBulletins] = useState<Bulletin[]>(initialBulletins)
  const { currentUser } = useUser()
  const [selectedBulletin, setSelectedBulletin] = useState<Bulletin | null>(null);

  const handleAddBulletin = (newBulletinData: Omit<Bulletin, 'id' | 'author' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'createdAt'>) => {
    const newBulletin: Bulletin = {
        id: `bulletin-${Date.now()}`,
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
        ...newBulletinData,
    }
    setBulletins(prev => [newBulletin, ...prev])
  }
  
  const handleEditBulletin = (updatedBulletin: Bulletin) => {
    setBulletins(prevBulletins =>
      prevBulletins.map(b =>
        b.id === updatedBulletin.id ? updatedBulletin : b
      )
    );
    if (selectedBulletin && selectedBulletin.id === updatedBulletin.id) {
      setSelectedBulletin(updatedBulletin);
    }
  };


  const handleLikeToggle = (bulletinId: string) => {
    setBulletins(prevBulletins => 
      prevBulletins.map(b => {
        if (b.id === bulletinId) {
          const isLiked = b.likedBy.includes(currentUser.id)
          const updatedBulletin = {
            ...b,
            likes: isLiked ? b.likes - 1 : b.likes + 1,
            likedBy: isLiked ? b.likedBy.filter(id => id !== currentUser.id) : [...b.likedBy, currentUser.id]
          };
          if (selectedBulletin && selectedBulletin.id === bulletinId) {
            setSelectedBulletin(updatedBulletin);
          }
          return updatedBulletin;
        }
        return b
      })
    )
  }

  const handleDelete = (bulletinId: string) => {
    setBulletins(prevBulletins => prevBulletins.filter(b => b.id !== bulletinId));
    if (selectedBulletin && selectedBulletin.id === bulletinId) {
      setSelectedBulletin(null);
    }
  }
  
  const handleAddComment = (bulletinId: string, commentText: string) => {
    setBulletins(prevBulletins =>
      prevBulletins.map(b => {
        if (b.id === bulletinId) {
          const newComment = {
            id: `comment-${Date.now()}`,
            user: {
              name: currentUser.name,
              avatarUrl: currentUser.avatarUrl,
            },
            text: commentText,
            timestamp: new Date().toISOString(),
          }
          const updatedBulletin = {
            ...b,
            comments: [...b.comments, newComment],
          };
          if (selectedBulletin && selectedBulletin.id === bulletinId) {
            setSelectedBulletin(updatedBulletin);
          }
          return updatedBulletin;
        }
        return b
      })
    )
  }

  const handleSelectBulletin = (bulletin: Bulletin) => {
    setSelectedBulletin(bulletin);
  };

  const handleBackToList = () => {
    setSelectedBulletin(null);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Bulletins"
          onAddBulletin={handleAddBulletin}
        />
        <main className="p-4 sm:p-6">
          {selectedBulletin ? (
            <div className="max-w-2xl mx-auto">
              <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all bulletins
              </Button>
              <BulletinCard 
                bulletin={selectedBulletin}
                onLikeToggle={handleLikeToggle}
                onDelete={handleDelete}
                onAddComment={handleAddComment}
                onEditBulletin={handleEditBulletin}
              />
            </div>
          ) : (
            <BulletinFeed 
              searchQuery={searchQuery}
              bulletins={bulletins}
              onSelectBulletin={handleSelectBulletin}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
