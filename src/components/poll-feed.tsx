'use client';

import { useMemo } from 'react';
import type { Poll } from '@/lib/types';
import { PollList } from './poll-list';

interface PollFeedProps {
  polls: Poll[];
  onSelectPoll: (poll: Poll) => void;
  searchQuery: string;
}

export function PollFeed({ polls, onSelectPoll, searchQuery }: PollFeedProps) {

  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      const searchLower = searchQuery.toLowerCase();
      return (
        poll.question.toLowerCase().includes(searchLower) ||
        poll.author.name.toLowerCase().includes(searchLower)
      );
    }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [polls, searchQuery]);


  if (filteredPolls.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">No polls found.</p>;
  }
  
  return (
    <div className="mt-6">
      <PollList polls={filteredPolls} onSelectPoll={onSelectPoll} />
    </div>
  );
}
