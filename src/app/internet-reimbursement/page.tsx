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
import { PlusCircle, FileText, CheckCircle, XCircle, Clock, Eye, Trash2, AlertCircle, ExternalLink, CreditCard, Search, CheckSquare, ChevronDown, X } from 'lucide-react'
import type { Reimbursement, ReimbursementStatus } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { employees } from '@/lib/data'

export default function InternetReimbursementPage() {
  const { currentUser } = useUser()
  const { toast } = useToast()
  const [items, setItems] = useState<Reimbursement[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Admin approval state
  const [approvingItem, setApprovingItem] = useState<Reimbursement | null>(null)
  const [isBulkApproving, setIsBulkApproving] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [adminRemarks, setAdminRemarks] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Form state
  const [amount, setAmount] = useState('')
  const [billDate, setBillDate] = useState('')
  const [description, setDescription] = useState('')
  const [receiptBase64, setReceiptBase64] = useState<string | undefined>()

  // Filter state for Admin
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString())
  const [nameSearch, setNameSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('') // Only set when a user is chosen from dropdown
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const isAdmin = currentUser?.role === 'Admin'

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isPDF = (url: string) => url.startsWith('data:application/pdf') || url.toLowerCase().includes('application/pdf') || url.toLowerCase().endsWith('.pdf')

  useEffect(() => {
    if (viewingReceipt && isPDF(viewingReceipt)) {
      try {
        if (viewingReceipt.startsWith('data:')) {
          const parts = viewingReceipt.split(',');
          if (parts.length < 2) return;
          const base64Data = parts[1];
          const byteCharacters = atob(base64Data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          const blob = new Blob(byteArrays, { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
          return () => {
            URL.revokeObjectURL(url);
            setPdfBlobUrl(null);
          };
        } else {
          setPdfBlobUrl(viewingReceipt);
        }
      } catch (e) {
        console.error("Error creating PDF blob", e);
        setPdfBlobUrl(null);
      }
    } else {
      setPdfBlobUrl(null);
    }
  }, [viewingReceipt]);

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

  const employeeSuggestions = useMemo(() => {
    const uniqueEmployees = new Map<string, { name: string, id: string }>();
    items.forEach(item => {
      uniqueEmployees.set(item.userId, { name: item.userName, id: item.userId });
    });
    employees.forEach(emp => {
      uniqueEmployees.set(emp.id, { name: emp.name, id: emp.id });
    });
    return Array.from(uniqueEmployees.values());
  }, [items]);

  const filteredSuggestions = useMemo(() => {
    if (!nameSearch.trim()) return [];
    return employeeSuggestions.filter(emp => 
      emp.name.toLowerCase().includes(nameSearch.toLowerCase()) || 
      emp.id.toLowerCase().includes(nameSearch.toLowerCase())
    ).slice(0, 10);
  }, [employeeSuggestions, nameSearch]);

  const filteredItems = useMemo(() => {
    if (!isAdmin) return items;
    return items.filter(item => {
      const date = parseISO(item.billDate);
      const dateMatch = date.getFullYear().toString() === filterYear && (date.getMonth() + 1).toString() === filterMonth;
      
      if (activeFilter) {
        return item.userName.toLowerCase().includes(activeFilter.toLowerCase()) || 
               item.userId.toLowerCase().includes(activeFilter.toLowerCase());
      }
      return dateMatch;
    });
  }, [items, isAdmin, filterYear, filterMonth, activeFilter]);

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
    if (!currentUser || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError(null)

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
      
      const data = await res.json()

      if (res.ok) {
        toast({ title: 'Success', description: 'Reimbursement request submitted.' })
        setIsSubmitOpen(false)
        fetchReimbursements()
        setAmount('')
        setBillDate('')
        setDescription('')
        setReceiptBase64(undefined)
      } else {
        setSubmitError(data.message || 'Failed to submit request.')
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async () => {
    if (!approvingItem && !isBulkApproving) return
    
    const idsToApprove = isBulkApproving ? selectedIds : [approvingItem!.id];
    
    try {
      const promises = idsToApprove.map(id => 
        fetch(`/api/reimbursements/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: 'Approved',
            transactionId,
            remarks: adminRemarks,
            paidAt: new Date().toISOString()
          })
        })
      );

      const results = await Promise.all(promises);
      if (results.every(res => res.ok)) {
        toast({ title: 'Updated', description: `${idsToApprove.length} request(s) approved and marked as paid.` })
        setApprovingItem(null)
        setIsBulkApproving(false)
        setTransactionId('')
        setAdminRemarks('')
        setSelectedIds([])
        fetchReimbursements()
      } else {
        toast({ variant: 'destructive', title: 'Partial Error', description: 'Some updates might have failed.' })
        fetchReimbursements()
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update status.' })
    }
  }

  const handleUpdateStatus = async (id: string, status: ReimbursementStatus) => {
    if (status === 'Approved') return;

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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  const toggleSelectAll = () => {
    const pendingIds = filteredItems.filter(item => item.status === 'Pending').map(item => item.id);
    if (selectedIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  }

  const clearSearch = () => {
    setNameSearch('');
    setActiveFilter('');
    setSelectedIds([]);
  }

  const statusBadge = (status: ReimbursementStatus) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" className="gap-1 bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3" /> Approved</Badge>
      case 'Rejected': return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>
      default: return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
    }
  }

  if (!currentUser) return null

  return (
    <div className="flex-1 overflow-y-auto">
      <AppHeader title="Internet Reimbursement">
        {!isAdmin && (
          <Dialog open={isSubmitOpen} onOpenChange={(val) => {
            setIsSubmitOpen(val)
            if (!val) setSubmitError(null)
          }}>
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
              
              {submitError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Validation Error</AlertTitle>
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

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
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AppHeader>

      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Management Filters</CardTitle>
              <CardDescription>Filter claims by month/year or search by employee.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Label>Year</Label>
                <Select value={filterYear} onValueChange={setFilterYear} disabled={!!activeFilter}>
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
                <Select value={filterMonth} onValueChange={setFilterMonth} disabled={!!activeFilter}>
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
              <div className="space-y-1 flex-1 min-w-[280px]">
                <Label htmlFor="search">Employee Name or ID</Label>
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative group">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="search"
                        placeholder="Search by name or ID..." 
                        className="pl-8 pr-8" 
                        value={nameSearch}
                        onChange={(e) => {
                          setNameSearch(e.target.value);
                          if (!e.target.value) {
                            setActiveFilter('');
                            setSelectedIds([]);
                          }
                          setIsSearchOpen(true);
                        }}
                      />
                      {nameSearch && (
                        <button onClick={clearSearch} className="absolute right-8 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex flex-col">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((emp) => (
                          <button
                            key={emp.id}
                            className="flex flex-col items-start px-4 py-2 hover:bg-accent text-sm text-left border-b last:border-0"
                            onClick={() => {
                              setNameSearch(emp.name);
                              setActiveFilter(emp.name);
                              setSelectedIds([]);
                              setIsSearchOpen(false);
                            }}
                          >
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{emp.id}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          {nameSearch ? `No employees found matching "${nameSearch}"` : 'Start typing to see suggestions...'}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {isAdmin && activeFilter && selectedIds.length > 0 && (
                <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => setIsBulkApproving(true)}>
                  <CheckSquare className="h-4 w-4" />
                  Approve Selected ({selectedIds.length})
                </Button>
              )}
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
                <p className="text-muted-foreground font-medium">No claims found.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {isAdmin && activeFilter && (
                        <TableHead className="w-[50px]">
                          <Checkbox 
                            checked={selectedIds.length === filteredItems.filter(i => i.status === 'Pending').length && filteredItems.filter(i => i.status === 'Pending').length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                      )}
                      {isAdmin && <TableHead>Employee (ID)</TableHead>}
                      <TableHead>Bill Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden lg:table-cell">Description</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        {isAdmin && activeFilter && (
                          <TableCell>
                            <Checkbox 
                              disabled={item.status !== 'Pending'}
                              checked={selectedIds.includes(item.id)}
                              onCheckedChange={() => toggleSelect(item.id)}
                            />
                          </TableCell>
                        )}
                        {isAdmin && (
                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex flex-col">
                              <span>{item.userName}</span>
                              <span className="text-xs text-muted-foreground font-mono">{item.userId}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="whitespace-nowrap">{format(parseISO(item.billDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatCurrency(item.amount)}</TableCell>
                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{item.description}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {item.paidAt ? (
                            <div className="flex flex-col text-xs">
                              <span>{format(parseISO(item.paidAt), 'MMM d, yyyy')}</span>
                              {item.transactionId && <span className="text-muted-foreground font-mono">#{item.transactionId}</span>}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Pending</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{item.remarks || '-'}</TableCell>
                        <TableCell>{statusBadge(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                             {item.receiptUrl && (
                                <Button size="icon" variant="ghost" title="View Receipt" onClick={() => setViewingReceipt(item.receiptUrl!)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            {item.status === 'Pending' && (
                                <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setItemToDelete(item.id)} title="Delete">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            {isAdmin && item.status === 'Pending' && (
                              <>
                                <Button size="icon" variant="ghost" className="text-green-600 hover:bg-green-50" onClick={() => setApprovingItem(item)} title="Approve">
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleUpdateStatus(item.id, 'Rejected')} title="Reject">
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

      <Dialog open={!!approvingItem || isBulkApproving} onOpenChange={(open) => {
        if (!open) {
          setApprovingItem(null);
          setIsBulkApproving(false);
          setTransactionId('');
          setAdminRemarks('');
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Reimbursement{isBulkApproving ? 's' : ''}</DialogTitle>
            <DialogDescription>
              {isBulkApproving 
                ? `Mark ${selectedIds.length} claims as paid.`
                : `Mark the claim for ${approvingItem?.userName} as paid.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="txId">Transaction Number / ID</Label>
              <Input id="txId" placeholder="e.g. TXN12345678" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea id="remarks" placeholder="Add optional remarks." value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setApprovingItem(null); setIsBulkApproving(false); }}>Cancel</Button>
            <Button onClick={handleApprove} disabled={!transactionId.trim()}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingReceipt} onOpenChange={(open) => !open && setViewingReceipt(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b">
            <DialogTitle>Receipt Document</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
            {viewingReceipt && (
              isPDF(viewingReceipt) ? (
                pdfBlobUrl ? (
                  <object data={pdfBlobUrl} type="application/pdf" className="w-full h-full rounded-md border">
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-background rounded-lg border max-w-md">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-xl font-semibold mb-2">Preview Unavailable</p>
                      <Button asChild><a href={pdfBlobUrl} target="_blank" rel="noopener noreferrer">Open in New Tab</a></Button>
                    </div>
                  </object>
                ) : <p className="animate-pulse">Loading viewer...</p>
              ) : <img src={viewingReceipt} alt="Receipt" className="max-w-full max-h-full object-contain shadow-lg rounded-md" />
            )}
          </div>
          <DialogFooter className="p-4 border-t gap-2">
            <Button variant="outline" onClick={() => setViewingReceipt(null)}>Close</Button>
            {viewingReceipt && <Button asChild><a href={viewingReceipt} download={`receipt-${Date.now()}`}>Download</a></Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClaim} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete Claim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
