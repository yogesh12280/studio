'use client'

import { useState } from 'react'
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { BulletinFeed } from '@/components/bulletin-feed'

export default function OrgaBlastPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="p-4 sm:p-6">
          <BulletinFeed searchQuery={searchQuery} />
        </main>
      </div>
    </SidebarProvider>
  )
}
