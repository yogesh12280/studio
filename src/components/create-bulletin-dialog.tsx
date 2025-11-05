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
import { CalendarIcon } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user-context'
import { useToast } from '@/hooks/use-toast'
import type { Bulletin } from '@/lib/types'

interface CreateBulletinDialogProps {
    children: React.ReactNode;
    onAddBulletin: (newBulletin: Omit<Bulletin, 'id' | 'author' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'createdAt'>) => void;
}

export function CreateBulletinDialog({ children, onAddBulletin }: CreateBulletinDialogProps) {
  const [open, setOpen] = useState(false)
  const { currentUser } = useUser()
  const { toast } = useToast()

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'Organization' | 'Employee' | undefined>()
  const [imageUrl, setImageUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  useEffect(() => {
    if (open) {
      if (currentUser.role === 'Employee') {
        setCategory('Employee')
      } else {
        setCategory(undefined)
      }
    }
  }, [open, currentUser.role])

  const resetForm = () => {
    setTitle('')
    setContent('')
    setCategory(undefined)
    setImageUrl('')
    setLinkText('')
    setLinkUrl('')
    setScheduledFor(undefined)
    setEndDate(undefined)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const finalCategory = currentUser.role === 'Employee' ? 'Employee' : category

    if (!title || !content || !finalCategory || !scheduledFor || !endDate) {
        toast({
            variant: "destructive",
            title: "Missing Required Fields",
            description: "Please fill out Title, Content, Category, Schedule Date, and End Date.",
        })
        return
    }

    const newBulletinData = {
        title,
        content,
        category: finalCategory,
        imageUrl: imageUrl || undefined,
        link: linkUrl && linkText ? { url: linkUrl, text: linkText } : undefined,
        scheduledFor: scheduledFor?.toISOString(),
        endDate: endDate?.toISOString(),
    }

    onAddBulletin(newBulletinData);
    
    toast({
      title: 'Bulletin Created!',
      description: 'Your bulletin has been successfully created.',
    })

    resetForm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create Bulletin</DialogTitle>
          <DialogDescription>
            Craft and schedule announcements for your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" required className="col-span-3" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Content
              </Label>
              <Textarea id="content" required className="col-span-3 min-h-[120px]" value={content} onChange={e => setContent(e.target.value)} />
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
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
                <Input type="hidden" value="Employee" />
            )}
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image-url" className="text-right">Image URL</Label>
                <Input id="image-url" placeholder="https://example.com/image.png" className="col-span-3" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">Link</Label>
                 <div className="col-span-3 flex gap-2">
                    <Input id="link-text" placeholder="Link Text" className="flex-1" value={linkText} onChange={e => setLinkText(e.target.value)} />
                    <Input id="link-url" placeholder="https://example.com" className="flex-1" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                </div>
            </div>
            
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="schedule" className="text-right">
                    Schedule
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'col-span-3 w-auto justify-start text-left font-normal',
                          !scheduledFor && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledFor ? format(scheduledFor, 'PPP') : <span>Pick a post date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledFor}
                        onSelect={setScheduledFor}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end-date" className="text-right">
                    End Date
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
                        {endDate ? format(endDate, 'PPP') : <span>Pick an expiry date</span>}
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
              </>
            
          </div>
          <DialogFooter>
            <Button type="submit">Create Bulletin</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
