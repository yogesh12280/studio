'use client';

import { useMemo } from 'react';
import type { Poll } from '@/lib/types';
import { PollList } from './poll-list';
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface PollFeedProps {
  polls: Poll[];
  onSelectPoll: (poll: Poll) => void;
  searchQuery: string;
  dateRange?: DateRange;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function PollFeed({ 
  polls, 
  onSelectPoll, 
  searchQuery,
  dateRange,
  currentPage,
  pageSize,
  setCurrentPage,
  setPageSize,
}: PollFeedProps) {

  const filteredPolls = useMemo(() => {
    return polls.filter(poll => {
      const searchLower = searchQuery.toLowerCase();
      const textMatch = poll.question.toLowerCase().includes(searchLower) ||
        poll.author.name.toLowerCase().includes(searchLower)
        
      const dateMatch = (() => {
            if (!dateRange?.from && !dateRange?.to) return true;
            const pollDate = new Date(poll.createdAt);
            const start = dateRange.from ? startOfDay(dateRange.from) : undefined;
            const end = dateRange.to ? endOfDay(dateRange.to) : undefined;
            if (start && end) {
                return isWithinInterval(pollDate, { start, end });
            }
            if (start) {
                return pollDate >= start;
            }
            if (end) {
                return pollDate <= end;
            }
            return true;
        })();

      return textMatch && dateMatch;
    }).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [polls, searchQuery, dateRange]);

  const paginatedPolls = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPolls.slice(startIndex, startIndex + pageSize);
  }, [filteredPolls, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPolls.length / pageSize);

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  }

  if (filteredPolls.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">No polls found.</p>;
  }
  
  return (
    <div className="mt-6">
      <PollList polls={paginatedPolls} onSelectPoll={onSelectPoll} />
       <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Page {currentPage} of {totalPages}</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map(size => (
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
    </div>
  );
}
