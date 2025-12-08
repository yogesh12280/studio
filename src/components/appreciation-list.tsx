'use client'

import { useState } from 'react';
import type { Appreciation, User } from '@/lib/types';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Heart, MoreVertical, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useUser } from '@/contexts/user-context';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { employees } from '@/lib/data';


interface AppreciationListProps {
  appreciations: Appreciation[];
  onLikeToggle: (appreciationId: string) => void;
  onEdit: (appreciation: Appreciation) => void;
  onDelete: (appreciation: Appreciation) => void;
  totalAppreciations: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function AppreciationList({
  appreciations,
  onLikeToggle,
  onEdit,
  onDelete,
  totalAppreciations,
  currentPage,
  pageSize,
  totalPages,
  setCurrentPage,
  setPageSize,
}: AppreciationListProps) {
  const { currentUser, users } = useUser();
  const [likePopoverOpen, setLikePopoverOpen] = useState<string | null>(null);
  const allUsers = [...users, ...employees];


  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  if (!currentUser) return null;

  if (appreciations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No appreciations found for the selected criteria.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
            {appreciations.map(appreciation => {
              const isLiked = appreciation.likedBy.includes(currentUser.id);
              const canModify = appreciation.fromUser.id === currentUser.id;
              const likers = appreciation.likedBy
                .map(userId => allUsers.find(u => u.id === userId))
                .filter((u): u is User => !!u);

              return (
                <div key={appreciation.id} className="p-3 flex items-center gap-4 border rounded-lg">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={appreciation.fromUser.avatarUrl} alt={appreciation.fromUser.name} />
                      <AvatarFallback>{appreciation.fromUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={appreciation.toUser.avatarUrl} alt={appreciation.toUser.name} />
                      <AvatarFallback>{appreciation.toUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">
                      {appreciation.fromUser.name} <span className="text-muted-foreground font-normal">to</span> {appreciation.toUser.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate" title={appreciation.message}>
                      &ldquo;{appreciation.message}&rdquo;
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                    <span className="hidden md:inline">{formatDistanceToNow(new Date(appreciation.createdAt), { addSuffix: true })}</span>
                    
                    <Popover open={likePopoverOpen === appreciation.id} onOpenChange={(isOpen) => setLikePopoverOpen(isOpen ? appreciation.id : null)}>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="gap-1 h-8 px-2"
                          onClick={(e) => { e.stopPropagation(); onLikeToggle(appreciation.id); }}
                          onMouseEnter={() => setLikePopoverOpen(appreciation.id)}
                          onMouseLeave={() => setLikePopoverOpen(null)}
                        >
                          <Heart className={cn('h-4 w-4', isLiked && 'fill-red-500 text-red-500')} />
                          <span>{appreciation.likes}</span>
                        </Button>
                      </PopoverTrigger>
                      {likers.length > 0 && (
                        <PopoverContent className="w-auto max-w-xs" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-2">
                            <p className="font-semibold text-sm">Liked by</p>
                            <div className="flex flex-wrap gap-2">
                              {likers.map(user => (
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

                    {canModify && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem onSelect={() => onEdit(appreciation)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => onDelete(appreciation)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Page {currentPage} of {totalPages}</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 5, 10, 20, 50].map(size => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
