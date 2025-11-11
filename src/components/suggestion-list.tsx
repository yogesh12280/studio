'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThumbsUp, MessageSquare } from 'lucide-react'
import type { Suggestion, User } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface SuggestionListProps {
  suggestions: Suggestion[];
  onUpvoteToggle: (suggestionId: string) => void;
  onSelectSuggestion: (suggestion: Suggestion) => void;
  currentUser: User;
}

export function SuggestionList({ suggestions, onUpvoteToggle, onSelectSuggestion, currentUser }: SuggestionListProps) {
  
  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => {
        const isUpvoted = suggestion.upvotedBy.includes(currentUser.id);
        return (
            <div 
              key={suggestion.id} 
              onClick={() => onSelectSuggestion(suggestion)} 
              className="cursor-pointer border rounded-lg p-4 hover:bg-muted/50 transition-colors flex flex-col"
            >
              <div className="flex-1 mb-3">
                 <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={suggestion.employeeAvatarUrl} alt={suggestion.employeeName} />
                        <AvatarFallback>{suggestion.employeeName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{suggestion.employeeName}</p>
                        <p className="text-xs text-muted-foreground">
                            Submitted {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
                <h3 className="font-bold mb-1 ml-12">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 ml-12">{suggestion.description}</p>
              </div>
              <div className="flex items-center justify-end text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                    <Button 
                        variant={'ghost'} 
                        size="sm" 
                        onClick={(e) => {
                            e.stopPropagation();
                            onUpvoteToggle(suggestion.id);
                        }}
                        className={cn('text-muted-foreground', isUpvoted && "text-primary")}
                    >
                        <ThumbsUp className={cn('mr-2 h-4 w-4', isUpvoted && "fill-primary")} />
                        <span>{suggestion.upvotes}</span>
                    </Button>
                    <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4"/>
                        <span>{suggestion.comments.length}</span>
                    </div>
                </div>
              </div>
            </div>
        )
      })}
       {suggestions.length === 0 && (
            <p className="text-muted-foreground mt-4 text-center col-span-full">
                No suggestions yet. Be the first to add one!
            </p>
        )}
    </div>
  )
}
