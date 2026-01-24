'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { useToast } from '@/hooks/use-toast'
import type { ReusableComponent, ProjectUtilization, User } from '@/lib/types'
import { X, Edit, Save, Plus } from 'lucide-react'

interface ManageUtilizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: ReusableComponent;
  currentUser: User;
  onUpdate: (updatedComponent: ReusableComponent) => void;
}

export function ManageUtilizationDialog({
  open,
  onOpenChange,
  component,
  currentUser,
  onUpdate,
}: ManageUtilizationDialogProps) {
  const { toast } = useToast()
  const [utilizations, setUtilizations] = useState<ProjectUtilization[]>([])
  const [newProjectName, setNewProjectName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  useEffect(() => {
    if (open) {
      setUtilizations([...component.utilizationByProjects])
      setNewProjectName('')
      setEditingId(null)
    }
  }, [open, component.utilizationByProjects])

  const handleAdd = () => {
    if (!newProjectName.trim()) {
      toast({ variant: 'destructive', title: 'Project name cannot be empty.' })
      return
    }
    const newUtilization: ProjectUtilization = {
      projectId: `proj-${Date.now()}`,
      projectName: newProjectName.trim(),
      utilizedBy: {
        id: currentUser.id,
        name: currentUser.name,
      },
    }
    setUtilizations([...utilizations, newUtilization])
    setNewProjectName('')
  }

  const handleDelete = (projectId: string) => {
    setUtilizations(utilizations.filter(u => u.projectId !== projectId))
  }

  const handleStartEdit = (utilization: ProjectUtilization) => {
    setEditingId(utilization.projectId)
    setEditingName(utilization.projectName)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleSaveEdit = (projectId: string) => {
    if (!editingName.trim()) {
      toast({ variant: 'destructive', title: 'Project name cannot be empty.' })
      return
    }
    setUtilizations(
      utilizations.map(u =>
        u.projectId === projectId ? { ...u, projectName: editingName.trim() } : u
      )
    )
    setEditingId(null)
    setEditingName('')
  }

  const handleSaveChanges = () => {
    const updatedComponent = { ...component, utilizationByProjects: utilizations }
    onUpdate(updatedComponent)
    onOpenChange(false)
    toast({ title: 'Utilization updated successfully!' })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Manage Utilization for &quot;{component.name}&quot;</DialogTitle>
          <DialogDescription>
            Add, edit, or remove projects that are using this component.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            <Label>Utilized by projects</Label>
            <div className="space-y-2">
                {utilizations.map(util => (
                    <div key={util.projectId} className="flex items-center gap-2 p-2 border rounded-md">
                        {editingId === util.projectId ? (
                            <Input 
                                value={editingName} 
                                onChange={(e) => setEditingName(e.target.value)}
                                className="flex-grow"
                            />
                        ) : (
                             <p className="flex-grow">
                                {util.projectName} <span className="text-muted-foreground">({util.utilizedBy.name})</span>
                            </p>
                        )}
                       
                        {currentUser.id === util.utilizedBy.id && (
                            <>
                                {editingId === util.projectId ? (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(util.projectId)}><Save className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={handleCancelEdit}><X className="h-4 w-4" /></Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="ghost" size="icon" onClick={() => handleStartEdit(util)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(util.projectId)}><X className="h-4 w-4 text-destructive" /></Button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                ))}
                {utilizations.length === 0 && <p className="text-sm text-muted-foreground text-center py-2">Not utilized by any projects yet.</p>}
            </div>
            <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="new-project">Add your project</Label>
                <div className="flex items-center gap-2">
                    <Input 
                        id="new-project" 
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="Enter your project name"
                    />
                    <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2" />Add</Button>
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
