'use client'

import { useState } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { GrievanceManagement } from '@/components/grievance-management'
import { EmployeeGrievanceView } from '@/components/employee-grievance-view'
import { initialGrievances } from '@/lib/data'
import type { Grievance } from '@/lib/types'

export default function GrievancePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [grievances, setGrievances] = useState<Grievance[]>(initialGrievances)

  const handleAddGrievance = (newGrievanceData: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => {
    const newGrievance: Grievance = {
      id: `grievance-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatarUrl: currentUser.avatarUrl,
      createdAt: new Date().toISOString(),
      ...newGrievanceData,
    }
    setGrievances(prev => [newGrievance, ...prev])
  }

  const handleStatusChange = (
    grievanceId: string,
    newStatus: Grievance['status']
  ) => {
    setGrievances((prev) =>
      prev.map((g) =>
        g.id === grievanceId
          ? {
              ...g,
              status: newStatus,
              resolvedAt: newStatus === 'Resolved' ? new Date().toISOString() : g.resolvedAt,
            }
          : g
      )
    )
  }

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
            <GrievanceManagement 
              searchQuery={searchQuery} 
              grievances={grievances}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <EmployeeGrievanceView 
              searchQuery={searchQuery} 
              grievances={grievances.filter(g => g.employeeId === currentUser.id)}
              onAddGrievance={handleAddGrievance}
            />
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
