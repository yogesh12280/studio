'use client';

import { useMemo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Poll } from '@/lib/types';
import { PollList } from './poll-list';

interface PollFeedProps {
  polls: Poll[];
  onSelectPoll: (poll: Poll) => void;
}

export function PollFeed({ polls, onSelectPoll }: PollFeedProps) {
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
      <PollList polls={pollList} onSelectPoll={onSelectPoll} />
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
