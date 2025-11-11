'use client'

import { useState, useEffect } from 'react'
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
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useToast } from '@/hooks/use-toast'
import type { Appreciation, User } from '@/lib/types'
import { useUser } from '@/contexts/user-context'
import { employees } from '@/lib/data'

interface CreateAppreciationDialogProps {
  children: React.ReactNode;
  onSave: (newAppreciation: Omit<Appreciation, 'id' | 'fromUser' | 'createdAt' | 'likes' | 'likedBy'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateAppreciationDialog({ children, onSave, open: openProp, onOpenChange: onOpenChangeProp }: CreateAppreciationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = openProp ?? internalOpen
  const onOpenChange = onOpenChangeProp ?? setInternalOpen

  const { toast } = useToast()
  const { users } = useUser()

  const allUsers = [...users, ...employees];

  // Form state
  const [toUserId, setToUserId] = useState<string>('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (open) {
      setToUserId('')
      setMessage('')
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!toUserId || !message) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please select a recipient and write a message.",
      })
      return
    }

    const toUser = allUsers.find(u => u.id === toUserId)
    if (!toUser) {
        toast({
            variant: "destructive",
            title: "Invalid Recipient",
            description: "The selected user could not be found.",
        })
        return
    }

    onSave({
      toUser: {
        id: toUser.id,
        name: toUser.name,
        avatarUrl: toUser.avatarUrl,
      },
      message,
    })

    toast({
      title: 'Appreciation Sent!',
      description: 'Your message has been shared with the team.',
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Send Appreciation</DialogTitle>
          <DialogDescription>
            Recognize a colleague for their hard work and positive impact.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="to-user" className="text-right">
                To
              </Label>
              <Select required value={toUserId} onValueChange={setToUserId}>
                <SelectTrigger className="col-span-3" id="to-user">
                  <SelectValue placeholder="Select a colleague" />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="col-span-3 min-h-[140px]"
                placeholder="Write your message of appreciation..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Send Appreciation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
