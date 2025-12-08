'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThumbsUp, MessageSquare } from 'lucide-react'
import type { Suggestion, User } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useUser } from '@/contexts/user-context'
import { employees } from '@/lib/data'

interface SuggestionListProps {
  suggestions: Suggestion[];
  onUpvoteToggle: (suggestionId: string) => void;
  onSelectSuggestion: (suggestion: Suggestion) => void;
  currentUser: User;
}

export function SuggestionList({ suggestions, onUpvoteToggle, onSelectSuggestion, currentUser }: SuggestionListProps) {
  const [upvotePopoverOpen, setUpvotePopoverOpen] = useState<string | null>(null);
  const { users } = useUser();
  const allUsers = [...users, ...employees];
  
  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => {
        const isUpvoted = suggestion.upvotedBy.includes(currentUser.id);
        const upvoters = suggestion.upvotedBy
          .map(userId => allUsers.find(u => u.id === userId))
          .filter((u): u is User => !!u);

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
                 <div className="flex justify-between items-center ml-12">
                  <h3 className="font-bold truncate pr-4">{suggestion.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                      <Popover open={upvotePopoverOpen === suggestion.id} onOpenChange={(isOpen) => setUpvotePopoverOpen(isOpen ? suggestion.id : null)}>
                        <PopoverTrigger asChild>
                          <Button 
                              variant={'ghost'} 
                              size="sm" 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  onUpvoteToggle(suggestion.id);
                              }}
                              onMouseEnter={() => setUpvotePopoverOpen(suggestion.id)}
                              onMouseLeave={() => setUpvotePopoverOpen(null)}
                              className={cn('text-muted-foreground', isUpvoted && "text-primary")}
                          >
                              <ThumbsUp className={cn('mr-2 h-4 w-4', isUpvoted && "fill-primary")} />
                              <span>{suggestion.upvotes}</span>
                          </Button>
                        </PopoverTrigger>
                        {upvoters.length > 0 && (
                          <PopoverContent className="w-auto max-w-xs">
                            <div className="flex flex-col gap-2">
                              <p className="font-semibold text-sm">Upvoted by</p>
                              <div className="flex flex-wrap gap-2">
                                {upvoters.map(user => (
                                  <div key={user.id} className="flex items-center gap-2 text-xs">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        )}
                      </Popover>
                      <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4"/>
                          <span>{suggestion.comments.length}</span>
                      </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 ml-12 mt-1">{suggestion.description}</p>
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
