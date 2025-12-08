'use client'

import { useMemo } from 'react'
import type { Notification } from '@/lib/types'
import { NotificationList } from './notification-list'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface NotificationFeedProps {
  searchQuery: string;
  notifications: Notification[];
  onSelectNotification: (notification: Notification) => void;
  dateRange?: DateRange;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function NotificationFeed({ 
  searchQuery, 
  notifications, 
  onSelectNotification, 
  dateRange,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
}: NotificationFeedProps) {

  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(notification => {
        const searchLower = searchQuery.toLowerCase()
        const textMatch = notification.title.toLowerCase().includes(searchLower) ||
          notification.content.toLowerCase().includes(searchLower) ||
          notification.author.name.toLowerCase().includes(searchLower)

        const dateMatch = (() => {
            if (!dateRange?.from && !dateRange?.to) return true;
            const notificationDate = new Date(notification.createdAt);
            const start = dateRange.from ? startOfDay(dateRange.from) : undefined;
            const end = dateRange.to ? endOfDay(dateRange.to) : undefined;
            if (start && end) {
                return isWithinInterval(notificationDate, { start, end });
            }
            if (start) {
                return notificationDate >= start;
            }
            if (end) {
                return notificationDate <= end;
            }
            return true;
        })();

        return textMatch && dateMatch
      })
      .sort((a, b) => {
        const dateA = a.scheduledFor ? new Date(a.scheduledFor) : new Date(a.createdAt);
        const dateB = b.scheduledFor ? new Date(b.scheduledFor) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
  }, [notifications, searchQuery, dateRange])

  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredNotifications.slice(startIndex, startIndex + pageSize);
  }, [filteredNotifications, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  }

  if (filteredNotifications.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">No notifications found.</p>
  }

  return (
    <div className="mt-6">
      <NotificationList notifications={paginatedNotifications} onSelectNotification={onSelectNotification} />
       <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Page {currentPage} of {totalPages}</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map(size => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
           <span>per page</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
