'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, MessageCircle, Eye, CalendarOff, Clock } from 'lucide-react'
import type { Bulletin } from '@/lib/types'
import { formatDistanceToNow, format } from 'date-fns'

interface BulletinListProps {
  bulletins: Bulletin[]
  onSelectBulletin: (bulletin: Bulletin) => void
}

export function BulletinList({ bulletins, onSelectBulletin }: BulletinListProps) {

  const getBadge = (bulletin: Bulletin) => {
    const now = new Date();
    const scheduledForDate = bulletin.scheduledFor ? new Date(bulletin.scheduledFor) : undefined;
    const isScheduled = scheduledForDate && scheduledForDate > now;
    const endDateDate = bulletin.endDate ? new Date(bulletin.endDate) : undefined;
    const isExpired = endDateDate && endDateDate < now;
    
    if (isScheduled) {
      return (
        <Badge variant="secondary" className="whitespace-nowrap">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
        </Badge>
      )
    }

    if (isExpired) {
       return (
        <Badge variant="destructive" className="whitespace-nowrap">
            <CalendarOff className="mr-1 h-3 w-3" />
            Expired
        </Badge>
       )
    }
    return null;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead className="text-center">Likes</TableHead>
            <TableHead className="text-center">Comments</TableHead>
            <TableHead className="text-center">Views</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bulletins.map((bulletin) => (
            <TableRow key={bulletin.id} onClick={() => onSelectBulletin(bulletin)} className="cursor-pointer">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{bulletin.title}</span>
                  <span className="text-sm text-muted-foreground">{bulletin.author.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Heart className="h-4 w-4 text-muted-foreground"/>
                  <span>{bulletin.likes}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <MessageCircle className="h-4 w-4 text-muted-foreground"/>
                  <span>{bulletin.comments.length}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                 <div className="flex items-center justify-center gap-1">
                  <Eye className="h-4 w-4 text-muted-foreground"/>
                  <span>{bulletin.viewers}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-col items-end">
                    {getBadge(bulletin)}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(bulletin.createdAt), { addSuffix: true })}
                    </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
