'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SembConnectLogo } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect } from 'react'

export default function LoginPage() {
  const { users, setCurrentUser, loading } = useUser()
  const router = useRouter()

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    router.push('/')
  }

  useEffect(() => {
    if (!loading && users.length > 0) {
      const userToLogin = users.find(u => u.id === 'user-1');
      if (userToLogin) {
        handleLogin(userToLogin);
      }
    }
  }, [users, loading]);


  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <SembConnectLogo className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Welcome to SembConnect</CardTitle>
          <CardDescription>Logging you in...</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-center">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
