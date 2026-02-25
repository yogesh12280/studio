'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Calendar, Globe } from 'lucide-react'
import { useUser } from '@/contexts/user-context'

export function Sidebar() {
  const pathname = usePathname()
  const { currentUser } = useUser()

  const navItems = [
    {
      title: 'Internet',
      href: '/internet-reimbursement-calendar',
      icon: Globe,
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
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              pathname === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
