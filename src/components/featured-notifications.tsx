'use client';

import { useMemo } from 'react';
import type { Notification } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Clock, CalendarOff, Heart, MessageCircle, Eye } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedNotificationsProps {
  notifications: Notification[];
  onSelectNotification: (notification: Notification) => void;
}

type FeaturedInfo = {
    notification: Notification;
    title: string;
};

export function FeaturedNotifications({ notifications, onSelectNotification }: FeaturedNotificationsProps) {
  const featuredNotifications: FeaturedInfo[] = useMemo(() => {
    if (notifications.length === 0) {
      return [];
    }
    
    const featured: FeaturedInfo[] = [];
    const usedIds = new Set<string>();

    const sortedByDate = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedByComments = [...notifications].sort((a, b) => b.comments.length - a.comments.length);
    const sortedByViews = [...notifications].sort((a, b) => b.viewers - a.viewers);
    
    if (sortedByDate.length > 0) {
        featured.push({ notification: sortedByDate[0], title: 'Latest' });
        usedIds.add(sortedByDate[0].id);
    }

    if (sortedByViews.length > 0) {
        const mostViewed = sortedByViews.find(b => !usedIds.has(b.id));
        if (mostViewed) {
            featured.push({ notification: mostViewed, title: 'Most Viewed' });
            usedIds.add(mostViewed.id);
        }
    }
    
    if (sortedByComments.length > 0) {
        const mostCommented = sortedByComments.find(b => !usedIds.has(b.id));
        if (mostCommented && featured.length < 3) {
            featured.push({ notification: mostCommented, title: 'Most Commented' });
            usedIds.add(mostCommented.id);
        }
    }
    
    // Fill up to 3 if we have duplicates
    let i = 0;
    while (featured.length < 3 && i < sortedByDate.length) {
        if (!usedIds.has(sortedByDate[i].id)) {
            featured.push({ notification: sortedByDate[i], title: 'Trending' });
            usedIds.add(sortedByDate[i].id);
        }
        i++;
    }

    return featured.slice(0, 3);

  }, [notifications]);
  
  const getBadge = (notification: Notification) => {
    const now = new Date();
    const scheduledForDate = notification.scheduledFor ? new Date(notification.scheduledFor) : undefined;
    const isScheduled = scheduledForDate && scheduledForDate > now;
    const endDateDate = notification.endDate ? new Date(notification.endDate) : undefined;
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

  if (featuredNotifications.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <TrendingUp className="h-5 w-5" />
                <span>Featured Notifications</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredNotifications.map(({ notification, title: featuredTitle }) => (
                    <div 
                        key={notification.id} 
                        onClick={() => onSelectNotification(notification)} 
                        className="cursor-pointer border rounded-lg p-0 hover:bg-muted/50 transition-colors flex flex-col overflow-hidden"
                    >
                        <div className="p-4 flex flex-col flex-1">
                            {notification.imageUrl && (
                                <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
                                    <Image
                                    src={notification.imageUrl}
                                    alt={notification.title}
                                    fill
                                    className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 mb-3">
                                <div className="flex items-center gap-2 mb-2">
                                {getBadge(notification)}
                                </div>
                                <span className="font-medium text-base line-clamp-2">{notification.title}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2 border-t">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Heart className="h-4 w-4"/>
                                        <span>{notification.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="h-4 w-4"/>
                                        <span>{notification.comments.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4"/>
                                        <span>{notification.viewers}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-right">
                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className="bg-muted px-4 py-2 text-center text-sm font-semibold text-muted-foreground">
                            {featuredTitle}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
