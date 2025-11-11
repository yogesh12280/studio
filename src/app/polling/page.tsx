'use client';

import { useState, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { PollFeed } from '@/components/poll-feed';
import { initialPolls } from '@/lib/data';
import { useUser } from '@/contexts/user-context';
import type { Poll } from '@/lib/types';

export default function PollingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const { currentUser } = useUser();

  const handleAddPoll = (newPollData: Omit<Poll, 'id' | 'author' | 'votedBy' | 'createdAt'>) => {
    const newPoll: Poll = {
      id: `poll-${Date.now()}`,
      author: {
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      },
      votedBy: [],
      createdAt: new Date().toISOString(),
      ...newPollData,
    };
    setPolls((prev) => [newPoll, ...prev]);
  };

  const handleVote = (pollId: string, optionId: string) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) => {
        if (poll.id === pollId) {
          if (poll.votedBy.includes(currentUser.id)) return poll; // Already voted

          const updatedOptions = poll.options.map((option) =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option
          );

          return {
            ...poll,
            options: updatedOptions,
            votedBy: [...poll.votedBy, currentUser.id],
          };
        }
        return poll;
      })
    );
  };
  
  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      const searchLower = searchQuery.toLowerCase();
      return (
        poll.question.toLowerCase().includes(searchLower) ||
        poll.author.name.toLowerCase().includes(searchLower)
      );
    }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [polls, searchQuery]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Polling"
          onAddPoll={handleAddPoll}
        />
        <main className="p-4 sm:p-6">
          <PollFeed polls={filteredPolls} onVote={handleVote} />
        </main>
      </div>
    </SidebarProvider>
  );
}
