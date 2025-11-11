'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { Suggestion } from '@/lib/types'

interface CreateSuggestionDialogProps {
  children: React.ReactNode
  onSuggestionSubmit: (newSuggestion: Omit<Suggestion, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'comments'>) => void
}

export function CreateSuggestionDialog({ children, onSuggestionSubmit }: CreateSuggestionDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please fill out both title and description.",
        })
        return
    }
    
    onSuggestionSubmit({
      title,
      description,
    })

    toast({
      title: 'Suggestion Submitted!',
      description: 'Thank you for your feedback.',
    })
    
    setTitle('')
    setDescription('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Submit a Suggestion</DialogTitle>
          <DialogDescription>
            Have an idea to improve our workplace? Share it with us!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="col-span-3"
                placeholder="A brief title for your suggestion"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="col-span-3 min-h-[140px]"
                placeholder="Describe your suggestion in detail..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Suggestion</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
