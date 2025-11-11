'use client';

import { useMemo } from 'react';
import type { Bulletin } from '@/lib/types';
import { BulletinList } from './bulletin-list';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp } from 'lucide-react';

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
            <BulletinList bulletins={featuredBulletins} onSelectBulletin={onSelectBulletin} />
        </CardContent>
    </Card>
  );
}
