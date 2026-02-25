'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  RefreshCw, Shield, User as UserIcon, 
  Banknote, Edit, ArrowLeft, CheckSquare, FileBarChart
} from 'lucide-react'
import type { Reimbursement, ReimbursementStatus } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function InternetReimbursementCalendarPage() {
  const { currentUser } = useUser()
  const router = useRouter()
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
  const [activeEmployee, setActiveEmployee] = useState<{ id: string, name: string } | null>(null)

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
      const targetUserId = (isManagement && !activeEmployee) ? '' : (isManagement ? activeEmployee?.id : currentUser.id);
      
      const url = targetUserId 
        ? `/api/reimbursements?userId=${targetUserId}&isAdmin=${isManagement}`
        : `/api/reimbursements?isAdmin=${isManagement}`;

      const res = await fetch(url)
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

      if (editStatus === 'Paid') {
         payload.transactionId = transactionId;
         payload.paidAt = new Date().toISOString();
      } else if (editStatus === 'Approved' || editStatus === 'Rejected') {
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

  const managementSummary = useMemo(() => {
    if (!isAdmin || viewMode !== 'Management' || activeEmployee) return [];

    const summaryMap = new Map<string, { id: string, name: string, hasPending: boolean, totalClaims: number }>();
    
    items.forEach(item => {
      const d = parseISO(item.billDate);
      if (d.getFullYear() !== selectedYear) return;

      const existing = summaryMap.get(item.userId) || { 
        id: item.userId, 
        name: item.userName, 
        hasPending: false, 
        totalClaims: 0 
      };

      existing.totalClaims += 1;
      if (item.status === 'Pending' || item.status === 'Approved') existing.hasPending = true;
      
      summaryMap.set(item.userId, existing);
    });

    return Array.from(summaryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [items, isAdmin, viewMode, activeEmployee, selectedYear]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getStatusIcon = (status: ReimbursementStatus) => {
    switch (status) {
      case 'Paid': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'Approved': return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'Rejected': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: ReimbursementStatus) => {
    switch (status) {
      case 'Paid': return <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Paid</Badge>
      case 'Approved': return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Approved</Badge>
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>
      default: return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getClaimsForMonth = (monthIndex: number) => {
    return items.filter(item => {
      const d = parseISO(item.billDate)
      return d.getFullYear() === selectedYear && d.getMonth() === monthIndex
    }).sort((a, b) => {
        const order = { 'Paid': 0, 'Approved': 1, 'Pending': 2, 'Rejected': 3 };
        return order[a.status] - order[b.status] || new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });
  }

  if (!currentUser) return null

  const minBillDate = activeSubmittingMonth !== null 
    ? format(new Date(selectedYear, activeSubmittingMonth, 1), 'yyyy-MM-dd') 
    : undefined
  const maxBillDate = activeSubmittingMonth !== null 
    ? format(endOfMonth(new Date(selectedYear, activeSubmittingMonth, 1)), 'yyyy-MM-dd') 
    : undefined

  const showStaticYear = isAdmin && viewMode === 'Management' && activeEmployee;

  return (
    <div className="flex-1 overflow-y-auto">
      <AppHeader title="Internet">
        <Tabs 
          value={viewMode} 
          onValueChange={(val: any) => {
            if (val === 'Report') {
              router.push('/reports')
            } else if (val === 'Management') {
              setViewMode('Management');
              setActiveEmployee(null);
            } else {
              setViewMode('Personal');
              setActiveEmployee(null);
            }
          }} 
          className="w-auto mr-2"
        >
          <TabsList>
            <TabsTrigger value="Personal" className="gap-2">
              <UserIcon className="h-4 w-4" />
              My Claims
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="Management" className="gap-2">
                <Shield className="h-4 w-4" />
                Management
              </TabsTrigger>
            )}
            <TabsTrigger value="Report" className="gap-2">
              <FileBarChart className="h-4 w-4" />
              Report
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </AppHeader>

      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-card p-4 rounded-lg border shadow-sm gap-4">
          <div className="flex items-center gap-4">
             {activeEmployee && (
               <Button variant="ghost" size="sm" className="gap-2" onClick={() => {
                 setActiveEmployee(null);
               }}>
                 <ArrowLeft className="h-4 w-4" />
                 Back to Summary
               </Button>
             )}
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium whitespace-nowrap">
                {showStaticYear ? 'Year:' : 'Select Year:'}
              </Label>
              {showStaticYear ? (
                <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md border text-sm font-bold">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  {selectedYear}
                </div>
              ) : (
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
              )}
            </div>
          </div>

          <div className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full text-center">
            {viewMode === 'Management' 
              ? (activeEmployee ? `Viewing ${activeEmployee.name}'s ${selectedYear} History` : `Employee Submission Summary - ${selectedYear}`)
              : `Reviewing My ${selectedYear} History`
            }
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground animate-pulse font-medium">Loading data...</p>
          </div>
        ) : viewMode === 'Management' && !activeEmployee ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submissions Overview</CardTitle>
              <CardDescription>All employees who have submitted claims in {selectedYear}.</CardDescription>
            </CardHeader>
            <CardContent>
              {managementSummary.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                  <UserIcon className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">No claims submitted in {selectedYear} yet.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee Name</TableHead>
                        <TableHead>Total Submissions</TableHead>
                        <TableHead>Year Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {managementSummary.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.totalClaims} claim(s)</TableCell>
                          <TableCell>
                            {emp.hasPending ? (
                              <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Clock className="h-3 w-3" />
                                Action Required
                              </Badge>
                            ) : (
                              <Badge variant="success" className="gap-1 bg-green-100 text-green-800 border-green-200">
                                <CheckSquare className="h-3 w-3" />
                                Completed
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost" title="View Calendar" onClick={() => setActiveEmployee({ id: emp.id, name: emp.name })}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {months.map((monthName, index) => {
              const monthClaims = getClaimsForMonth(index);
              const activeClaim = monthClaims.find(c => c.status !== 'Rejected') || monthClaims[0];
              const isMonthInFuture = isFuture(startOfMonth(new Date(selectedYear, index, 1)))
              
              const hasActionableClaim = monthClaims.some(c => c.status === 'Pending' || c.status === 'Approved' || c.status === 'Paid');
              const isOnlyRejected = monthClaims.length > 0 && !hasActionableClaim;

              let borderClass = 'border-t-muted';
              if (activeClaim) {
                switch (activeClaim.status) {
                  case 'Paid': borderClass = 'border-t-green-500'; break;
                  case 'Approved': borderClass = 'border-t-blue-500'; break;
                  case 'Rejected': borderClass = 'border-t-red-500'; break;
                  default: borderClass = 'border-t-yellow-500'; break;
                }
              }

              return (
                <Card key={monthName} className={`flex flex-col h-full border-t-4 transition-all hover:shadow-md ${borderClass}`}>
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
              {viewingMonthHistory && getClaimsForMonth(viewingMonthHistory.index).map((claim, idx) => {
                const monthClaims = getClaimsForMonth(viewingMonthHistory.index);
                const isSuperseded = monthClaims.some(c => 
                  new Date(c.submittedAt).getTime() > new Date(claim.submittedAt).getTime()
                );

                return (
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
                          <>
                            {claim.status === 'Pending' ? (
                              <>
                                <Button size="sm" variant="outline" className="text-blue-600 gap-1" onClick={async () => {
                                    try {
                                      await fetch(`/api/reimbursements/${claim.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ status: 'Approved', approvedBy: currentUser?.name })
                                      });
                                      fetchReimbursements();
                                    } catch (e) {
                                      toast({ variant: 'destructive', title: 'Error', description: 'Failed to approve.' });
                                    }
                                }}>
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="destructive" className="gap-1" onClick={() => {
                                  setApprovingItem(claim);
                                  setEditStatus('Rejected');
                                  setAdminRemarks('');
                                }}>
                                  <XCircle className="h-3.5 w-3.5" />
                                  Reject
                                </Button>
                              </>
                            ) : claim.status === 'Approved' ? (
                               <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1" onClick={() => {
                                  setApprovingItem(claim);
                                  setEditStatus('Paid');
                                  setTransactionId('');
                                  setAdminRemarks(claim.remarks || '');
                               }}>
                                 <Banknote className="h-3.5 w-3.5" />
                                 Mark as Paid
                               </Button>
                            ) : (
                              (claim.status === 'Rejected' && isSuperseded) ? null : (
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
                          </>
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
                    {idx < monthClaims.length - 1 && <Separator className="mt-6" />}
                  </div>
                )
              })}
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
            <DialogTitle>
              {editStatus === 'Paid' ? 'Complete Payment' : (editStatus === 'Rejected' ? 'Reject Claim' : 'Modify Claim')}
            </DialogTitle>
            <DialogDescription>Update claim details for {activeEmployee?.name || approvingItem?.userName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editStatus === 'Paid' && (
              <div className="space-y-2">
                <Label htmlFor="txId">Transaction Number / ID</Label>
                <Input id="txId" placeholder="e.g. TXN12345678" value={transactionId} onChange={e => setTransactionId(e.target.value)} />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks {editStatus === 'Rejected' ? '(Required)' : '(Optional)'}</Label>
              <Textarea id="remarks" placeholder={editStatus === 'Rejected' ? 'Please provide a reason for rejection.' : 'Add optional remarks.'} value={adminRemarks} onChange={e => setAdminRemarks(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovingItem(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={(editStatus === 'Paid' && !transactionId.trim()) || (editStatus === 'Rejected' && !adminRemarks.trim())}>
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
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
