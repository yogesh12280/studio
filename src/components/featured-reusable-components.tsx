'use client';

import { useMemo } from 'react';
import type { ReusableComponent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, Heart, MessageCircle, Eye, Rocket } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedReusableComponentsProps {
  components: ReusableComponent[];
  onSelectComponent: (component: ReusableComponent) => void;
}

type FeaturedInfo = {
    component: ReusableComponent;
    title: string;
};

export function FeaturedReusableComponents({ components, onSelectComponent }: FeaturedReusableComponentsProps) {
  const featuredComponents: FeaturedInfo[] = useMemo(() => {
    if (components.length === 0) {
      return [];
    }
    
    const featured: FeaturedInfo[] = [];
    const usedIds = new Set<string>();

    const sortedByDate = [...components].sort((a, b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime());
    const sortedByUtilization = [...components].sort((a, b) => b.utilizationByProjects.length - a.utilizationByProjects.length);
    const sortedByLikes = [...components].sort((a, b) => b.likes - a.likes);
    
    if (sortedByDate.length > 0) {
        featured.push({ component: sortedByDate[0], title: 'Latest' });
        usedIds.add(sortedByDate[0].id);
    }

    const mostUtilized = sortedByUtilization.find(c => !usedIds.has(c.id));
    if (mostUtilized) {
        featured.push({ component: mostUtilized, title: 'Most Utilized' });
        usedIds.add(mostUtilized.id);
    }
    
    const mostLiked = sortedByLikes.find(c => !usedIds.has(c.id));
    if (mostLiked && featured.length < 3) {
        featured.push({ component: mostLiked, title: 'Most Liked' });
        usedIds.add(mostLiked.id);
    }
    
    let i = 0;
    while (featured.length < 3 && i < sortedByDate.length) {
        if (!usedIds.has(sortedByDate[i].id)) {
            featured.push({ component: sortedByDate[i], title: 'Trending' });
            usedIds.add(sortedByDate[i].id);
        }
        i++;
    }

    return featured.slice(0, 3);

  }, [components]);
  
  if (featuredComponents.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <TrendingUp className="h-5 w-5" />
                <span>Featured Components</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredComponents.map(({ component, title: featuredTitle }) => (
                    <div 
                        key={component.id} 
                        onClick={() => onSelectComponent(component)} 
                        className="cursor-pointer border rounded-lg p-0 hover:bg-muted/50 transition-colors flex flex-col overflow-hidden"
                    >
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex-1 mb-3">
                                <span className="font-medium text-base line-clamp-2">{component.name}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2 border-t">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <Heart className="h-4 w-4"/>
                                        <span>{component.likes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Rocket className="h-4 w-4"/>
                                        <span>{component.utilizationByProjects.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="h-4 w-4"/>
                                        <span>{component.viewers}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-right">
                                    {formatDistanceToNow(new Date(component.registeredDate), { addSuffix: true })}
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
