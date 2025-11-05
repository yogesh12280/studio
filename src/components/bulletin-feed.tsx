'use client'

import { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BulletinCard } from '@/components/bulletin-card'
import { useUser } from '@/contexts/user-context'
import type { Bulletin } from '@/lib/types'

interface BulletinFeedProps {
  searchQuery: string
  bulletins: Bulletin[]
  onLikeToggle: (bulletinId: string) => void
  onDelete: (bulletinId: string) => void
}

export function BulletinFeed({ searchQuery, bulletins, onLikeToggle, onDelete }: BulletinFeedProps) {
  const { currentUser } = useUser()

  const filteredBulletins = useMemo(() => {
    return bulletins
      .filter(bulletin => {
        const now = new Date();
        const scheduledForDate = bulletin.scheduledFor ? new Date(bulletin.scheduledFor) : null;
        const endDateDate = bulletin.endDate ? new Date(bulletin.endDate) : null;

        const isScheduled = scheduledForDate && scheduledForDate > now;
        const isExpired = endDateDate && endDateDate < now;

        if (currentUser.role !== 'Admin') {
            // All users can see scheduled/expired posts as per new requirement,
            // but admins need to see them for management purposes.
            // This logic is now the same for all users, but we keep the admin view for scheduled/expired badges.
        }

        const searchLower = searchQuery.toLowerCase()
        return (
          bulletin.title.toLowerCase().includes(searchLower) ||
          bulletin.content.toLowerCase().includes(searchLower) ||
          bulletin.author.name.toLowerCase().includes(searchLower)
        )
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
            onLikeToggle={onLikeToggle}
            onDelete={onDelete}
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
