'use client'

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
import { OrgaBlastLogo } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Newspaper,
  Users,
  Settings,
  Moon,
  Sun,
} from 'lucide-react'
import { useUser } from '@/contexts/user-context'
import { cn } from '@/lib/utils'

export function AppSidebar() {
  const { currentUser } = useUser()

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground rounded-lg p-2">
            <OrgaBlastLogo className="h-6 w-6" />
          </div>
          <span className="font-headline text-lg font-bold group-data-[collapsible=icon]:hidden">
            OrgaBlast
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Dashboard" isActive>
              <LayoutDashboard />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Bulletins">
              <Newspaper />
              <span>Bulletins</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Employees">
              <Users />
              <span>Employees</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Settings">
              <Settings />
              <span>Settings</span>
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
            <AvatarFallback>
              {currentUser.name.charAt(0)}
            </AvatarFallback>
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
