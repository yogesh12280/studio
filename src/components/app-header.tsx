
'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useUser } from '@/contexts/user-context'
import type { User } from '@/lib/types'
import { employees } from '@/lib/data'
import { ThemeToggle } from './theme-toggle'
import { FileBarChart } from 'lucide-react'

interface AppHeaderProps {
  title: string
  children?: React.ReactNode;
}

export function AppHeader({
  title,
  children
}: AppHeaderProps) {
  const { currentUser, users, setCurrentUser } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  
  const allUsers = [...users, ...employees];

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }
  
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    router.push('/internet-reimbursement');
  }

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'Admin';
  const isReportPage = pathname === '/reports';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 w-full">
      <h1 className="text-xl font-semibold md:text-2xl font-headline whitespace-nowrap">
        {title}
      </h1>
      
      <div className="flex-1"></div>

      <div className="flex items-center gap-2">
        {children}
        
        {isAdmin && !isReportPage && (
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-2">
            <Link href="/reports">
              <FileBarChart className="h-4 w-4" />
              Report
            </Link>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                />
                <AvatarFallback>
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {currentUser.name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Switch User</DropdownMenuLabel>
            {allUsers
              .filter((user) => user.id !== currentUser.id)
              .map((user) => (
                <DropdownMenuItem key={user.id} onSelect={() => handleSwitchUser(user)}>
                  {user.name}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </header>
  )
}
