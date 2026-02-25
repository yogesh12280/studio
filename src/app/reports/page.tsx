
'use client'

import { useState, useEffect, useMemo } from 'react'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format, parseISO, startOfMonth } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import { Banknote, Clock, CheckCircle, XCircle, FileBarChart, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Reimbursement } from '@/lib/types'
import * as XLSX from 'xlsx'
import { useToast } from '@/hooks/use-toast'

export default function ReportsPage() {
  const { currentUser } = useUser()
  const { toast } = useToast()
  const [data, setData] = useState<Reimbursement[]>([])
  const [loading, setLoading] = useState(true)

  const isAdmin = currentUser?.role === 'Admin'

  useEffect(() => {
    if (!isAdmin) return
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/reimbursements?isAdmin=true')
        const items = await res.json()
        setData(items)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isAdmin])

  const stats = useMemo(() => {
    const total = data.length
    const paid = data.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.amount, 0)
    const pending = data.filter(r => r.status === 'Pending' || r.status === 'Approved').reduce((acc, r) => acc + r.amount, 0)
    const countByStatus = {
      Paid: data.filter(r => r.status === 'Paid').length,
      Approved: data.filter(r => r.status === 'Approved').length,
      Pending: data.filter(r => r.status === 'Pending').length,
      Rejected: data.filter(r => r.status === 'Rejected').length,
    }
    return { total, paid, pending, countByStatus }
  }, [data])

  const monthlyTrends = useMemo(() => {
    const months: Record<string, { name: string, paid: number, total: number }> = {}
    
    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(new Date())
      d.setMonth(d.getMonth() - i)
      const key = format(d, 'yyyy-MM')
      months[key] = { name: format(d, 'MMM yy'), paid: 0, total: 0 }
    }

    data.forEach(item => {
      const key = format(parseISO(item.billDate), 'yyyy-MM')
      if (months[key]) {
        months[key].total += item.amount
        if (item.status === 'Paid') {
          months[key].paid += item.amount
        }
      }
    })

    return Object.values(months)
  }, [data])

  const statusPieData = useMemo(() => [
    { name: 'Paid', value: stats.countByStatus.Paid, color: '#22c55e' },
    { name: 'Approved', value: stats.countByStatus.Approved, color: '#3b82f6' },
    { name: 'Pending', value: stats.countByStatus.Pending, color: '#eab308' },
    { name: 'Rejected', value: stats.countByStatus.Rejected, color: '#ef4444' },
  ], [stats])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const exportSummary = () => {
    const exportData = monthlyTrends.map(m => ({
      'Month': m.name,
      'Total Claims (INR)': m.total,
      'Paid Claims (INR)': m.paid
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Summary');
    XLSX.writeFile(workbook, `Reimbursement_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast({ title: 'Report Exported', description: 'Monthly summary has been saved.' })
  }

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Unauthorized access.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <AppHeader title="Analytics Report">
        <Button variant="outline" size="sm" className="gap-2" onClick={exportSummary}>
          <Download className="h-4 w-4" />
          Export Summary
        </Button>
      </AppHeader>

      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Submitted requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid To Date</CardTitle>
              <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</div>
              <p className="text-xs text-muted-foreground">Total disbursed amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Pipeline</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 ? Math.round(((stats.countByStatus.Paid + stats.countByStatus.Approved) / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Successful claims</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Monthly claim volume vs actual payouts (Last 6 months).</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), '']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Claimed" />
                  <Bar dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} name="Actual Paid" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Current state of all claims.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-4 space-y-2">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Monthly Performance</CardTitle>
            <CardDescription>Consolidated summary of financial disbursements.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month Period</TableHead>
                  <TableHead>Total Claims (Value)</TableHead>
                  <TableHead>Disbursed Amount</TableHead>
                  <TableHead>Awaiting Payment</TableHead>
                  <TableHead className="text-right">Settlement Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTrends.slice().reverse().map((m) => {
                  const rate = m.total > 0 ? Math.round((m.paid / m.total) * 100) : 0
                  return (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>{formatCurrency(m.total)}</TableCell>
                      <TableCell className="text-green-600 font-semibold">{formatCurrency(m.paid)}</TableCell>
                      <TableCell>{formatCurrency(m.total - m.paid)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${rate > 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {rate}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
