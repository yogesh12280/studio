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

type CreateAppreciationDialogProps = {
  children?: React.ReactNode;
  mode: 'create';
  onSave: (newAppreciation: Omit<Appreciation, 'id' | 'fromUser' | 'createdAt' | 'likes' | 'likedBy'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type EditAppreciationDialogProps = {
  mode: 'edit';
  appreciationToEdit: Appreciation;
  onSave: (appreciation: Appreciation) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

type AppreciationDialogProps = CreateAppreciationDialogProps | EditAppreciationDialogProps;

export function CreateAppreciationDialog(props: AppreciationDialogProps) {
  const { mode } = props;
  const isEditMode = mode === 'edit';

  const [internalOpen, setInternalOpen] = useState(false)
  const open = props.open ?? internalOpen
  const onOpenChange = props.onOpenChange ?? setInternalOpen

  const { toast } = useToast()
  const { users, currentUser } = useUser()

  if (!currentUser) return null;

  const allUsers = [...users, ...employees].filter(u => u.id !== currentUser.id);

  // Form state
  const [toUserId, setToUserId] = useState<string>('')
  const [message, setMessage] = useState('')
  
  const appreciationToEdit = isEditMode ? props.appreciationToEdit : undefined;

  useEffect(() => {
    if (open) {
      if (isEditMode && appreciationToEdit) {
        setToUserId(appreciationToEdit.toUser.id);
        setMessage(appreciationToEdit.message);
      } else {
        setToUserId('')
        setMessage('')
      }
    }
  }, [open, isEditMode, appreciationToEdit])

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

    const toUser = [...users, ...employees].find(u => u.id === toUserId)
    if (!toUser) {
        toast({
            variant: "destructive",
            title: "Invalid Recipient",
            description: "The selected user could not be found.",
        })
        return
    }

    if (isEditMode && appreciationToEdit) {
      const updatedAppreciation: Appreciation = {
        ...appreciationToEdit,
        toUser: {
          id: toUser.id,
          name: toUser.name,
          avatarUrl: toUser.avatarUrl,
        },
        message,
      };
      (props.onSave as (appreciation: Appreciation) => void)(updatedAppreciation);
      toast({
        title: 'Appreciation Updated!',
        description: 'Your message has been successfully updated.',
      })
    } else {
      (props.onSave as (appreciation: Omit<Appreciation, 'id' | 'fromUser' | 'createdAt' | 'likes' | 'likedBy'>) => void)({
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
    }

    setTimeout(() => {
      onOpenChange(false)
    }, 100);
  }
  
  const dialogTitle = isEditMode ? 'Edit Appreciation' : 'Send Appreciation';
  const dialogDescription = isEditMode ? 'Make changes to your message of appreciation.' : 'Recognize a colleague for their hard work and positive impact.';
  const buttonText = isEditMode ? 'Save Changes' : 'Send Appreciation';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditMode && props.children && <DialogTrigger asChild>{props.children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
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
            <Button type="submit">{buttonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
