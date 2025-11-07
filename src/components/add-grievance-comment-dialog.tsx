'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { Grievance } from '@/lib/types'
import { Label } from './ui/label'

interface AddGrievanceCommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grievance: Grievance | null;
  targetStatus: Grievance['status'] | null;
  onSubmit: (comment: string) => void;
}

export function AddGrievanceCommentDialog({ open, onOpenChange, grievance, targetStatus, onSubmit }: AddGrievanceCommentDialogProps) {
  const { toast } = useToast()
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (open) {
      setComment('')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!comment) {
        toast({
            variant: "destructive",
            title: "Missing Comment",
            description: "Please provide a comment for this status change.",
        })
        return
    }
    
    onSubmit(comment)

    toast({
      title: 'Grievance Updated',
      description: `The grievance status has been set to "${targetStatus}".`,
    })
    
    onOpenChange(false)
  }
  
  if (!grievance || !targetStatus) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Update Grievance Status</DialogTitle>
          <DialogDescription>
            Add a comment for changing status to &quot;{targetStatus}&quot; for &quot;{grievance.subject}&quot;.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-start gap-2">
              <Label htmlFor="comment">
                Comment
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="min-h-[120px]"
                placeholder={`Add a comment to notify ${grievance.employeeName}...`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Update Status</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
