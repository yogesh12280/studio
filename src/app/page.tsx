'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentActivity } from '@/components/recent-activity'
import { initialNotifications, initialPolls, initialGrievances, initialSuggestions, initialAppreciations } from '@/lib/data'

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader
          searchQuery=""
          setSearchQuery={() => {}}
          title="Dashboard"
        />
        <main className="p-4 sm:p-6 space-y-6">
          <DashboardStats 
            notifications={initialNotifications.length}
            polls={initialPolls.length}
            grievances={initialGrievances.length}
            suggestions={initialSuggestions.length}
          />
          <RecentActivity 
            notifications={initialNotifications}
            polls={initialPolls}
            grievances={initialGrievances}
            suggestions={initialSuggestions}
            appreciations={initialAppreciations}
          />
        </main>
      </div>
    </SidebarProvider>
  )
}
