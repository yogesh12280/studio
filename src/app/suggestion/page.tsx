'use client'

import { useState, useMemo } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { initialSuggestions } from '@/lib/data'
import type { Suggestion, Comment } from '@/lib/types'
import { SuggestionList } from '@/components/suggestion-list'
import { CreateSuggestionDialog } from '@/components/create-suggestion-dialog'
import { Button } from '@/components/ui/button'
import { PlusCircle, ArrowLeft } from 'lucide-react'
import { SuggestionCard } from '@/components/suggestion-card'

export default function SuggestionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

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

  const handleBackToList = () => {
    setSelectedSuggestion(null);
  };


  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(suggestion => 
      suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.upvotes - a.upvotes)
  }, [suggestions, searchQuery]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="min-h-screen bg-background md:pl-[3rem]">
        <AppHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          title="Suggestions"
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
                        currentUser={currentUser}
                    />
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold font-headline">Suggestion Box</h2>
                        {currentUser.role === 'Employee' && (
                            <CreateSuggestionDialog onSuggestionSubmit={handleAddSuggestion}>
                                <Button>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Suggestion
                                </Button>
                            </CreateSuggestionDialog>
                        )}
                    </div>
                    <SuggestionList 
                        suggestions={filteredSuggestions} 
                        onUpvoteToggle={handleUpvoteToggle}
                        onSelectSuggestion={handleSelectSuggestion}
                        currentUser={currentUser}
                    />
                </>
            )}
        </main>
      </div>
    </SidebarProvider>
  )
}
