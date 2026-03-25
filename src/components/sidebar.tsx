'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Globe, User, Shield, FileBarChart, ChevronDown } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { useState, useEffect } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { currentUser } = useUser()
  const isAdmin = currentUser?.role === 'Admin'

  const [isInternetOpen, setIsInternetOpen] = useState(true)

  const isActive = (href: string) => {
    const [path, query] = href.split('?')
    if (pathname !== path) return false
    if (!query) return true
    
    const params = new URLSearchParams(query)
    for (const [key, value] of params.entries()) {
      if (searchParams.get(key) !== value) return false
    }
    return true
  }

  const subItems = [
    { 
      title: 'My Claims', 
      href: '/internet-reimbursement-calendar?view=Personal', 
      icon: User 
    },
    ...(isAdmin ? [{ 
      title: 'Management', 
      href: '/internet-reimbursement-calendar?view=Management', 
      icon: Shield 
    }] : []),
    { 
      title: 'Report', 
      href: '/reports', 
      icon: FileBarChart 
    },
  ]

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar h-screen sticky top-0">
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-bg bg-primary flex items-center justify-center text-primary-foreground font-bold">
             RM
          </div>
          <span>Reimbursement Mgmt</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="space-y-1">
          <button
            onClick={() => setIsInternetOpen(!isInternetOpen)}
            className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-md transition-colors text-sm font-semibold text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4" />
              Internet
            </div>
            <ChevronDown className={cn("h-4 w-4 transition-transform", !isInternetOpen && "-rotate-90")} />
          </button>
          
          {isInternetOpen && (
            <div className="pl-4 space-y-1 mt-1">
              {subItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                    isActive(item.href)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
