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
import type { Grievance } from '@/lib/types'

interface RegisterGrievanceDialogProps {
  children: React.ReactNode
  onGrievanceSubmit: (newGrievance: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => void
}

export function RegisterGrievanceDialog({ children, onGrievanceSubmit }: RegisterGrievanceDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject || !description) {
        toast({
            variant: "destructive",
            title: "Missing Fields",
            description: "Please fill out both subject and description.",
        })
        return
    }
    
    onGrievanceSubmit({
      subject,
      description,
      status: 'Pending',
    })

    toast({
      title: 'Grievance Submitted',
      description: 'Your grievance has been registered and will be reviewed shortly.',
    })
    
    setSubject('')
    setDescription('')
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Register Grievance</DialogTitle>
          <DialogDescription>
            Submit a new grievance. Please provide a clear subject and a detailed description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="col-span-3"
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
                placeholder="Describe your issue in detail..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Grievance</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
