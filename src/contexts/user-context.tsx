'use client'

import { createContext, useState, useContext, ReactNode, useMemo, useEffect } from 'react'
import type { User } from '@/lib/types'

type UserContextType = {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  users: User[]
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const value = useMemo(() => ({
    currentUser,
    setCurrentUser,
    users,
    loading,
  }), [currentUser, users, loading]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
