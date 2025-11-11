'use client';

import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Poll } from '@/lib/types';
import { PollCard } from './poll-card';

interface PollFeedProps {
  polls: Poll[];
  onVote: (pollId: string, optionId: string) => void;
}

export function PollFeed({ polls, onVote }: PollFeedProps) {
  const organizationPolls = useMemo(
    () => polls.filter((p) => p.category === 'Organization'),
    [polls]
  );
  const employeePolls = useMemo(
    () => polls.filter((p) => p.category === 'Employee'),
    [polls]
  );

  const renderPollList = (pollList: Poll[]) => {
    if (pollList.length === 0) {
      return <p className="text-muted-foreground mt-4 text-center">No polls found.</p>;
    }
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {pollList.map((poll) => (
          <PollCard key={poll.id} poll={poll} onVote={onVote} />
        ))}
      </div>
    );
  };

  return (
    <Tabs defaultValue="organization" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
        <TabsTrigger value="organization">Organization</TabsTrigger>
        <TabsTrigger value="employee">Employee</TabsTrigger>
      </TabsList>
      <TabsContent value="organization" className="mt-6">
        {renderPollList(organizationPolls)}
      </TabsContent>
      <TabsContent value="employee" className="mt-6">
        {renderPollList(employeePolls)}
      </TabsContent>
    </Tabs>
  );
}
