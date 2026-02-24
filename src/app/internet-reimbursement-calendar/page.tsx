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
import { format, parseISO, startOfMonth, endOfMonth, isFuture } from 'date-fns'
import { PlusCircle, FileText, CheckCircle, XCircle, Clock, Eye, AlertCircle, CreditCard, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Reimbursement, ReimbursementStatus } from '@/lib/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function InternetReimbursementCalendarPage() {
  const { currentUser } = useUser()
  const { toast } = useToast()
  const [items, setItems] = useState<Reimbursement[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitOpen, setIsSubmitOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
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

  const fetchReimbursements = async () => {
    if (!currentUser) return
    try {
      setLoading(true)
      // Fetch only personal claims for this view as it's an employee-focused calendar
      const res = await fetch(`/api/reimbursements?userId=${currentUser.id}&isAdmin=false`)
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
  }, [currentUser])

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

  const openSubmitForMonth = (monthIndex: number) => {
    // monthIndex is 0-based
    const date = new Date(selectedYear, monthIndex, 1)
    // Format as YYYY-MM-DD for input[type="date"]
    setBillDate(format(date, 'yyyy-MM-dd'))
    setDescription(`Internet bill for ${format(date, 'MMMM yyyy')}`)
    setIsSubmitOpen(true)
  }

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

  if (!currentUser) return null

  return (
    <div className="flex-1 overflow-y-auto">
      <AppHeader title="Claims Calendar">
        <div className="flex items-center gap-2">
           <Select value={selectedYear.toString()} onValueChange={(val) => setSelectedYear(parseInt(val))}>
            <SelectTrigger className="w-[120px]">
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
      </AppHeader>

      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((monthName, index) => {
            const claim = items.find(item => {
              const d = parseISO(item.billDate)
              return d.getFullYear() === selectedYear && d.getMonth() === index && item.status !== 'Rejected'
            }) || items.find(item => {
              // Also check rejected if no active claim exists just to show history
              const d = parseISO(item.billDate)
              return d.getFullYear() === selectedYear && d.getMonth() === index
            })

            const isMonthInFuture = isFuture(startOfMonth(new Date(selectedYear, index, 1)))

            return (
              <Card key={monthName} className={`flex flex-col h-full border-t-4 ${claim ? (claim.status === 'Approved' ? 'border-t-green-500' : (claim.status === 'Rejected' ? 'border-t-red-500' : 'border-t-yellow-500')) : 'border-t-muted'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{monthName}</CardTitle>
                    {claim && getStatusIcon(claim.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center py-4">
                  {claim ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{formatCurrency(claim.amount)}</span>
                        {getStatusBadge(claim.status)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Bill Date: {format(parseISO(claim.billDate), 'MMM d, yyyy')}</p>
                        {claim.paidAt && <p>Paid: {format(parseISO(claim.paidAt), 'MMM d, yyyy')}</p>}
                        {claim.approvedBy && <p>By: {claim.approvedBy}</p>}
                        {claim.transactionId && <p className="font-mono text-[10px] break-all">ID: {claim.transactionId}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      {isMonthInFuture ? (
                        <p className="text-xs text-muted-foreground italic">Future Month</p>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-1 border-dashed"
                          onClick={() => openSubmitForMonth(index)}
                        >
                          <PlusCircle className="h-3 w-3" />
                          Submit Claim
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>

      <Dialog open={isSubmitOpen} onOpenChange={(val) => {
        setIsSubmitOpen(val)
        if (!val) setSubmitError(null)
      }}>
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
              <Label htmlFor="amount">Bill Amount (&#8377;)</Label>
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
    </div>
  )
}
