'use client';

import { useState, useMemo } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { PollFeed } from '@/components/poll-feed';
import { initialPolls } from '@/lib/data';
import { useUser } from '@/contexts/user-context';
import type { Poll } from '@/lib/types';
import { PollCard } from '@/components/poll-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PollingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const { currentUser } = useUser();
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);

  if (!currentUser) return null;

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

          const updatedPoll = {
            ...poll,
            options: updatedOptions,
            votedBy: [...poll.votedBy, currentUser.id],
          };

          if(selectedPoll?.id === pollId) {
            setSelectedPoll(updatedPoll);
          }
          return updatedPoll;
        }
        return poll;
      })
    );
  };
  
  const handleSelectPoll = (poll: Poll) => {
    setSelectedPoll(poll);
  };

  const handleBackToList = () => {
    setSelectedPoll(null);
  }

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
           {selectedPoll ? (
            <div className="max-w-2xl mx-auto">
              <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to all polls
              </Button>
              <PollCard 
                poll={selectedPoll}
                onVote={handleVote}
              />
            </div>
          ) : (
            <PollFeed polls={filteredPolls} onSelectPoll={handleSelectPoll} />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
}
