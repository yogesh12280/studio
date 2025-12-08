'use client'

import { useRouter } from 'next/navigation'
import { Search, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CreateNotificationDialog } from './create-notification-dialog'
import { CreatePollDialog } from './create-poll-dialog'
import { CreateAppreciationDialog } from './create-appreciation-dialog'
import { CreateSuggestionDialog } from './create-suggestion-dialog'
import type { Notification, Poll, Appreciation, User, Suggestion } from '@/lib/types'
import { employees } from '@/lib/data'

interface AppHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  title: string
  onAddNotification?: (newNotification: Omit<Notification, 'id' | 'author' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'createdAt'>) => void;
  onAddPoll?: (newPoll: Omit<Poll, 'id' | 'author' | 'votedBy' | 'createdAt'>) => void;
  onAddAppreciation?: (newAppreciation: Omit<Appreciation, 'id' | 'fromUser' | 'createdAt' | 'likes' | 'likedBy'>) => void;
  onAddSuggestion?: (newSuggestion: Omit<Suggestion, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'comments'>) => void;
}

export function AppHeader({
  searchQuery,
  setSearchQuery,
  title,
  onAddNotification,
  onAddPoll,
  onAddAppreciation,
  onAddSuggestion,
}: AppHeaderProps) {
  const { currentUser, users, setCurrentUser } = useUser()
  const router = useRouter()
  
  const allUsers = [...users, ...employees];

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }
  
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    router.push('/');
  }

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
      <h1 className="text-xl font-semibold md:text-2xl font-headline hidden sm:block">
        {title}
      </h1>
      <div className="relative flex-1">
        {title !== 'Dashboard' && title !== 'Polling' && title !== 'Notifications' && title !== 'Suggestions' && title !== 'Grievance' && (
          <>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[320px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {title === 'Notifications' && onAddNotification && (
          <CreateNotificationDialog onSave={onAddNotification}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create Notification</span>
            </Button>
          </CreateNotificationDialog>
        )}
        {currentUser.role !== 'Employee' && title === 'Polling' && onAddPoll && (
          <CreatePollDialog mode="create" onSave={onAddPoll}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create Poll</span>
            </Button>
          </CreatePollDialog>
        )}
         {currentUser.role === 'Employee' && title === 'Polling' && onAddPoll && (
          <CreatePollDialog mode="create" onSave={onAddPoll}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Create Poll</span>
            </Button>
          </CreatePollDialog>
        )}
        {title === 'Appreciation' && onAddAppreciation && (
            <CreateAppreciationDialog onSave={onAddAppreciation} mode="create">
                <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Send Appreciation</span>
                </Button>
            </CreateAppreciationDialog>
        )}
        {title === 'Suggestions' && onAddSuggestion && (
          <CreateSuggestionDialog mode="create" onSuggestionSubmit={onAddSuggestion}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Add Suggestion</span>
            </Button>
          </CreateSuggestionDialog>
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
      </div>
    </header>
  )
}
