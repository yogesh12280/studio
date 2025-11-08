'use client'

import { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BulletinCard } from '@/components/bulletin-card'
import type { Bulletin } from '@/lib/types'

interface BulletinFeedProps {
  searchQuery: string
  bulletins: Bulletin[]
  onLikeToggle: (bulletinId: string) => void
  onDelete: (bulletinId: string) => void
  onAddComment: (bulletinId: string, commentText: string) => void
  onEditBulletin: (bulletin: Bulletin) => void
}

export function BulletinFeed({ searchQuery, bulletins, onLikeToggle, onDelete, onAddComment, onEditBulletin }: BulletinFeedProps) {

  const filteredBulletins = useMemo(() => {
    return bulletins
      .filter(bulletin => {
        const searchLower = searchQuery.toLowerCase()
        return (
          bulletin.title.toLowerCase().includes(searchLower) ||
          bulletin.content.toLowerCase().includes(searchLower) ||
          bulletin.author.name.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => {
        const dateA = a.scheduledFor ? new Date(a.scheduledFor) : new Date(a.createdAt);
        const dateB = b.scheduledFor ? new Date(b.scheduledFor) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
  }, [bulletins, searchQuery])

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
            onLikeToggle={onLikeToggle}
            onDelete={onDelete}
            onAddComment={onAddComment}
            onEditBulletin={onEditBulletin}
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
