
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { CalendarIcon, Plus, X } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user-context'
import { useToast } from '@/hooks/use-toast'
import type { Poll, PollOption } from '@/lib/types'
import { ScrollArea } from './ui/scroll-area'

type CreatePollDialogProps = {
  mode?: 'create';
  onSave: (newPoll: Omit<Poll, 'id' | 'author' | 'votedBy' | 'createdAt'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

type EditPollDialogProps = {
  mode: 'edit';
  pollToEdit: Poll;
  onSave: (poll: Poll) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

type PollDialogProps = CreatePollDialogProps | EditPollDialogProps;

export function CreatePollDialog(props: PollDialogProps) {
  const { mode = 'create' } = props;
  const isEditMode = mode === 'edit';

  const [internalOpen, setInternalOpen] = useState(false);
  const open = props.open ?? internalOpen;
  const onOpenChange = props.onOpenChange ?? setInternalOpen;

  const { currentUser } = useUser()
  const { toast } = useToast()

  // Form state
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<Array<{id?: string, text: string}>>([{text: ''}, {text: ''}]);
  const [category, setCategory] = useState<'Organization' | 'Employee' | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  
  const pollToEdit = isEditMode ? props.pollToEdit : undefined;

  useEffect(() => {
    if (open) {
      if (isEditMode && pollToEdit) {
        setQuestion(pollToEdit.question);
        setOptions(pollToEdit.options.map(opt => ({ id: opt.id, text: opt.text })));
        setCategory(pollToEdit.category);
        setEndDate(pollToEdit.endDate ? new Date(pollToEdit.endDate) : undefined);
      } else {
        setQuestion('');
        setOptions([{text: ''}, {text: ''}]);
        setCategory(currentUser?.role === 'Employee' ? 'Employee' : undefined);
        setEndDate(undefined);
      }
    }
  }, [open, isEditMode, pollToEdit, currentUser]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  }

  const addOption = () => {
    setOptions([...options, { text: '' }]);
  }
  
  const removeOption = (index: number) => {
    if (options.length <= 2) {
        toast({
            variant: "destructive",
            title: "Cannot Remove Option",
            description: "A poll must have at least two options.",
        });
        return;
    }
    setOptions(options.filter((_, i) => i !== index));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question || !category || options.some(opt => !opt.text.trim())) {
        toast({
            variant: "destructive",
            title: "Missing Required Fields",
            description: "Please fill out the question, all options, and select a category.",
        })
        return
    }

    if (isEditMode && pollToEdit) {
        const updatedPoll: Poll = {
            ...pollToEdit,
            question,
            options: options.map((opt, i) => ({
                id: opt.id || `opt-${pollToEdit.id}-${i}`,
                text: opt.text,
                votes: pollToEdit.options.find(o => o.id === opt.id)?.votes ?? 0,
            })),
            category,
            endDate: endDate?.toISOString(),
        };
        (props.onSave as (poll: Poll) => void)(updatedPoll);
        toast({
            title: 'Poll Updated!',
            description: 'Your poll has been successfully updated.',
        });
    } else {
        const newPollData = {
            question,
            options: options.map((opt, i) => ({ id: `opt-${Date.now()}-${i}`, text: opt.text, votes: 0 })),
            category,
            endDate: endDate?.toISOString(),
        };
        (props.onSave as (poll: Omit<Poll, 'id' | 'author' | 'votedBy' | 'createdAt'>) => void)(newPollData);
        toast({
          title: 'Poll Created!',
          description: 'Your poll has been successfully created and is now live.',
        });
    }

    onOpenChange(false)
  }
  
  if (!currentUser) return null;

  const dialogTitle = isEditMode ? 'Edit Poll' : 'Create a New Poll';
  const dialogDescription = isEditMode ? 'Make changes to your poll.' : 'Gather feedback and opinions from your organization with a new poll.';
  const buttonText = isEditMode ? 'Save Changes' : 'Create Poll';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditMode && props.children && <DialogTrigger asChild>{props.children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[625px] grid-rows-[auto,1fr,auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid-rows-[1fr,auto] grid gap-4 overflow-hidden">
         <ScrollArea className="pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="question" className="text-right pt-2">
                  Question
                </Label>
                <Textarea id="question" required className="col-span-3 min-h-[80px]" value={question} onChange={e => setQuestion(e.target.value)} />
              </div>

              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                    Options
                </Label>
                <div className="col-span-3 space-y-2">
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                required
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} disabled={options.length <= 2}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                     <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">
                        <Plus className="mr-2 h-4 w-4"/>
                        Add Option
                    </Button>
                </div>
              </div>
              
              {currentUser.role === 'Admin' ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select required value={category} onValueChange={(value: 'Organization' | 'Employee') => setCategory(value)}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organization">Organization</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <Input type="hidden" value="Employee" name="category" />
              )}


              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end-date" className="text-right">
                  End Date (Optional)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'col-span-3 w-auto justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Set an end date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button type="submit">{buttonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
