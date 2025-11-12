'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Newspaper, Vote, ShieldAlert, Lightbulb } from 'lucide-react'

interface DashboardStatsProps {
  notifications: number
  polls: number
  grievances: number
  suggestions: number
}

export function DashboardStats({
  notifications,
  polls,
  grievances,
  suggestions,
}: DashboardStatsProps) {
  const stats = [
    { title: 'Notifications', value: notifications, icon: Newspaper, color: 'text-sky-500' },
    { title: 'Active Polls', value: polls, icon: Vote, color: 'text-green-500' },
    { title: 'Open Grievances', value: grievances, icon: ShieldAlert, color: 'text-red-500' },
    { title: 'Suggestions', value: suggestions, icon: Lightbulb, color: 'text-yellow-500' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 text-muted-foreground ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
