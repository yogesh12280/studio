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
import { useUser } from '@/contexts/user-context'
import { useToast } from '@/hooks/use-toast'
import type { ReusableComponent } from '@/lib/types'
import { ScrollArea } from './ui/scroll-area'
import RichTextEditor from './ui/rich-text-editor'

type CreateReusableComponentDialogProps = {
    children: React.ReactNode;
    mode?: 'create';
    onSave: (newComponent: Omit<ReusableComponent, 'id' | 'registeredBy' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'registeredDate'>) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type EditReusableComponentDialogProps = {
    children?: React.ReactNode;
    mode: 'edit';
    componentToEdit: ReusableComponent;
    onSave: (component: ReusableComponent) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

type ReusableComponentDialogProps = CreateReusableComponentDialogProps | EditReusableComponentDialogProps;

export function CreateReusableComponentDialog(props: ReusableComponentDialogProps) {
  const { mode = 'create' } = props;
  const isEditMode = mode === 'edit';
  
  const { open, onOpenChange } = props;

  const { currentUser } = useUser()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [technology, setTechnology] = useState<'Web' | 'PC' | 'AI & QC' | undefined>()
  const [description, setDescription] = useState('')
  const [originProject, setOriginProject] = useState('')
  const [benefit, setBenefit] = useState('')
  const [utilizationByProjects, setUtilizationByProjects] = useState('')
  
  const componentToEdit = isEditMode ? props.componentToEdit : undefined;
  
  useEffect(() => {
    if (open) {
      if (isEditMode && componentToEdit) {
        setName(componentToEdit.name || '');
        setTechnology(componentToEdit.technology);
        setDescription(componentToEdit.description || '');
        setOriginProject(componentToEdit.originProject || '');
        setBenefit(componentToEdit.benefit || '');
        setUtilizationByProjects(componentToEdit.utilizationByProjects.join(', '));
      } else {
        setName('');
        setTechnology(undefined);
        setDescription('');
        setOriginProject('');
        setBenefit('');
        setUtilizationByProjects('');
      }
    }
  }, [open, isEditMode, componentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return;

    if (!name || !technology || !description || !originProject || !benefit) {
        toast({
            variant: "destructive",
            title: "Missing Required Fields",
            description: "Please fill out all required fields.",
        })
        return
    }

    const projects = utilizationByProjects.split(',').map(p => p.trim()).filter(p => p);

    if (isEditMode && componentToEdit) {
        const updatedComponent: ReusableComponent = {
            ...componentToEdit,
            name,
            technology,
            description,
            originProject,
            benefit,
            utilizationByProjects: projects,
        };
        (props.onSave as (component: ReusableComponent) => void)(updatedComponent);
    } else {
        const newComponentData = {
            name,
            technology,
            description,
            originProject,
            benefit,
            utilizationByProjects: projects,
            registeredBy: { name: currentUser.name, avatarUrl: currentUser.avatarUrl }
        };
        (props.onSave as (component: Omit<ReusableComponent, 'id' | 'likes' | 'likedBy' | 'viewers' | 'viewedBy' | 'comments' | 'registeredDate'>) => void)(newComponentData);
    }

    if (onOpenChange) {
      onOpenChange(false)
    }
  }
  
  const dialogTitle = isEditMode ? "Edit Component" : "Register Reusable Component";
  const dialogDescription = isEditMode ? "Update the details of your reusable component." : "Share a component with the organization to promote reuse and collaboration.";
  const buttonText = isEditMode ? "Save Changes" : "Register Component";

  if (!currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {props.children && <DialogTrigger asChild>{props.children}</DialogTrigger>}
      <DialogContent className="w-[80vw] max-w-[80vw] grid-rows-[auto,1fr,auto] max-h-[90vh]">
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
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" required className="col-span-3" value={name} onChange={e => setName(e.target.value)} />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="technology" className="text-right">
                  Technology
                </Label>
                <Select required value={technology} onValueChange={(value: 'Web' | 'PC' | 'AI & QC') => setTechnology(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a technology" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                    <SelectItem value="AI & QC">AI & QC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <div className="col-span-3" >
                   <RichTextEditor value={description} onChange={setDescription} />
                </div>
              </div>
               <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="benefit" className="text-right pt-2">
                  Benefit of RC
                </Label>
                <Textarea id="benefit" required className="col-span-3" value={benefit} onChange={e => setBenefit(e.target.value)} />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="origin-project" className="text-right">
                  Origin Project
                </Label>
                <Input id="origin-project" required className="col-span-3" value={originProject} onChange={e => setOriginProject(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="utilization" className="text-right pt-2">
                  Utilization by Projects
                </Label>
                <Textarea 
                    id="utilization" 
                    className="col-span-3" 
                    value={utilizationByProjects} 
                    onChange={e => setUtilizationByProjects(e.target.value)} 
                    placeholder="Enter project names, separated by commas"
                />
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
