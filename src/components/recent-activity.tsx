'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowRight } from 'lucide-react'
import type { Notification, Poll, Grievance, Suggestion, Appreciation } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface RecentActivityProps {
  notifications: Notification[]
  polls: Poll[]
  grievances: Grievance[]
  suggestions: Suggestion[]
  appreciations: Appreciation[]
}

export function RecentActivity({
  notifications,
  polls,
  grievances,
  suggestions,
  appreciations,
}: RecentActivityProps) {
  const recentNotifications = notifications.slice(0, 3)
  const recentPolls = polls.slice(0, 2)
  const recentGrievances = grievances.filter(g => g.status !== 'Resolved').slice(0, 2)
  const recentSuggestions = suggestions.slice(0, 3)
  const recentAppreciations = appreciations.slice(0, 2)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentNotifications.map(item => (
            <div key={item.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarImage src={item.author.avatarUrl} alt={item.author.name} />
                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium line-clamp-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  By {item.author.name} &middot; {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <Link href="/notifications">View All</Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Polls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentPolls.map(item => (
            <div key={item.id} className="flex items-start gap-4">
               <Avatar className="h-9 w-9">
                <AvatarImage src={item.author.avatarUrl} alt={item.author.name} />
                <AvatarFallback>{item.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium line-clamp-2">{item.question}</p>
                 <p className="text-sm text-muted-foreground">
                  {item.options.reduce((sum, opt) => sum + opt.votes, 0)} votes &middot; {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
         <CardFooter>
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <Link href="/polling">View All</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Grievances</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentGrievances.map(item => (
            <div key={item.id} className="flex items-start gap-4">
               <Avatar className="h-9 w-9">
                <AvatarImage src={item.employeeAvatarUrl} alt={item.employeeName} />
                <AvatarFallback>{item.employeeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium line-clamp-1">{item.subject}</p>
                <p className="text-sm text-muted-foreground">
                  Status: <span className="font-semibold">{item.status}</span> &middot; {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
           {recentGrievances.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No open grievances.</p>}
        </CardContent>
         <CardFooter>
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <Link href="/grievance">View All</Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentSuggestions.map(item => (
            <div key={item.id} className="flex items-start gap-4">
               <Avatar className="h-9 w-9">
                <AvatarImage src={item.employeeAvatarUrl} alt={item.employeeName} />
                <AvatarFallback>{item.employeeName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium line-clamp-1">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.upvotes} upvotes &middot; {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
         <CardFooter>
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <Link href="/suggestion">View All</Link>
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Latest Appreciations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentAppreciations.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center -space-x-2">
                  <Avatar className="h-9 w-9 border-2 border-background">
                    <AvatarImage src={item.fromUser.avatarUrl} alt={item.fromUser.name} />
                    <AvatarFallback>{item.fromUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-9 w-9 border-2 border-background">
                    <AvatarImage src={item.toUser.avatarUrl} alt={item.toUser.name} />
                    <AvatarFallback>{item.toUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div>
                   <p className="font-medium text-sm">{item.fromUser.name} <ArrowRight className="inline h-3 w-3 text-muted-foreground" /> {item.toUser.name}</p>
                   <p className="text-sm text-muted-foreground line-clamp-1">&quot;{item.message}&quot;</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
            </div>
          ))}
        </CardContent>
         <CardFooter>
          <Button asChild variant="secondary" size="sm" className="ml-auto">
            <Link href="/appreciation">View All</Link>
          </Button>
        </CardFooter>
      </Card>

    </div>
  )
}
