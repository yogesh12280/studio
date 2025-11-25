'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SembConnectLogo } from '@/components/icons'

export default function LoginPage() {
  const { users, setCurrentUser } = useUser()
  const router = useRouter()

  const handleLogin = (user: any) => {
    setCurrentUser(user)
    router.push('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <SembConnectLogo className="h-10 w-10 text-primary" />
            </div>
          <CardTitle className="text-2xl font-headline">Welcome to SembConnect</CardTitle>
          <CardDescription>Select a user to log in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
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
        </CardContent>
      </Card>
    </div>
  )
}
