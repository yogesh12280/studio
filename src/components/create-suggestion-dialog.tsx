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
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { Suggestion } from '@/lib/types'

type CreateSuggestionDialogProps = {
  children: React.ReactNode;
  mode: 'create';
  onSuggestionSubmit: (newSuggestion: Omit<Suggestion, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'comments'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type EditSuggestionDialogProps = {
  mode: 'edit';
  suggestionToEdit: Suggestion;
  onSuggestionSubmit: (suggestion: Suggestion) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

type SuggestionDialogProps = CreateSuggestionDialogProps | EditSuggestionDialogProps;


export function CreateSuggestionDialog(props: SuggestionDialogProps) {
  const { mode } = props;
  const isEditMode = mode === 'edit';

  const [internalOpen, setInternalOpen] = useState(false)
  const open = props.open ?? internalOpen
  const onOpenChange = props.onOpenChange ?? setInternalOpen

  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const suggestionToEdit = isEditMode ? props.suggestionToEdit : undefined;

  useEffect(() => {
    if (open) {
        if (isEditMode && suggestionToEdit) {
            setTitle(suggestionToEdit.title);
            setDescription(suggestionToEdit.description);
        } else {
            setTitle('');
            setDescription('');
        }
    }
  }, [open, isEditMode, suggestionToEdit]);

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
    
    if (isEditMode && suggestionToEdit) {
        (props.onSuggestionSubmit as (suggestion: Suggestion) => void)({
            ...suggestionToEdit,
            title,
            description,
        });
        toast({
            title: 'Suggestion Updated!',
            description: 'Your suggestion has been successfully updated.',
        });
    } else {
        (props.onSuggestionSubmit as (suggestion: Omit<Suggestion, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'comments'>) => void)({
          title,
          description,
        })
       
        toast({
          title: 'Suggestion Submitted!',
          description: 'Thank you for your feedback.',
        })
    }
    
    setTimeout(() => {
      onOpenChange(false)
      setTitle('')
      setDescription('')
    }, 100);
  }
  
  const dialogTitle = isEditMode ? 'Edit Suggestion' : 'Submit a Suggestion';
  const dialogDescription = isEditMode ? 'Make changes to your suggestion.' : 'Have an idea to improve our workplace? Share it with us!';
  const buttonText = isEditMode ? 'Save Changes' : 'Submit Suggestion';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditMode && <DialogTrigger asChild>{props.children}</DialogTrigger>}
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
            <Button type="submit">{buttonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
