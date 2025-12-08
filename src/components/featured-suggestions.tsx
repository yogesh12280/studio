'use client';

import { useMemo } from 'react';
import type { Suggestion } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TrendingUp, ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedSuggestionsProps {
  suggestions: Suggestion[];
  onSelectSuggestion: (suggestion: Suggestion) => void;
}

type FeaturedInfo = {
    suggestion: Suggestion;
    title: string;
};

export function FeaturedSuggestions({ suggestions, onSelectSuggestion }: FeaturedSuggestionsProps) {
  const featuredSuggestions: FeaturedInfo[] = useMemo(() => {
    if (suggestions.length === 0) {
      return [];
    }
    
    const featured: FeaturedInfo[] = [];
    const usedIds = new Set<string>();

    const sortedByDate = [...suggestions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const sortedByComments = [...suggestions].sort((a, b) => b.comments.length - a.comments.length);
    const sortedByUpvotes = [...suggestions].sort((a, b) => b.upvotes - a.upvotes);
    
    if (sortedByDate.length > 0) {
        featured.push({ suggestion: sortedByDate[0], title: 'Latest' });
        usedIds.add(sortedByDate[0].id);
    }

    if (sortedByUpvotes.length > 0) {
        const mostUpvoted = sortedByUpvotes.find(s => !usedIds.has(s.id));
        if (mostUpvoted) {
            featured.push({ suggestion: mostUpvoted, title: 'Most Upvoted' });
            usedIds.add(mostUpvoted.id);
        }
    }
    
    if (sortedByComments.length > 0) {
        const mostCommented = sortedByComments.find(s => !usedIds.has(s.id));
        if (mostCommented && featured.length < 3) {
            featured.push({ suggestion: mostCommented, title: 'Most Commented' });
            usedIds.add(mostCommented.id);
        }
    }
    
    // Fill up to 3 if we have duplicates
    let i = 0;
    while (featured.length < 3 && i < sortedByDate.length) {
        if (!usedIds.has(sortedByDate[i].id)) {
            featured.push({ suggestion: sortedByDate[i], title: 'Trending' });
            usedIds.add(sortedByDate[i].id);
        }
        i++;
    }

    return featured.slice(0, 3);

  }, [suggestions]);
  
  if (featuredSuggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <TrendingUp className="h-5 w-5" />
                <span>Featured Suggestions</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredSuggestions.map(({ suggestion, title: featuredTitle }) => (
                    <div 
                        key={suggestion.id} 
                        onClick={() => onSelectSuggestion(suggestion)} 
                        className="cursor-pointer border rounded-lg p-0 hover:bg-muted/50 transition-colors flex flex-col overflow-hidden"
                    >
                        <div className="p-4 flex flex-col flex-1">
                            <div className="flex-1 mb-3">
                                <span className="font-medium text-base line-clamp-2">{suggestion.title}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-2 border-t">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4"/>
                                        <span>{suggestion.upvotes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4"/>
                                        <span>{suggestion.comments.length}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-right">
                                    {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
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
