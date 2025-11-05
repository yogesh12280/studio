'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { GrievanceManagement } from '@/components/grievance-management'
import { EmployeeGrievanceView } from '@/components/employee-grievance-view'

export default function GrievancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()

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
            <GrievanceManagement searchQuery={searchQuery} />
          ) : (
            <EmployeeGrievanceView searchQuery={searchQuery} />
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
