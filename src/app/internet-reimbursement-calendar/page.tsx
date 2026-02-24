'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { format, parseISO, startOfMonth, isFuture, endOfMonth } from 'date-fns'
import { 
  PlusCircle, CheckCircle, XCircle, Clock, AlertCircle, 
  Calendar as CalendarIcon, History, Eye, FileText, 
  RefreshCw, Search, Shield, User as UserIcon, 
  ChevronDown, X, CreditCard, Edit
} from 'lucide-react'
import type { Reimbursement, ReimbursementStatus } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { employees } from '@/lib/data'

export default function InternetReimbursementCalendarPage() {
  const { currentUser } = useUser()
  const { toast } = useToast()
  const [items, setItems] = useState<Reimbursement[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeSubmittingMonth, setActiveSubmittingMonth] = useState<number | null>(null)
  
  // Admin view state
  const isAdmin = currentUser?.role === 'Admin'
  const [viewMode, setViewMode] = useState<'Personal' | 'Management'>(isAdmin ? 'Management' : 'Personal')
  const [nameSearch, setNameSearch] = useState('')
  const [activeEmployee, setActiveEmployee] = useState<{ id: string, name: string } | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Admin approval/modify state
  const [approvingItem, setApprovingItem] = useState<Reimbursement | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [adminRemarks, setAdminRemarks] = useState('')
  const [editStatus, setEditStatus] = useState<ReimbursementStatus>('Approved')

  // History View State
  const [viewingMonthHistory, setViewingMonthHistory] = useState<{ month: string, index: number, year: number } | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null)

  // Year selection
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const availableYears = useMemo(() => {
    const years = []
    const currentYear = new Date().getFullYear()
    for (let y = 2023; y <= currentYear; y++) {
      years.push(y)
    }
    return years
  }, [])

  // Form state
  const [amount, setAmount] = useState('')
  const [billDate, setBillDate] = useState('')
  const [description, setDescription] = useState('')
  const [receiptBase64, setReceiptBase64] = useState<string | undefined>()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isPDF = (url: string) => url.startsWith('data:application/pdf') || url.toLowerCase().includes('application/pdf') || url.toLowerCase().endsWith('.pdf')

  const fetchReimbursements = async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      const isManagement = isAdmin && viewMode === 'Management';
      const targetUserId = isManagement ? (activeEmployee?.id || '') : currentUser.id;
      
      if (isManagement && !targetUserId) {
        setItems([]);
        return;
      }

      const res = await fetch(`/api/reimbursements?userId=${targetUserId}&isAdmin=${isManagement}`)
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
  }, [currentUser, viewMode, activeEmployee, selectedYear])

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
    if (!approvingItem || !currentUser) return
    
    try {
      const payload: any = { 
        status: editStatus,
        remarks: adminRemarks,
        approvedBy: currentUser.name
      };

      if (editStatus === 'Approved') {
         payload.transactionId = transactionId;
         payload.paidAt = new Date().toISOString();
      } else {
         payload.transactionId = null;
         payload.paidAt = null;
      }

      const res = await fetch(`/api/reimbursements/${approvingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: 'Updated', description: `Request processed successfully.` })
        setApprovingItem(null)
        setTransactionId('')
        setAdminRemarks('')
        fetchReimbursements()
      } else {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to update claim.' })
      }
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' })
    }
  }

  const openSubmitForMonth = (monthIndex: number) => {
    setActiveSubmittingMonth(monthIndex)
    const date = new Date(selectedYear, monthIndex, 1)
    setBillDate(format(date, 'yyyy-MM-dd'))
    setDescription(`Internet bill for ${format(date, 'MMMM yyyy')}`)
    setIsSubmitOpen(true)
  }

  const employeeSuggestions = useMemo(() => {
    const uniqueEmployees = new Map<string, { name: string, id: string }>();
    employees.forEach(emp => {
      uniqueEmployees.set(emp.id, { name: emp.name, id: emp.id });
    });
    return Array.from(uniqueEmployees.values());
  }, []);

  const filteredSuggestions = useMemo(() => {
    if (!nameSearch.trim()) return [];
    return employeeSuggestions.filter(emp => 
      emp.name.toLowerCase().includes(nameSearch.toLowerCase()) || 
      emp.id.toLowerCase().includes(nameSearch.toLowerCase())
    ).slice(0, 10);
  }, [employeeSuggestions, nameSearch]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getStatusIcon = (status: ReimbursementStatus) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Rejected': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: ReimbursementStatus) => {
    switch (status) {
      case 'Approved': return <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getClaimsForMonth = (monthIndex: number) => {
    return items.filter(item => {
      const d = parseISO(item.billDate)
      return d.getFullYear() === selectedYear && d.getMonth() === monthIndex
    }).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  if (!currentUser) return null

  const minBillDate = activeSubmittingMonth !== null 
    ? format(new Date(selectedYear, activeSubmittingMonth, 1), 'yyyy-MM-dd') 
    : undefined
  const maxBillDate = activeSubmittingMonth !== null 
    ? format(endOfMonth(new Date(selectedYear, activeSubmittingMonth, 1)), 'yyyy-MM-dd') 
    : undefined

  return (
    <div className="flex-1 overflow-y-auto">
      <AppHeader title="Claims Calendar">
        {isAdmin && (
          <Tabs value={viewMode} onValueChange={(val: any) => setViewMode(val)} className="w-auto mr-2">
            <TabsList>
              <TabsTrigger value="Personal" className="gap-2">
                <UserIcon className="h-4 w-4" />
                My Claims
              </TabsTrigger>
              <TabsTrigger value="Management" className="gap-2">
                <Shield className="h-4 w-4" />
                Management
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </AppHeader>

      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-card p-4 rounded-lg border shadow-sm gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="year-select" className="text-sm font-medium whitespace-nowrap">Select Year:</Label>
              <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
                <SelectTrigger id="year-select" className="w-[120px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {isAdmin && viewMode === 'Management' && (
              <div className="flex items-center gap-3 min-w-[280px]">
                <Label htmlFor="search" className="text-sm font-medium whitespace-nowrap">Employee:</Label>
                <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                  <PopoverTrigger asChild>
                    <div className="relative w-full group">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="search"
                        placeholder="Search by name..." 
                        className="pl-8 pr-8 w-full" 
                        value={nameSearch}
                        onChange={(e) => {
                          setNameSearch(e.target.value);
                          if (!e.target.value) setActiveEmployee(null);
                          setIsSearchOpen(true);
                        }}
                      />
                      {nameSearch && (
                        <button onClick={() => { setNameSearch(''); setActiveEmployee(null); }} className="absolute right-8 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)] max-h-[300px] overflow-y-auto" align="start">
                    <div className="flex flex-col">
                      {filteredSuggestions.length > 0 ? (
                        filteredSuggestions.map((emp) => (
                          <button
                            key={emp.id}
                            className="flex flex-col items-start px-4 py-2 hover:bg-accent text-sm text-left border-b last:border-0"
                            onClick={() => {
                              setNameSearch(emp.name);
                              setActiveEmployee(emp);
                              setIsSearchOpen(false);
                            }}
                          >
                            <span className="font-medium">{emp.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{emp.id}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          {nameSearch ? 'No matches' : 'Type to search...'}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full text-center">
            {viewMode === 'Management' 
              ? (activeEmployee ? `Viewing ${activeEmployee.name}'s ${selectedYear} History` : 'Select an employee')
              : `Reviewing My ${selectedYear} History`
            }
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground animate-pulse font-medium">Loading calendar data...</p>
          </div>
        ) : viewMode === 'Management' && !activeEmployee ? (
          <div className="text-center py-24 border-2 border-dashed rounded-lg bg-muted/20">
            <UserIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No Employee Selected</h3>
            <p className="text-muted-foreground">Please select an employee to view their reimbursement calendar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {months.map((monthName, index) => {
              const monthClaims = getClaimsForMonth(index);
              const activeClaim = monthClaims.find(c => c.status !== 'Rejected') || monthClaims[0];
              const isMonthInFuture = isFuture(startOfMonth(new Date(selectedYear, index, 1)))
              
              const hasActionableClaim = monthClaims.some(c => c.status === 'Pending' || c.status === 'Approved');
              const isOnlyRejected = monthClaims.length > 0 && !hasActionableClaim;

              return (
                <Card key={monthName} className={`flex flex-col h-full border-t-4 transition-all hover:shadow-md ${activeClaim ? (activeClaim.status === 'Approved' ? 'border-t-green-500' : (activeClaim.status === 'Rejected' ? 'border-t-red-500' : 'border-t-yellow-500')) : 'border-t-muted'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">{monthName}</CardTitle>
                      {activeClaim && getStatusIcon(activeClaim.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-center py-4">
                    {activeClaim ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">{formatCurrency(activeClaim.amount)}</span>
                          {getStatusBadge(activeClaim.status)}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-2 rounded-md">
                          <p><span className="font-semibold">Bill Date:</span> {format(parseISO(activeClaim.billDate), 'MMM d, yyyy')}</p>
                          {activeClaim.paidAt && <p><span className="font-semibold">Paid:</span> {format(parseISO(activeClaim.paidAt), 'MMM d, yyyy')}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full gap-2 text-xs h-8"
                            onClick={() => setViewingMonthHistory({ month: monthName, index, year: selectedYear })}
                          >
                            <History className="h-3.5 w-3.5" />
                            View History
                          </Button>
                          {viewMode === 'Personal' && isOnlyRejected && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-2 text-xs h-8 border-primary text-primary hover:bg-primary/5"
                              onClick={() => openSubmitForMonth(index)}
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Re-Submit Claim
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        {isMonthInFuture ? (
                          <div className="flex flex-col items-center gap-2 py-2">
                            <Clock className="h-5 w-5 text-muted-foreground/40" />
                            <p className="text-xs text-muted-foreground italic">Future Month</p>
                          </div>
                        ) : viewMode === 'Personal' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full gap-2 border-dashed py-6"
                            onClick={() => openSubmitForMonth(index)}
                          >
                            <PlusCircle className="h-4 w-4" />
                            Submit Claim
                          </Button>
                        ) : (
                          <div className="flex flex-col items-center gap-2 py-2">
                             <AlertCircle className="h-5 w-5 text-muted-foreground/40" />
                             <p className="text-xs text-muted-foreground italic">No submissions</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>

      {/* History Dialog */}
      <Dialog open={!!viewingMonthHistory} onOpenChange={(val) => !val && setViewingMonthHistory(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Claim History: {viewingMonthHistory?.month} {viewingMonthHistory?.year}
            </DialogTitle>
            <DialogDescription>
              {viewMode === 'Management' ? `Reviewing history for ${activeEmployee?.name}` : 'Viewing all your reimbursement attempts for this period.'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 -mx-6 px-6 py-4">
            <div className="space-y-6">
              {viewingMonthHistory && getClaimsForMonth(viewingMonthHistory.index).map((claim, idx) => (
                <div key={claim.id} className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{formatCurrency(claim.amount)}</span>
                        {getStatusBadge(claim.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">Submitted: {format(parseISO(claim.submittedAt), 'PPP p')}</p>
                    </div>
                    <div className="flex gap-2">
                      {claim.receiptUrl && (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => setViewingReceipt(claim.receiptUrl!)}>
                          <Eye className="h-4 w-4" />
                          Receipt
                        </Button>
                      )}
                      {viewMode === 'Management' && (
                        claim.status === 'Pending' ? (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => {
                               setApprovingItem(claim);
                               setEditStatus('Approved');
                               setTransactionId('');
                               setAdminRemarks('');
                            }}>
                              <CreditCard className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="gap-1" onClick={async () => {
                              try {
                                await fetch(`/api/reimbursements/${claim.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'Rejected', approvedBy: currentUser.name })
                                });
                                fetchReimbursements();
                              } catch (e) {
                                toast({ variant: 'destructive', title: 'Error', description: 'Failed to reject.' });
                              }
                            }}>
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                             setApprovingItem(claim);
                             setEditStatus(claim.status);
                             setTransactionId(claim.transactionId || '');
                             setAdminRemarks(claim.remarks || '');
                          }}>
                            <Edit className="h-3.5 w-3.5" />
                            Modify
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm bg-muted/40 p-3 rounded-md border">
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Bill Date</p>
                      <p>{format(parseISO(claim.billDate), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Processed By</p>
                      <p>{claim.approvedBy || '-'}</p>
                    </div>
                    {claim.paidAt && (
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Paid At</p>
                        <p>{format(parseISO(claim.paidAt), 'MMM d, yyyy')}</p>
                      </div>
                    )}
                    {claim.transactionId && (
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Transaction ID</p>
                        <p className="font-mono text-xs">{claim.transactionId}</p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-[10px] uppercase font-bold">Description</p>
                      <p className="text-xs">{claim.description}</p>
                    </div>
                    {claim.remarks && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-[10px] uppercase font-bold">Admin Remarks</p>
                        <p className="text-xs italic">&ldquo;{claim.remarks}&rdquo;</p>
                      </div>
                    )}
                  </div>
                  {idx < getClaimsForMonth(viewingMonthHistory.index).length - 1 && <Separator className="mt-6" />}
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingMonthHistory(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Action Dialog */}
      <Dialog open={!!approvingItem} onOpenChange={(open) => !open && setApprovingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvingItem?.status === 'Pending' ? 'Process Claim' : 'Modify Claim'}</DialogTitle>
            <DialogDescription>Update claim details for {activeEmployee?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {approvingItem?.status !== 'Pending' && (
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {editStatus === 'Approved' && (
              <div className="space-y-2">
                <Label htmlFor="txId">Transaction Number / ID</Label>
                <Input id="txId" placeholder="e.g. TXN12345678" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea id="remarks" placeholder="Add optional remarks." value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovingItem(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={editStatus === 'Approved' && !transactionId.trim()}>
              Confirm Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Viewer Dialog */}
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

      {/* Submit Form Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={(val) => {
        setIsSubmitOpen(val)
        if (!val) {
          setSubmitError(null)
          setActiveSubmittingMonth(null)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
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
              <Label htmlFor="amount">Bill Amount (&#8377;)</Label>
              <Input id="amount" type="number" step="0.01" required value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Bill Date</Label>
              <Input 
                id="date" 
                type="date" 
                required 
                value={billDate} 
                min={minBillDate}
                max={maxBillDate}
                onChange={e => setBillDate(e.target.value)} 
              />
              {activeSubmittingMonth !== null && (
                <p className="text-[10px] text-muted-foreground italic">
                  * Limited to {months[activeSubmittingMonth]} {selectedYear}
                </p>
              )}
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
              <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
