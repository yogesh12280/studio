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
import type { Poll } from '@/lib/types'
import { ScrollArea } from './ui/scroll-area'

type CreatePollDialogProps = {
    children: React.ReactNode;
    onSave: (newPoll: Omit<Poll, 'id' | 'author' | 'votedBy' | 'createdAt'>) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreatePollDialog(props: CreatePollDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = props.open ?? internalOpen;
  const onOpenChange = props.onOpenChange ?? setInternalOpen;

  const { currentUser } = useUser()
  const { toast } = useToast()

  // Form state
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])
  const [category, setCategory] = useState<'Organization' | 'Employee' | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  
  useEffect(() => {
    if (open) {
      setQuestion('')
      setOptions(['', ''])
      setCategory(undefined)
      setEndDate(undefined)
    }
  }, [open])

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  const addOption = () => {
    setOptions([...options, '']);
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
    
    if (!question || !category || options.some(opt => !opt.trim())) {
        toast({
            variant: "destructive",
            title: "Missing Required Fields",
            description: "Please fill out the question, all options, and select a category.",
        })
        return
    }

    const newPollData = {
        question,
        options: options.map((opt, i) => ({ id: `opt-${Date.now()}-${i}`, text: opt, votes: 0 })),
        category,
        endDate: endDate?.toISOString(),
    };
    props.onSave(newPollData);

    toast({
      title: 'Poll Created!',
      description: 'Your poll has been successfully created and is now live.',
    })

    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px] grid-rows-[auto,1fr,auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create a New Poll</DialogTitle>
          <DialogDescription>
            Gather feedback and opinions from your organization with a new poll.
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
                                value={option}
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
            <Button type="submit">Create Poll</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
