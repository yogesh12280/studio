'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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
import { CalendarIcon, Upload } from 'lucide-react'
import { Calendar } from './ui/calendar'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useUser } from '@/contexts/user-context'
import { useToast } from '@/hooks/use-toast'
import type { Bulletin } from '@/lib/types'
import { ScrollArea } from './ui/scroll-area'

type CreateBulletinDialogProps = {
    children: React.ReactNode;
    mode?: 'create';
    onSave: (newBulletin: Omit<Bulletin, 'id' | 'author' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'createdAt'>) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type EditBulletinDialogProps = {
    children: React.ReactNode;
    mode: 'edit';
    bulletinToEdit: Bulletin;
    onSave: (bulletin: Bulletin) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type BulletinDialogProps = CreateBulletinDialogProps | EditBulletinDialogProps;


export function CreateBulletinDialog(props: BulletinDialogProps) {
  const { mode = 'create' } = props;
  const isEditMode = mode === 'edit';
  
  const [internalOpen, setInternalOpen] = useState(false);
  const open = props.open ?? internalOpen;
  const onOpenChange = props.onOpenChange ?? setInternalOpen;

  const { currentUser } = useUser()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'Organization' | 'Employee' | undefined>()
  const [imageUrl, setImageUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [scheduledFor, setScheduledFor] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  
  const bulletinToEdit = isEditMode ? props.bulletinToEdit : undefined;

  useEffect(() => {
    const resetForm = () => {
        setTitle(bulletinToEdit?.title || '')
        setContent(bulletinToEdit?.content || '')
        setCategory(bulletinToEdit?.category)
        setImageUrl(bulletinToEdit?.imageUrl || '')
        setLinkText(bulletinToEdit?.link?.text || '')
        setLinkUrl(bulletinToEdit?.link?.url || '')
        setScheduledFor(bulletinToEdit?.scheduledFor ? new Date(bulletinToEdit.scheduledFor) : undefined)
        setEndDate(bulletinToEdit?.endDate ? new Date(bulletinToEdit.endDate) : undefined)
    }

    if (open) {
      if (isEditMode && bulletinToEdit) {
        resetForm();
      } else if (!isEditMode) {
        resetForm();
        if (currentUser.role === 'Employee') {
            setCategory('Employee')
        }
      }
    }
  }, [open, isEditMode, bulletinToEdit, currentUser.role])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
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

    if (isEditMode) {
        const updatedBulletin: Bulletin = {
            ...(props.bulletinToEdit as Bulletin),
            title,
            content,
            category: finalCategory,
            imageUrl: imageUrl || undefined,
            link: linkUrl && linkText ? { url: linkUrl, text: linkText } : undefined,
            scheduledFor: scheduledFor?.toISOString(),
            endDate: endDate?.toISOString(),
        };
        (props.onSave as (bulletin: Bulletin) => void)(updatedBulletin);
        toast({
          title: 'Bulletin Updated!',
          description: 'Your bulletin has been successfully updated.',
        })
    } else {
        const newBulletinData = {
            title,
            content,
            category: finalCategory,
            imageUrl: imageUrl || undefined,
            link: linkUrl && linkText ? { url: linkUrl, text: linkText } : undefined,
            scheduledFor: scheduledFor?.toISOString(),
            endDate: endDate?.toISOString(),
        };
        (props.onSave as (bulletin: Omit<Bulletin, 'id' | 'author' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'createdAt'>) => void)(newBulletinData);
        toast({
          title: 'Bulletin Created!',
          description: 'Your bulletin has been successfully created.',
        })
    }

    onOpenChange(false)
  }
  
  const dialogTitle = isEditMode ? "Edit Bulletin" : "Create Bulletin";
  const dialogDescription = isEditMode ? "Edit and update your announcement." : "Craft and schedule announcements for your organization.";
  const buttonText = isEditMode ? "Save Changes" : "Create Bulletin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditMode && <DialogTrigger asChild>{props.children}</DialogTrigger>}
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" required className="col-span-3" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right pt-2">
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
                      <SelectItem value="Organization">Organization</SelectItem>
                      <SelectItem value="Employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                  <Input type="hidden" value="Employee" />
              )}
              <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="image-url" className="text-right pt-2">Image</Label>
                  <div className="col-span-3">
                      <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="mr-2 h-4 w-4" />
                          Browse Image
                      </Button>
                      <Input 
                          type="file" 
                          id="image-file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                      />
                       {imageUrl && (
                          <div className="mt-4 relative w-full aspect-video rounded-md overflow-hidden border">
                              <Image src={imageUrl} alt="Image preview" fill className="object-contain" />
                          </div>
                      )}
                  </div>
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
          </ScrollArea>
          <DialogFooter className="pt-4 border-t">
            <Button type="submit">{buttonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
