'use client'

import { createContext, useState, useContext, ReactNode, useMemo } from 'react'
import type { User } from '@/lib/types'
import { users as mockUsers } from '@/lib/data'

type UserContextType = {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  users: User[]
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
    users: mockUsers,
  }), [currentUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
