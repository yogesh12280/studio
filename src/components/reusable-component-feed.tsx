'use client'

import { useMemo } from 'react'
import type { ReusableComponent } from '@/lib/types'
import { ReusableComponentList } from './reusable-component-list'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { Button } from './ui/button'

interface DateRange {
    from: Date | undefined;
    to: Date | undefined;
}

interface ReusableComponentFeedProps {
  searchQuery: string;
  components: ReusableComponent[];
  onSelectComponent: (component: ReusableComponent) => void;
  dateRange?: DateRange;
  sortBy: string;
  currentPage: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
}

export function ReusableComponentFeed({ 
  searchQuery, 
  components, 
  onSelectComponent, 
  dateRange,
  sortBy,
  currentPage,
  pageSize,
  setCurrentPage,
}: ReusableComponentFeedProps) {

  const filteredComponents = useMemo(() => {
    let sortedComponents = [...components];

    switch (sortBy) {
      case 'Most Liked':
        sortedComponents.sort((a, b) => b.likes - a.likes);
        break;
      case 'Most Utilized':
        sortedComponents.sort((a, b) => b.utilizationByProjects.length - a.utilizationByProjects.length);
        break;
      case 'Most Commented':
        sortedComponents.sort((a, b) => b.comments.length - a.comments.length);
        break;
      case 'Most Viewed':
        sortedComponents.sort((a, b) => b.viewers - a.viewers);
        break;
      case 'Most Recent':
      default:
        sortedComponents.sort((a, b) => {
          const dateA = new Date(a.registeredDate);
          const dateB = new Date(b.registeredDate);
          return dateB.getTime() - dateA.getTime();
        });
        break;
    }

    return sortedComponents
      .filter(component => {
        const searchLower = searchQuery.toLowerCase()
        const textMatch = component.name.toLowerCase().includes(searchLower) ||
          component.description.toLowerCase().includes(searchLower) ||
          component.registeredBy.name.toLowerCase().includes(searchLower) ||
          component.technology.toLowerCase().includes(searchLower)

        const dateMatch = (() => {
            if (!dateRange?.from && !dateRange?.to) return true;
            const componentDate = new Date(component.registeredDate);
            const start = dateRange.from ? startOfDay(dateRange.from) : undefined;
            const end = dateRange.to ? endOfDay(dateRange.to) : undefined;
            if (start && end) {
                return isWithinInterval(componentDate, { start, end });
            }
            if (start) {
                return componentDate >= start;
            }
            if (end) {
                return componentDate <= end;
            }
            return true;
        })();

        return textMatch && dateMatch
      })
  }, [components, searchQuery, dateRange, sortBy])

  const paginatedComponents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredComponents.slice(startIndex, startIndex + pageSize);
  }, [filteredComponents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredComponents.length / pageSize);

  if (filteredComponents.length === 0) {
    return <p className="text-muted-foreground mt-4 text-center">No components found.</p>
  }

  return (
    <div className="mt-4">
      <ReusableComponentList components={paginatedComponents} onSelectComponent={onSelectComponent} />
       <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
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
  )
}
