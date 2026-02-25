'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { useUser } from '@/contexts/user-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { format, parseISO, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import { Banknote, Clock, CheckCircle, XCircle, FileBarChart, Download, Calendar as CalendarIcon, User as UserIcon, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { Reimbursement } from '@/lib/types'
import * as XLSX from 'xlsx'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function ReportsPage() {
  const { currentUser } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [data, setData] = useState<Reimbursement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())

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

  const availableYears = useMemo(() => {
    const years = new Set<string>()
    years.add(new Date().getFullYear().toString())
    data.forEach(item => {
      years.add(parseISO(item.billDate).getFullYear().toString())
    })
    return Array.from(years).sort((a, b) => b.localeCompare(a))
  }, [data])

  const filteredData = useMemo(() => {
    return data.filter(item => parseISO(item.billDate).getFullYear().toString() === selectedYear)
  }, [data, selectedYear])

  const stats = useMemo(() => {
    const total = filteredData.length
    const paid = filteredData.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.amount, 0)
    const pending = filteredData.filter(r => r.status === 'Pending' || r.status === 'Approved').reduce((acc, r) => acc + r.amount, 0)
    const countByStatus = {
      Paid: filteredData.filter(r => r.status === 'Paid').length,
      Approved: filteredData.filter(r => r.status === 'Approved').length,
      Pending: filteredData.filter(r => r.status === 'Pending').length,
      Rejected: filteredData.filter(r => r.status === 'Rejected').length,
    }
    return { total, paid, pending, countByStatus }
  }, [filteredData])

  const monthlyTrends = useMemo(() => {
    const yearInt = parseInt(selectedYear)
    const months = eachMonthOfInterval({
      start: startOfYear(new Date(yearInt, 0, 1)),
      end: endOfYear(new Date(yearInt, 0, 1))
    })

    const trends = months.map(m => {
      const key = format(m, 'yyyy-MM')
      const name = format(m, 'MMM')
      const monthClaims = filteredData.filter(item => format(parseISO(item.billDate), 'yyyy-MM') === key)
      
      return {
        name,
        total: monthClaims.reduce((acc, r) => acc + r.amount, 0),
        paid: monthClaims.filter(r => r.status === 'Paid').reduce((acc, r) => acc + r.amount, 0)
      }
    })

    return trends
  }, [filteredData, selectedYear])

  const statusPieData = useMemo(() => [
    { name: 'Paid', value: stats.countByStatus.Paid, color: '#22c55e' },
    { name: 'Approved', value: stats.countByStatus.Approved, color: '#3b82f6' },
    { name: 'Pending', value: stats.countByStatus.Pending, color: '#eab308' },
    { name: 'Rejected', value: stats.countByStatus.Rejected, color: '#ef4444' },
  ].filter(item => item.value > 0), [stats])

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
      'Year': selectedYear,
      'Total Claims (INR)': m.total,
      'Paid Claims (INR)': m.paid
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Yearly Summary');
    XLSX.writeFile(workbook, `Reimbursement_Report_${selectedYear}_${format(new Date(), 'yyyyMMdd')}.xlsx`);
    toast({ title: 'Report Exported', description: `Summary for ${selectedYear} has been saved.` })
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
        <Tabs 
          value="Report" 
          onValueChange={(val: any) => {
            if (val === 'Personal') {
              router.push('/internet-reimbursement')
            } else if (val === 'Management') {
              router.push('/internet-reimbursement?view=Management')
            }
          }} 
          className="w-auto mr-2"
        >
          <TabsList>
            <TabsTrigger value="Personal" className="gap-2">
              <UserIcon className="h-4 w-4" />
              My Claims
            </TabsTrigger>
            <TabsTrigger value="Management" className="gap-2">
              <Shield className="h-4 w-4" />
              Management
            </TabsTrigger>
            <TabsTrigger value="Report" className="gap-2">
              <FileBarChart className="h-4 w-4" />
              Report
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </AppHeader>

      <main className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="year-select" className="text-sm font-medium whitespace-nowrap">Select Year:</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger id="year-select" className="w-[140px] h-10">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={exportSummary} disabled={loading}>
            <Download className="h-4 w-4" />
            Export {selectedYear} Summary
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume ({selectedYear})</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total claims submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disbursed ({selectedYear})</CardTitle>
              <Banknote className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paid)}</div>
              <p className="text-xs text-muted-foreground">Total amount paid</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</div>
              <p className="text-xs text-muted-foreground">Pending processing</p>
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
              <p className="text-xs text-muted-foreground">Success percentage</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Trends: {selectedYear}</CardTitle>
              <CardDescription>Breakdown of total volume vs. payouts per month.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground animate-pulse">Loading trends...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Total Claimed" />
                    <Bar dataKey="paid" fill="#22c55e" radius={[4, 4, 0, 0]} name="Actual Paid" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Overall breakdown for {selectedYear}.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              {stats.total > 0 ? (
                <>
                  <div className="h-[250px] w-full">
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
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-center">
                  <p className="text-muted-foreground text-sm">No data available for {selectedYear}.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Consolidated Summary ({selectedYear})</CardTitle>
            <CardDescription>Monthly financial snapshot for the organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Total Claims (Value)</TableHead>
                  <TableHead>Disbursed Amount</TableHead>
                  <TableHead>Remaining Pipeline</TableHead>
                  <TableHead className="text-right">Settlement %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyTrends.map((m) => {
                  const rate = m.total > 0 ? Math.round((m.paid / m.total) * 100) : 0
                  return (
                    <TableRow key={m.name}>
                      <TableCell className="font-medium">{m.name} {selectedYear}</TableCell>
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
