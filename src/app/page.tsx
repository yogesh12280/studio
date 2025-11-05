'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { BulletinFeed } from '@/components/bulletin-feed'
import { initialBulletins } from '@/lib/data'
import { useUser } from '@/contexts/user-context'
import type { Bulletin } from '@/lib/types'

export default function OrgaBlastPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [bulletins, setBulletins] = useState<Bulletin[]>(initialBulletins)
  const { currentUser } = useUser()

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

  const handleLikeToggle = (bulletinId: string) => {
    setBulletins(prevBulletins => 
      prevBulletins.map(b => {
        if (b.id === bulletinId) {
          const isLiked = b.likedBy.includes(currentUser.id)
          return {
            ...b,
            likes: isLiked ? b.likes - 1 : b.likes + 1,
            likedBy: isLiked ? b.likedBy.filter(id => id !== currentUser.id) : [...b.likedBy, currentUser.id]
          }
        }
        return b
      })
    )
  }

  const handleDelete = (bulletinId: string) => {
    setBulletins(prevBulletins => prevBulletins.filter(b => b.id !== bulletinId))
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
          return {
            ...b,
            comments: [...b.comments, newComment],
          }
        }
        return b
      })
    )
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
          <BulletinFeed 
            searchQuery={searchQuery}
            bulletins={bulletins}
            onLikeToggle={handleLikeToggle}
            onDelete={handleDelete}
            onAddComment={handleAddComment}
          />
        </main>
      </div>
    </SidebarProvider>
  )
}
