'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow, format } from 'date-fns';
import type { Poll, User } from '@/lib/types';
import { useUser } from '@/contexts/user-context';
import { cn } from '@/lib/utils';
import { Users, CalendarOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { employees } from '@/lib/data';

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionId: string) => void;
}

export function PollCard({ poll, onVote }: PollCardProps) {
  const { currentUser, users } = useUser();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [voterListOpen, setVoterListOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasVoted = poll.votedBy.includes(currentUser.id);
  const totalVotes = useMemo(
    () => poll.options.reduce((sum, option) => sum + option.votes, 0),
    [poll.options]
  );
  
  const voters = useMemo(() => {
    const allUsers = [...users, ...employees];
    return poll.votedBy
      .map(userId => allUsers.find(u => u.id === userId))
      .filter((u): u is User => !!u);
  }, [poll.votedBy, users]);

  const now = new Date();
  const endDate = poll.endDate ? new Date(poll.endDate) : undefined;
  const isExpired = endDate && endDate < now;

  const handleVote = () => {
    if (selectedOption) {
      onVote(poll.id, selectedOption);
    }
  };

  const getVotePercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return (votes / totalVotes) * 100;
  };
  
  const createdAtDate = new Date(poll.createdAt);
  const formattedCreatedAt = isClient
    ? formatDistanceToNow(createdAtDate, { addSuffix: true })
    : '';
  const formattedEndDate = isClient && endDate
    ? format(endDate, "MMM d, yyyy")
    : '';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-4 p-4">
        <Avatar>
          <AvatarImage src={poll.author.avatarUrl} alt={poll.author.name} />
          <AvatarFallback>{poll.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-semibold">{poll.author.name}</p>
          <p className="text-xs text-muted-foreground">
            {isClient ? <time dateTime={createdAtDate.toISOString()}>{formattedCreatedAt}</time> : <span>&nbsp;</span>}
          </p>
        </div>
        <Badge variant={poll.category === 'Organization' ? 'default' : 'secondary'}>
          {poll.category}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="text-lg font-bold mb-4">{poll.question}</h3>
        {isExpired && (
          <Badge variant="destructive" className="mb-4">
            <CalendarOff className="mr-1 h-3 w-3" />
            Poll closed on {formattedEndDate}
          </Badge>
        )}
        <div className="space-y-4">
          {hasVoted || isExpired ? (
            // Results view
            <div className="space-y-3">
              {poll.options.map((option) => (
                <div key={option.id}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <p className="font-medium">{option.text}</p>
                    <span className="text-muted-foreground">
                      {option.votes} vote{option.votes !== 1 ? 's' : ''} ({getVotePercentage(option.votes).toFixed(0)}%)
                    </span>
                  </div>
                  <Progress value={getVotePercentage(option.votes)} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            // Voting view
            <RadioGroup onValueChange={setSelectedOption} className="space-y-2">
              {poll.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`${poll.id}-${option.id}`} />
                  <Label htmlFor={`${poll.id}-${option.id}`} className="flex-1 cursor-pointer py-2">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 flex items-center justify-between text-sm">
        <Popover open={voterListOpen} onOpenChange={setVoterListOpen}>
            <PopoverTrigger
                onMouseEnter={() => setVoterListOpen(true)}
                onMouseLeave={() => setVoterListOpen(false)}
                className="flex items-center gap-2 text-muted-foreground"
            >
                <Users className="h-4 w-4" />
                <span>{totalVotes} total votes</span>
            </PopoverTrigger>
            {voters.length > 0 && (
                <PopoverContent className="w-auto max-w-xs">
                    <div className="flex flex-col gap-2">
                    <p className="font-semibold text-sm">Voted by</p>
                    <div className="flex flex-wrap gap-2">
                        {voters.map(user => (
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
        {!hasVoted && !isExpired && (
          <Button onClick={handleVote} disabled={!selectedOption}>
            Submit Vote
          </Button>
        )}
        {hasVoted && !isExpired && (
          <p className="text-sm font-medium text-primary">You have voted.</p>
        )}
      </CardFooter>
    </Card>
  );
}
