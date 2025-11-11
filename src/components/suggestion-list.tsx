'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThumbsUp } from 'lucide-react'
import type { Suggestion, User } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface SuggestionListProps {
  suggestions: Suggestion[];
  onUpvoteToggle: (suggestionId: string) => void;
  currentUser: User;
}

export function SuggestionList({ suggestions, onUpvoteToggle, currentUser }: SuggestionListProps) {
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((suggestion) => {
        const isUpvoted = suggestion.upvotedBy.includes(currentUser.id);
        return (
            <Card key={suggestion.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                  <Avatar>
                      <AvatarImage src={suggestion.employeeAvatarUrl} alt={suggestion.employeeName} />
                      <AvatarFallback>{suggestion.employeeName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{suggestion.employeeName}</p>
                    <p className="text-xs text-muted-foreground">
                        Submitted {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                    </p>
                  </div>
              </CardHeader>
              <CardContent className="flex-1">
                <h3 className="font-bold mb-2">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
              </CardContent>
              <CardFooter>
                 <Button 
                    variant={isUpvoted ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => onUpvoteToggle(suggestion.id)}
                    className="w-full"
                >
                    <ThumbsUp className={cn('mr-2 h-4 w-4', isUpvoted && "fill-current")} />
                    <span>Upvote ({suggestion.upvotes})</span>
                </Button>
              </CardFooter>
            </Card>
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
