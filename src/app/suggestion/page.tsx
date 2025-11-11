'use client'

import { useState, useMemo } from 'react'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { initialSuggestions } from '@/lib/data'
import type { Suggestion } from '@/lib/types'
import { SuggestionList } from '@/components/suggestion-list'
import { CreateSuggestionDialog } from '@/components/create-suggestion-dialog'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'

export default function SuggestionPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { currentUser } = useUser()
  const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions)

  const handleAddSuggestion = (newSuggestionData: Omit<Suggestion, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt' | 'upvotes' | 'upvotedBy'>) => {
    const newSuggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeAvatarUrl: currentUser.avatarUrl,
      createdAt: new Date().toISOString(),
      upvotes: 0,
      upvotedBy: [],
      ...newSuggestionData,
    }
    setSuggestions(prev => [newSuggestion, ...prev])
  }

  const handleUpvoteToggle = (suggestionId: string) => {
    setSuggestions(prevSuggestions => 
      prevSuggestions.map(s => {
        if (s.id === suggestionId) {
          const isUpvoted = s.upvotedBy.includes(currentUser.id)
          return {
            ...s,
            upvotes: isUpvoted ? s.upvotes - 1 : s.upvotes + 1,
            upvotedBy: isUpvoted ? s.upvotedBy.filter(id => id !== currentUser.id) : [...s.upvotedBy, currentUser.id]
          };
        }
        return s
      })
    )
  }

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
                currentUser={currentUser}
            />
        </main>
      </div>
    </SidebarProvider>
  )
}
