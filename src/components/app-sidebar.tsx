'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { SembConnectLogo } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Newspaper, ShieldAlert, Moon, Sun, Vote, Lightbulb, Award, LayoutDashboard } from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const { currentUser } = useUser()
  const pathname = usePathname()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground rounded-lg p-2">
            <SembConnectLogo className="h-6 w-6" />
          </div>
          <span className="font-headline text-lg font-bold group-data-[collapsible=icon]:hidden">
            SembConnect
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Dashboard"
              isActive={pathname === '/'}
            >
              <Link href="/">
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Notifications"
              isActive={pathname === '/notifications'}
            >
              <Link href="/notifications">
                <Newspaper />
                <span>Notifications</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Polling"
              isActive={pathname === '/polling'}
            >
              <Link href="/polling">
                <Vote />
                <span>Polling</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Grievance"
              isActive={pathname === '/grievance'}
            >
              <Link href="/grievance">
                <ShieldAlert />
                <span>Grievance</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Suggestion"
              isActive={pathname === '/suggestion'}
            >
              <Link href="/suggestion">
                <Lightbulb />
                <span>Suggestion</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Appreciation"
              isActive={pathname === '/appreciation'}
            >
              <Link href="/appreciation">
                <Award />
                <span>Appreciation</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarSeparator />
        <div className="flex items-center justify-center gap-2 p-2 group-data-[collapsible=icon]:flex-col">
          <Moon className="h-5 w-5 hidden dark:block" />
          <Sun className="h-5 w-5 dark:hidden" />
        </div>
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg p-2 transition-colors',
            'group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0'
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={currentUser.avatarUrl}
              alt={currentUser.name}
            />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">
              {currentUser.role}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
