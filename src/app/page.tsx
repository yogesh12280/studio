'use client'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentActivity } from '@/components/recent-activity'
import { initialNotifications, initialPolls, initialGrievances, initialSuggestions, initialAppreciations } from '@/lib/data'
import { useUser } from '@/contexts/user-context'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useState } from 'react'
import type { Notification, Poll, Grievance, Suggestion, Appreciation } from '@/lib/types'


export default function DashboardPage() {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(true);
  
  // States for data
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching all data for the dashboard
    setTimeout(() => {
      setNotifications(initialNotifications);
      setPolls(initialPolls);
      setGrievances(initialGrievances);
      setSuggestions(initialSuggestions);
      setAppreciations(initialAppreciations);
      setLoading(false);
    }, 1000);
  }, []);

  if (!currentUser) {
    return null;
  }
  
  const renderLoadingState = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );

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
          {loading ? renderLoadingState() : (
            <>
              <DashboardStats 
                notifications={notifications.length}
                polls={polls.length}
                grievances={grievances.length}
                suggestions={suggestions.length}
              />
              <RecentActivity 
                notifications={notifications}
                polls={polls}
                grievances={grievances}
                suggestions={suggestions}
                appreciations={appreciations}
              />
            </>
          )}
        </main>
      </div>
    </SidebarProvider>
  )
}
