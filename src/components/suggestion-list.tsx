'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ThumbsUp, MessageSquare } from 'lucide-react'
import type { Suggestion, User } from '@/lib/types'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useUser } from '@/contexts/user-context'
import { employees } from '@/lib/data'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

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
              className="cursor-pointer border rounded-lg p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 w-full">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={suggestion.employeeAvatarUrl} alt={suggestion.employeeName} />
                    <AvatarFallback>{suggestion.employeeName.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between min-w-0">
                    <div className="flex-1 min-w-0 pr-4">
                        <p className="font-semibold text-sm truncate" title={suggestion.employeeName}>{suggestion.employeeName}</p>
                        <p className="text-sm font-bold truncate" title={suggestion.title}>{suggestion.title}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0 mt-1 sm:mt-0">
                        <Tooltip>
                            <TooltipTrigger>
                                <span className="text-xs whitespace-nowrap">{format(new Date(suggestion.createdAt), "dd MMM yyyy")}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}</p>
                            </TooltipContent>
                        </Tooltip>

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
                              className={cn('h-8 w-14 text-muted-foreground', isUpvoted && "text-primary")}
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
                      <div className="flex items-center gap-1 h-8 w-14">
                          <MessageSquare className="h-4 w-4 mr-2"/>
                          <span>{suggestion.comments.length}</span>
                      </div>
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
