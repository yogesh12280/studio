'use client'

import { Badge } from '@/components/ui/badge'
import { Users, CalendarOff } from 'lucide-react'
import type { Poll } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface PollListProps {
  polls: Poll[]
  onSelectPoll: (poll: Poll) => void
}

export function PollList({ polls, onSelectPoll }: PollListProps) {
  const getTotalVotes = (poll: Poll) => poll.options.reduce((sum, option) => sum + option.votes, 0);

  const getBadge = (poll: Poll) => {
    const now = new Date();
    const endDateDate = poll.endDate ? new Date(poll.endDate) : undefined;
    const isExpired = endDateDate && endDateDate < now;
    
    if (isExpired) {
       return (
        <Badge variant="destructive" className="whitespace-nowrap">
            <CalendarOff className="mr-1 h-3 w-3" />
            Closed
        </Badge>
       )
    }
    return <Badge variant={poll.category === 'Organization' ? 'default' : 'secondary'}>{poll.category}</Badge>;
  }

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {polls.map((poll) => (
        <div 
          key={poll.id} 
          onClick={() => onSelectPoll(poll)} 
          className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col"
        >
          <div className="flex-1 mb-3">
            <div className="flex items-center gap-2 mb-1">
              {getBadge(poll)}
              <span className="font-medium text-base">{poll.question}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
                <Users className="h-4 w-4"/>
                <span>{getTotalVotes(poll)} votes</span>
            </div>
            <p className="text-sm text-muted-foreground">
              By {poll.author.name} &middot; {formatDistanceToNow(new Date(poll.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
