'use client';

import { useState, useMemo, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { PollFeed } from '@/components/poll-feed';
import { initialPolls } from '@/lib/data';
import { useUser } from '@/contexts/user-context';
import type { Poll } from '@/lib/types';
import { PollCard } from '@/components/poll-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { CreatePollDialog } from '@/components/create-poll-dialog';
import { DeletePollDialog } from '@/components/delete-poll-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';

export default function PollingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [polls, setPolls] = useState<Poll[]>([]);
  const { currentUser } = useUser();
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollToEdit, setPollToEdit] = useState<Poll | null>(null);
  const [pollToDelete, setPollToDelete] = useState<Poll | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching data
    setTimeout(() => {
      setPolls(initialPolls);
      setLoading(false);
    }, 1000);

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    setStartDate(oneYearAgo);
    setEndDate(today);
  }, []);

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
  
  const handleEditPoll = (updatedPoll: Poll) => {
    setPolls(prev => prev.map(p => p.id === updatedPoll.id ? updatedPoll : p));
    if (selectedPoll?.id === updatedPoll.id) {
        setSelectedPoll(updatedPoll);
    }
    setPollToEdit(null);
    setIsEditOpen(false);
  }
  
  const handleDeletePoll = (pollId: string) => {
    setPolls(prev => prev.filter(p => p.id !== pollId));
    if (selectedPoll?.id === pollId) {
        setSelectedPoll(null);
    }
    setPollToDelete(null);
    setIsDeleteOpen(false);
  }

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
  
  const openEditDialog = (poll: Poll) => {
    setPollToEdit(poll);
    setIsEditOpen(true);
  }

  const openDeleteDialog = (poll: Poll) => {
    setPollToDelete(poll);
    setIsDeleteOpen(true);
  }
  
  const handleSelectPoll = (poll: Poll) => {
    setSelectedPoll(poll);
  };

  const handleBackToList = () => {
    setSelectedPoll(null);
  }

  const renderLoadingState = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-6 w-3/4 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

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
          {loading ? renderLoadingState() : (
            selectedPoll ? (
              <div className="max-w-2xl mx-auto">
                <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to all polls
                </Button>
                <PollCard 
                  poll={selectedPoll}
                  onVote={handleVote}
                  onEdit={() => openEditDialog(selectedPoll)}
                  onDelete={() => openDeleteDialog(selectedPoll)}
                />
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                        type="search"
                        placeholder="Search polls..."
                        className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <DatePicker 
                      date={startDate} 
                      onDateChange={setStartDate} 
                      placeholder="Start date" 
                      disabled={{ after: endDate }}
                    />
                    <DatePicker 
                      date={endDate} 
                      onDateChange={setEndDate} 
                      placeholder="End date" 
                      disabled={{ before: startDate }}
                    />
                </div>
                <PollFeed 
                    polls={polls} 
                    onSelectPoll={handleSelectPoll} 
                    searchQuery={searchQuery}
                    dateRange={{from: startDate, to: endDate}}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    setCurrentPage={setCurrentPage}
                    setPageSize={setPageSize}
                />
              </>
            )
          )}
        </main>
        {pollToEdit && (
            <CreatePollDialog
                mode="edit"
                pollToEdit={pollToEdit}
                onSave={handleEditPoll}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        )}
        {pollToDelete && (
          <DeletePollDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={() => handleDeletePoll(pollToDelete.id)}
            poll={pollToDelete}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
