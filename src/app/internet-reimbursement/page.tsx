'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO } from 'date-fns'
import { PlusCircle, FileText, CheckCircle, XCircle, Clock, Eye, Trash2 } from 'lucide-react'
import type { Reimbursement, ReimbursementStatus } from '@/lib/types'

export default function InternetReimbursementPage() {
  const { currentUser } = useUser()
  const { toast } = useToast()
  const [items, setItems] = useState<Reimbursement[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  
  // Form state
  const [amount, setAmount] = useState('')
  const [billDate, setBillDate] = useState('')
  const [description, setDescription] = useState('')
  const [receiptBase64, setReceiptBase64] = useState<string | undefined>()

  // Filter state for Admin
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString())

  const isAdmin = currentUser?.role === 'Admin'

  const fetchReimbursements = async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      const res = await fetch(`/api/reimbursements?userId=${currentUser.id}&isAdmin=${isAdmin}`)
      const data = await res.json()
      setItems(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReimbursements()
  }, [currentUser, isAdmin])

  const filteredItems = useMemo(() => {
    if (!isAdmin) return items;
    return items.filter(item => {
      const date = parseISO(item.billDate);
      return date.getFullYear().toString() === filterYear && (date.getMonth() + 1).toString() === filterMonth;
    });
  }, [items, isAdmin, filterYear, filterMonth]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    const payload = {
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      amount,
      billDate,
      description,
      receiptUrl: receiptBase64
    }

    try {
      const res = await fetch('/api/reimbursements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Reimbursement request submitted.' })
        setIsSubmitOpen(false)
        fetchReimbursements()
        // Reset form
        setAmount('')
        setBillDate('')
        setDescription('')
        setReceiptBase64(undefined)
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit request.' })
    }
  }

  const handleUpdateStatus = async (id: string, status: ReimbursementStatus) => {
    try {
      const res = await fetch(`/api/reimbursements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        toast({ title: 'Updated', description: `Request ${status.toLowerCase()}.` })
        fetchReimbursements()
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' })
    }
  }

  const handleDeleteClaim = async () => {
    if (!itemToDelete) return
    try {
      const res = await fetch(`/api/reimbursements/${itemToDelete}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'Deleted', description: 'Reimbursement claim removed successfully.' })
        fetchReimbursements()
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete claim.' })
    } finally {
      setItemToDelete(null)
    }
  }

  const statusBadge = (status: ReimbursementStatus) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" className="gap-1 bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3" /> Approved</Badge>
      case 'Rejected': return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      default: return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
    }
  }

  const isPDF = (url: string) => url.startsWith('data:application/pdf') || url.toLowerCase().endsWith('.pdf')

  if (!currentUser) return null

  return (
    <div className="flex-1 overflow-y-auto">
      <AppHeader title="Internet Reimbursement">
        {!isAdmin && (
          <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                Submit Claim
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Claim</DialogTitle>
                <DialogDescription>Fill in the details for your internet bill reimbursement.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Bill Amount (₹)</Label>
                  <Input id="amount" type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Bill Date</Label>
                  <Input id="date" type="date" required value={billDate} onChange={e => setBillDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Textarea id="desc" placeholder="e.g. Internet bill for January" required value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Bill Receipt (Image/PDF)</Label>
                  <Input id="receipt" type="file" accept="image/*,application/pdf" onChange={handleFileChange} />
                </div>
                <DialogFooter>
                  <Button type="submit">Submit Request</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AppHeader>

      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Management Filters</CardTitle>
              <CardDescription>Filter claims by month and year to manage organizational reimbursements.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <Label>Year</Label>
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['2023', '2024', '2025'].map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Month</Label>
                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                      <SelectItem key={m} value={m.toString()}>
                        {format(new Date(2024, m - 1), 'MMMM')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{isAdmin ? 'All Employee Claims' : 'My Claim History'}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading claims...</p>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">No claims found for this period.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && <TableHead>Employee</TableHead>}
                      <TableHead>Bill Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        {isAdmin && (
                          <TableCell className="font-medium">{item.userName}</TableCell>
                        )}
                        <TableCell>{format(parseISO(item.billDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>₹{item.amount.toFixed(2)}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[200px] truncate">{item.description}</TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                             {item.receiptUrl && (
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  title="View Receipt"
                                  onClick={() => setViewingReceipt(item.receiptUrl!)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            {item.status === 'Pending' && (
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => setItemToDelete(item.id)}
                                  title="Delete Claim"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            {isAdmin && item.status === 'Pending' && (
                              <>
                                <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStatus(item.id, 'Approved')} title="Approve">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdateStatus(item.id, 'Rejected')} title="Reject">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Receipt Document</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
            {viewingReceipt && (
              isPDF(viewingReceipt) ? (
                <iframe 
                  src={viewingReceipt} 
                  className="w-full h-full rounded-md border" 
                  title="PDF Receipt"
                />
              ) : (
                <img 
                  src={viewingReceipt} 
                  alt="Receipt" 
                  className="max-w-full max-h-full object-contain shadow-lg rounded-md" 
                />
              )
            )}
          </div>
          <DialogFooter className="p-4 border-t">
            <Button variant="secondary" onClick={() => setViewingReceipt(null)}>Close</Button>
            {viewingReceipt && (
              <Button asChild>
                <a href={viewingReceipt} download={`receipt-${Date.now()}`}>Download</a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your pending reimbursement claim.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClaim} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Claim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
