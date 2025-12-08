'use client';

import { useMemo } from 'react';
import type { Appreciation } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, ArrowRight, Heart } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedAppreciationsProps {
  appreciations: Appreciation[];
  onSelectAppreciation: (appreciation: Appreciation) => void;
}

type FeaturedInfo = {
  appreciation: Appreciation;
  title: string;
};

export function FeaturedAppreciations({ appreciations, onSelectAppreciation }: FeaturedAppreciationsProps) {
  const featuredAppreciations: FeaturedInfo[] = useMemo(() => {
    if (appreciations.length === 0) {
      return [];
    }

    const featured: FeaturedInfo[] = [];
    const usedIds = new Set<string>();

    const sortedByDate = [...appreciations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedByLikes = [...appreciations].sort((a, b) => b.likes - a.likes);

    // 1. Add the latest appreciation
    if (sortedByDate.length > 0) {
      featured.push({ appreciation: sortedByDate[0], title: 'Latest' });
      usedIds.add(sortedByDate[0].id);
    }

    // 2. Add the most liked appreciation, if it's different from the latest
    const mostLiked = sortedByLikes.find(a => !usedIds.has(a.id));
    if (mostLiked) {
      featured.push({ appreciation: mostLiked, title: 'Most Liked' });
      usedIds.add(mostLiked.id);
    }
    
    // 3. Fill up to 3 with the next latest ones if available
    let i = 0;
    while (featured.length < 3 && i < sortedByDate.length) {
        if (!usedIds.has(sortedByDate[i].id)) {
            featured.push({ appreciation: sortedByDate[i], title: 'Trending' });
            usedIds.add(sortedByDate[i].id);
        }
        i++;
    }


    return featured.slice(0, 3);
  }, [appreciations]);

  if (featuredAppreciations.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-xl">
          <TrendingUp className="h-5 w-5" />
          <span>Featured Appreciations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredAppreciations.map(({ appreciation, title: featuredTitle }) => (
            <div
              key={`${appreciation.id}-${featuredTitle}`}
              onClick={() => onSelectAppreciation(appreciation)}
              className="cursor-pointer border rounded-lg p-0 hover:bg-muted/50 transition-colors flex flex-col overflow-hidden"
            >
              <div className="p-4 flex flex-col flex-1">
                <div className="flex-1 mb-3">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={appreciation.fromUser.avatarUrl} alt={appreciation.fromUser.name} />
                            <AvatarFallback>{appreciation.fromUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                         <Avatar className="h-10 w-10">
                            <AvatarImage src={appreciation.toUser.avatarUrl} alt={appreciation.toUser.name} />
                            <AvatarFallback>{appreciation.toUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                  <p className="font-medium text-sm text-center line-clamp-2">
                    {appreciation.fromUser.name} to {appreciation.toUser.name}
                  </p>
                  <p className="text-sm text-muted-foreground text-center line-clamp-2 mt-1">
                    &ldquo;{appreciation.message}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{appreciation.likes}</span>
                  </div>
                  <p className="text-xs text-right">
                    {formatDistanceToNow(new Date(appreciation.createdAt), { addSuffix: true })}
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
