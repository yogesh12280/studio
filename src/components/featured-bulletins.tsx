'use client';

import { useMemo } from 'react';
import type { Bulletin } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Clock, CalendarOff, Heart, MessageCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface FeaturedBulletinsProps {
  bulletins: Bulletin[];
  onSelectBulletin: (bulletin: Bulletin) => void;
}

export function FeaturedBulletins({ bulletins, onSelectBulletin }: FeaturedBulletinsProps) {
  const featuredBulletins = useMemo(() => {
    if (bulletins.length === 0) {
      return [];
    }

    const uniqueBulletins = new Set<Bulletin>();

    // 1. Get latest bulletin
    const latest = [...bulletins].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (latest.length > 0) {
      uniqueBulletins.add(latest[0]);
    }

    // 2. Get most commented bulletin
    const mostCommented = [...bulletins].sort((a, b) => b.comments.length - a.comments.length);
    if (mostCommented.length > 0) {
      uniqueBulletins.add(mostCommented[0]);
    }

    // 3. Get most liked bulletin
    const mostLiked = [...bulletins].sort((a, b) => b.likes - a.likes);
    if (mostLiked.length > 0) {
      uniqueBulletins.add(mostLiked[0]);
    }

    // Fill up to 3 if we have duplicates
    const featuredArray = Array.from(uniqueBulletins);
    let i = 0;
    while (featuredArray.length < 3 && i < latest.length) {
        if (!featuredArray.includes(latest[i])) {
            featuredArray.push(latest[i]);
        }
        i++;
    }

    return featuredArray.slice(0, 3);
  }, [bulletins]);
  
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

  if (featuredBulletins.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <TrendingUp className="h-5 w-5" />
                <span>Featured Bulletins</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredBulletins.map((bulletin) => (
                    <div 
                    key={bulletin.id} 
                    onClick={() => onSelectBulletin(bulletin)} 
                    className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col"
                    >
                        {bulletin.imageUrl && (
                            <div className="relative aspect-video w-full mb-4 rounded-lg overflow-hidden">
                                <Image
                                src={bulletin.imageUrl}
                                alt={bulletin.title}
                                fill
                                className="object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-1 mb-3">
                            <div className="flex items-center gap-2 mb-1">
                            {getBadge(bulletin)}
                            </div>
                            <span className="font-medium text-base line-clamp-2">{bulletin.title}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2 border-t">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Heart className="h-4 w-4"/>
                                    <span>{bulletin.likes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="h-4 w-4"/>
                                    <span>{bulletin.comments.length}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4"/>
                                    <span>{bulletin.viewers}</span>
                                </div>
                            </div>
                            <p className="text-xs text-right">
                                {formatDistanceToNow(new Date(bulletin.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
  );
}
