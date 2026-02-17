'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SembConnectLogo } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { employees } from '@/lib/data'

export default function LoginPage() {
  const { users, setCurrentUser, loading } = useUser()
  const router = useRouter()

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    router.push('/internet-reimbursement')
  }

  const allUsers = [...users, ...employees]

  const renderUserList = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </div>
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          ))}
        </div>
      )
    }

    if (allUsers.length === 0) {
        return <p className="text-center text-muted-foreground">No users found.</p>
    }

    return (
      <div className="space-y-4">
        {allUsers.map((user) => (
          <div key={user.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.role}</p>
              </div>
            </div>
            <Button onClick={() => handleLogin(user)}>Login</Button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 w-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <SembConnectLogo className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Welcome to Reimbursement Mgmt</CardTitle>
          <CardDescription>
            Please select a user to log in.
          </CardDescription>
        </CardHeader>
        <CardContent>
            {renderUserList()}
        </CardContent>
      </Card>
    </div>
  )
}
