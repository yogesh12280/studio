'use client'

import { useState, useMemo, useEffect } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { initialSuggestions } from '@/lib/data'
import type { Suggestion, Comment } from '@/lib/types'
import { SuggestionList } from '@/components/suggestion-list'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { SuggestionCard } from '@/components/suggestion-card'
import { DeleteSuggestionDialog } from '@/components/delete-suggestion-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { CreateSuggestionDialog } from '@/components/create-suggestion-dialog'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { DatePicker } from '@/components/ui/date-picker'
import { FeaturedSuggestions } from '@/components/featured-suggestions'

export default function SuggestionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  const [suggestionToEdit, setSuggestionToEdit] = useState<Suggestion | null>(null);
  const [suggestionToDelete, setSuggestionToDelete] = useState<Suggestion | null>(null);
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
      setSuggestions(initialSuggestions);
      setLoading(false);
    }, 1000);

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    setStartDate(oneYearAgo);
    setEndDate(today);
  }, []);

  if (!currentUser) return null;

  const handleAddSuggestion = (newSuggestionData: Omit<Suggestion, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'comments'>) => {
    const newSuggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatarUrl: currentUser.avatarUrl,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      comments: [],
      ...newSuggestionData,
    }
    setSuggestions(prev => [newSuggestion, ...prev])
  }
  
  const handleEditSuggestion = (updatedSuggestion: Suggestion) => {
    setSuggestions(prev => prev.map(s => (s.id === updatedSuggestion.id ? updatedSuggestion : s)));
    if (selectedSuggestion?.id === updatedSuggestion.id) {
        setSelectedSuggestion(updatedSuggestion);
    }
    setSuggestionToEdit(null);
    setIsEditOpen(false);
  }

  const handleDeleteSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    setSuggestionToDelete(null);
    setIsDeleteOpen(false);
    if (selectedSuggestion?.id === suggestionId) {
        setSelectedSuggestion(null);
    }
  }

  const handleUpvoteToggle = (suggestionId: string) => {
    const newSuggestions = suggestions.map(s => {
      if (s.id === suggestionId) {
        const isUpvoted = s.upvotedBy.includes(currentUser.id)
        return {
          ...s,
          upvotes: isUpvoted ? s.upvotes - 1 : s.upvotes + 1,
          upvotedBy: isUpvoted ? s.upvotedBy.filter(id => id !== currentUser.id) : [...s.upvotedBy, currentUser.id]
        };
      }
      return s
    });
    setSuggestions(newSuggestions);

    if (selectedSuggestion && selectedSuggestion.id === suggestionId) {
      setSelectedSuggestion(newSuggestions.find(s => s.id === suggestionId) || null);
    }
  }

  const handleAddComment = (suggestionId: string, commentText: string) => {
    const newSuggestions = suggestions.map(s => {
      if (s.id === suggestionId) {
        const newComment: Comment = {
          id: `comment-${Date.now()}`,
          user: {
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
          },
          text: commentText,
          timestamp: new Date().toISOString(),
          replies: [],
        }
        const updatedSuggestion = {
          ...s,
          comments: [...s.comments, newComment],
        };
        if (selectedSuggestion && selectedSuggestion.id === suggestionId) {
            setSelectedSuggestion(updatedSuggestion);
        }
        return updatedSuggestion;
      }
      return s;
    });
    setSuggestions(newSuggestions);
  };
  
  const handleAddReply = (suggestionId: string, commentId: string, replyText: string) => {
    const newSuggestions = suggestions.map(s => {
      if (s.id === suggestionId) {
        const newReply: Comment = {
          id: `reply-${Date.now()}`,
          user: {
            name: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
          },
          text: replyText,
          timestamp: new Date().toISOString(),
        };

        const updatedComments = s.comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply],
            };
          }
          return c;
        });

        const updatedSuggestion = { ...s, comments: updatedComments };
        
        if (selectedSuggestion && selectedSuggestion.id === suggestionId) {
            setSelectedSuggestion(updatedSuggestion);
        }
        return updatedSuggestion;
      }
      return s;
    });
    setSuggestions(newSuggestions);
  };

  const handleSelectSuggestion = (suggestion: Suggestion) => {
    setSelectedSuggestion(suggestion);
  };
  
  const openEditDialog = (suggestion: Suggestion) => {
    setSuggestionToEdit(suggestion);
    setIsEditOpen(true);
  }

  const openDeleteDialog = (suggestion: Suggestion) => {
    setSuggestionToDelete(suggestion);
    setIsDeleteOpen(true);
  }

  const handleBackToList = () => {
    setSelectedSuggestion(null);
  };

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => {
      const searchLower = searchQuery.toLowerCase()
      const textMatch = suggestion.title.toLowerCase().includes(searchLower) ||
        suggestion.description.toLowerCase().includes(searchLower) ||
        suggestion.employeeName.toLowerCase().includes(searchLower)

      const dateMatch = (() => {
          if (!startDate && !endDate) return true;
          const suggestionDate = new Date(suggestion.createdAt);
          const start = startDate ? startOfDay(startDate) : undefined;
          const end = endDate ? endOfDay(endDate) : undefined;
          if (start && end) {
              return isWithinInterval(suggestionDate, { start, end });
          }
          if (start) {
              return suggestionDate >= start;
          }
          if (end) {
              return suggestionDate <= end;
          }
          return true;
      })();
      
      return textMatch && dateMatch
    }).sort((a, b) => b.upvotes - a.upvotes)
  }, [suggestions, searchQuery, startDate, endDate]);
  
  const paginatedSuggestions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredSuggestions.slice(startIndex, startIndex + pageSize);
  }, [filteredSuggestions, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredSuggestions.length / pageSize);


  const renderLoadingState = () => (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
         <div key={i} className="border rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="w-full">
                    <Skeleton className="h-4 w-1/4 mb-1" />
                    <Skeleton className="h-3 w-1/5" />
                </div>
            </div>
            <Skeleton className="h-5 w-3/4 mb-1 ml-12" />
            <Skeleton className="h-4 w-full ml-12 mb-3" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-24" />
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
          title="Suggestions"
          onAddSuggestion={handleAddSuggestion}
        />
        <main className="p-4 sm:p-6">
            {selectedSuggestion ? (
                <div className="max-w-2xl mx-auto">
                     <Button variant="ghost" onClick={handleBackToList} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to all suggestions
                    </Button>
                    <SuggestionCard 
                        suggestion={selectedSuggestion}
                        onUpvoteToggle={handleUpvoteToggle}
                        onAddComment={handleAddComment}
                        onAddReply={handleAddReply}
                        onEdit={() => openEditDialog(selectedSuggestion)}
                        onDelete={() => openDeleteDialog(selectedSuggestion)}
                        currentUser={currentUser}
                    />
                </div>
            ) : (
                <>
                    {loading ? renderLoadingState() : (
                      <>
                        <FeaturedSuggestions suggestions={suggestions} onSelectSuggestion={handleSelectSuggestion} />
                        <div className="mb-4 flex items-center gap-2">
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
                        <SuggestionList 
                            suggestions={paginatedSuggestions} 
                            onUpvoteToggle={handleUpvoteToggle}
                            onSelectSuggestion={handleSelectSuggestion}
                            currentUser={currentUser}
                            totalSuggestions={filteredSuggestions.length}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            totalPages={totalPages}
                            setCurrentPage={setCurrentPage}
                            setPageSize={setPageSize}
                        />
                      </>
                    )}
                </>
            )}
        </main>
        {suggestionToEdit && (
            <CreateSuggestionDialog
                mode="edit"
                suggestionToEdit={suggestionToEdit}
                onSuggestionSubmit={handleEditSuggestion}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
            />
        )}
        {suggestionToDelete && (
          <DeleteSuggestionDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={() => handleDeleteSuggestion(suggestionToDelete.id)}
            suggestion={suggestionToDelete}
          />
        )}
      </div>
    </SidebarProvider>
  )
}
