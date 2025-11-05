'use client'

import { useState, useMemo, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BulletinCard } from '@/components/bulletin-card'
import { initialBulletins } from '@/lib/data'
import { useUser } from '@/contexts/user-context'
import type { Bulletin } from '@/lib/types'

interface BulletinFeedProps {
  searchQuery: string
}

export function BulletinFeed({ searchQuery }: BulletinFeedProps) {
  const { currentUser } = useUser()
  const [bulletins, setBulletins] = useState<Bulletin[]>(initialBulletins)
  
  // This useEffect simulates fetching and updating data
  useEffect(() => {
    // In a real app, you might re-fetch or listen to updates
    setBulletins(initialBulletins)
  }, [])
  
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
    // In real app, call API to delete
  }

  const filteredBulletins = useMemo(() => {
    return bulletins
      .filter(bulletin => {
        const now = new Date();
        const isScheduled = bulletin.scheduledFor && bulletin.scheduledFor > now;
        const isExpired = bulletin.endDate && bulletin.endDate < now;

        if (currentUser.role !== 'Admin') {
          if (isScheduled || isExpired) return false;
        }

        const searchLower = searchQuery.toLowerCase()
        return (
          bulletin.title.toLowerCase().includes(searchLower) ||
          bulletin.content.toLowerCase().includes(searchLower) ||
          bulletin.author.name.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [bulletins, searchQuery, currentUser.role])

  const organizationBulletins = filteredBulletins.filter(
    (b) => b.category === 'Organization'
  )
  const employeeBulletins = filteredBulletins.filter(
    (b) => b.category === 'Employee'
  )

  const renderBulletinList = (bulletinList: Bulletin[]) => {
    if (bulletinList.length === 0) {
      return <p className="text-muted-foreground mt-4 text-center">No bulletins found.</p>
    }
    return (
      <div className="space-y-6">
        {bulletinList.map((bulletin) => (
          <BulletinCard 
            key={bulletin.id} 
            bulletin={bulletin} 
            onLikeToggle={handleLikeToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="organization" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="employee">Employee</TabsTrigger>
      </TabsList>
      <TabsContent value="organization" className="mt-6">
        {renderBulletinList(organizationBulletins)}
      </TabsContent>
      <TabsContent value="employee" className="mt-6">
        {renderBulletinList(employeeBulletins)}
      </TabsContent>
    </Tabs>
  )
}
