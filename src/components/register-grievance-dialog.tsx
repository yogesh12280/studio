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
import type { Grievance } from '@/lib/types'

type CreateGrievanceDialogProps = {
  children: React.ReactNode;
  mode: 'create';
  onGrievanceSubmit: (newGrievance: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type EditGrievanceDialogProps = {
  children?: React.ReactNode;
  mode: 'edit';
  grievanceToEdit: Grievance;
  onGrievanceSubmit: (grievance: Grievance) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type GrievanceDialogProps = CreateGrievanceDialogProps | EditGrievanceDialogProps;

export function RegisterGrievanceDialog(props: GrievanceDialogProps) {
  const { mode } = props;
  const isEditMode = mode === 'edit';

  const [internalOpen, setInternalOpen] = useState(false);
  const open = props.open ?? internalOpen;
  const onOpenChange = props.onOpenChange ?? setInternalOpen;
  
  const { toast } = useToast()
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  
  const grievanceToEdit = isEditMode ? props.grievanceToEdit : undefined;

  useEffect(() => {
    if (open) {
      if (isEditMode && grievanceToEdit) {
        setSubject(grievanceToEdit.subject);
        setDescription(grievanceToEdit.description);
      } else {
        setSubject('');
        setDescription('');
      }
    }
  }, [open, isEditMode, grievanceToEdit]);

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
    
    if (isEditMode && grievanceToEdit) {
      const updatedGrievance: Grievance = {
        ...grievanceToEdit,
        subject,
        description,
      };
      (props.onGrievanceSubmit as (grievance: Grievance) => void)(updatedGrievance);
      toast({
        title: 'Grievance Updated',
        description: 'Your grievance has been successfully updated.',
      });
    } else {
      (props.onGrievanceSubmit as (grievance: Omit<Grievance, 'id' | 'employeeId' | 'employeeName' | 'employeeAvatarUrl' | 'createdAt'>) => void)({
        subject,
        description,
        status: 'Initiated',
      })

      toast({
        title: 'Grievance Submitted',
        description: 'Your grievance has been registered and will be reviewed shortly.',
      })
    }
    
    setTimeout(() => {
      setSubject('')
      setDescription('')
      onOpenChange(false)
    }, 100);
  }
  
  const dialogTitle = isEditMode ? 'Edit Grievance' : 'Register Grievance';
  const dialogDescription = isEditMode
    ? 'Make changes to your grievance. This is only possible while the status is "Initiated".'
    : 'Submit a new grievance. Please provide a clear subject and a detailed description.';
  const buttonText = isEditMode ? 'Save Changes' : 'Submit Grievance';

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
            <Button type="submit">{buttonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
