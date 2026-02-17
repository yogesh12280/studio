'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUser } from '@/contexts/user-context'
import { SembConnectLogo } from './icons'
import { Sidebar } from './sidebar'

export function AuthChecker({ children }: { children: React.ReactNode }) {
  const { currentUser } = useUser()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!currentUser && pathname !== '/login') {
      router.replace('/login')
    }
  }, [currentUser, pathname, router])

  if (!currentUser && pathname !== '/login') {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
            <SembConnectLogo className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
    )
  }

  // If we are on the login page, render children without the sidebar shell
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Authenticated layout with Sidebar
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
