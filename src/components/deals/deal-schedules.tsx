'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Plus,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Send,
  ChevronDown,
  ChevronUp,
  Info,
  CreditCard,
  FileText,
  Edit,
  Save,
  X,
  ReceiptText,
} from 'lucide-react'
import { Deal, Schedule } from '../../types'
import { useSchedulesByDeal, useUpdateSchedule } from '../../hooks/useSchedules'

interface DealSchedulesProps {
  deal: Deal
}

export function DealSchedules({ deal }: DealSchedulesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set())
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule>>({})
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'invoiced' | 'not-invoiced'>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'not-paid'>('all')
  const [newSchedule, setNewSchedule] = useState({
    description: '',
    Revenue: '',
    ScheduleDate: '',
    scheduleStatus: 'DRAFT',
    paymentStatus: 'PENDING',
  })

  const { data: schedulesResponse, isLoading, error } = useSchedulesByDeal(deal.id)
  const updateScheduleMutation = useUpdateSchedule()

  const formatCurrency = (amount?: number | string) => {
    if (!amount) return 'N/A'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    // Parse as UTC to avoid timezone shifts
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()
    const day = date.getUTCDate()
    const utcDate = new Date(Date.UTC(year, month, day))
    return utcDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    })
  }


  const canSendToWorkday = (schedule: Schedule) => {
    if (!schedule.ScheduleDate) return false
    const scheduleDate = new Date(schedule.ScheduleDate)
    const today = new Date()
    const isDateReached = scheduleDate <= today
    const currentStatus = schedule.ScheduleStatus || schedule.scheduleStatus || 'DRAFT'
    const isNotSent = currentStatus !== 'SENT_TO_WORKDAY'
    const hasNoInvoiceId = !schedule.WD_Invoice_ID__c || schedule.WD_Invoice_ID__c === ''
    const isBillable = schedule.Billable !== false
    return isDateReached && isNotSent && hasNoInvoiceId && isBillable
  }

  const handleCreateSchedule = () => {
    // Future: Implement schedule creation
    console.log('Creating schedule:', newSchedule)
    setIsCreateDialogOpen(false)
    setNewSchedule({
      description: '',
      Revenue: '',
      ScheduleDate: '',
      scheduleStatus: 'DRAFT',
      paymentStatus: 'PENDING',
    })
  }

  const handleCreateInvoice = (schedule: Schedule) => {
    // Future: Implement invoice creation
    console.log('Creating invoice for schedule:', schedule.id)
  }

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    return date.toISOString().split('T')[0]
  }

  const calculateSplitPercent = (wassermannAmount?: number | string, totalAmount?: number | string): number | undefined => {
    const wasserman = typeof wassermannAmount === 'string' ? parseFloat(wassermannAmount) : wassermannAmount
    const total = typeof totalAmount === 'string' ? parseFloat(totalAmount) : totalAmount

    if (!wasserman || !total || isNaN(wasserman) || isNaN(total) || total === 0) {
      return undefined
    }

    return Math.round((wasserman / total) * 100 * 100) / 100 // Round to 2 decimal places
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingScheduleId(schedule.id)
    const defaultSplitPercent = schedule.ScheduleSplitPercent || calculateSplitPercent(schedule.Wasserman_Invoice_Line_Amount__c, schedule.Revenue)

    setEditingSchedule({
      Description: schedule.Description,
      Revenue: schedule.Revenue,
      ScheduleDate: schedule.ScheduleDate,
      Type: schedule.Type,
      ScheduleSplitPercent: defaultSplitPercent,
      Billable: schedule.Billable,
      Talent_Invoice_Line_Amount__c: schedule.Talent_Invoice_Line_Amount__c,
      Wasserman_Invoice_Line_Amount__c: schedule.Wasserman_Invoice_Line_Amount__c,
      WD_Invoice_ID__c: schedule.WD_Invoice_ID__c,
      WD_Payment_Term__c: schedule.WD_Payment_Term__c,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingScheduleId) return

    try {
      await updateScheduleMutation.mutateAsync({
        id: editingScheduleId,
        schedule: editingSchedule,
      })
      setEditingScheduleId(null)
      setEditingSchedule({})
    } catch (error) {
      console.error('Failed to update schedule:', error)
      // TODO: Show error toast notification
    }
  }

  const handleCancelEdit = () => {
    setEditingScheduleId(null)
    setEditingSchedule({})
  }

  const toggleScheduleExpansion = (scheduleId: string) => {
    const newExpanded = new Set(expandedScheduleIds)
    if (newExpanded.has(scheduleId)) {
      newExpanded.delete(scheduleId)
      // If this schedule is being edited, cancel the edit
      if (editingScheduleId === scheduleId) {
        setEditingScheduleId(null)
        setEditingSchedule({})
      }
    } else {
      newExpanded.add(scheduleId)
    }
    setExpandedScheduleIds(newExpanded)
  }

  const getScheduleStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'sent_to_workday':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sent to Workday</Badge>
      case 'approved':
        return <Badge variant="default">Approved</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const schedules = schedulesResponse?.data || []

  // Apply filters
  const filteredSchedules = schedules.filter(schedule => {
    // Invoice filter
    if (invoiceFilter === 'invoiced' && (!schedule.WD_Invoice_ID__c || schedule.WD_Invoice_ID__c === '')) {
      return false
    }
    if (invoiceFilter === 'not-invoiced' && schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') {
      return false
    }

    // Payment filter
    if (paymentFilter === 'paid' && schedule.WD_Payment_Status__c?.toLowerCase() !== 'paid') {
      return false
    }
    if (paymentFilter === 'not-paid' && schedule.WD_Payment_Status__c?.toLowerCase() === 'paid') {
      return false
    }

    return true
  })

  const totalScheduleValue = filteredSchedules.reduce((sum, schedule) => {
    const revenue = typeof schedule.Revenue === 'string'
      ? parseFloat(schedule.Revenue)
      : (schedule.Revenue || 0)
    return sum + (isNaN(revenue) ? 0 : revenue)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Schedules Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSchedules.length}</div>
            <p className="text-xs text-muted-foreground">
              Payment schedules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalScheduleValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total scheduled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Invoice</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredSchedules.filter(canSendToWorkday).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for Workday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Schedules</CardTitle>
              <CardDescription>
                Manage payment schedules and Workday integration
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Select value={invoiceFilter} onValueChange={(value: any) => setInvoiceFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Invoice Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invoices</SelectItem>
                  <SelectItem value="invoiced">Invoiced</SelectItem>
                  <SelectItem value="not-invoiced">Not Invoiced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={paymentFilter} onValueChange={(value: any) => setPaymentFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="not-paid">Not Paid</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Schedule</DialogTitle>
                    <DialogDescription>
                      Add a new payment schedule for this deal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Schedule description..."
                        value={newSchedule.description}
                        onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={newSchedule.Revenue}
                        onChange={(e) => setNewSchedule({ ...newSchedule, Revenue: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Schedule Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSchedule.ScheduleDate}
                        onChange={(e) => setNewSchedule({ ...newSchedule, ScheduleDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={newSchedule.scheduleStatus}
                        onValueChange={(value) => setNewSchedule({ ...newSchedule, scheduleStatus: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="SENT_TO_WORKDAY">Sent to Workday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSchedule}>
                        Create Schedule
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading schedules...</div>
          ) : error ? (
            <div className="text-center py-6 text-red-600">
              Error loading schedules
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No schedules created yet
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No schedules match the selected filters
            </div>
          ) : (
            <div className="space-y-6">
              {Array.from(new Set(filteredSchedules.map(s => s.Description || 'Untitled Schedule')))
                .map((description) => {
                  const schedulesForDescription = filteredSchedules.filter(s =>
                    (s.Description || 'Untitled Schedule') === description
                  )
                  const totalRevenue = schedulesForDescription.reduce((sum, schedule) => {
                    const revenue = typeof schedule.Revenue === 'string'
                      ? parseFloat(schedule.Revenue)
                      : (schedule.Revenue || 0)
                    return sum + (isNaN(revenue) ? 0 : revenue)
                  }, 0)

                  return (
                    <div key={description} className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">{description}</h3>
                        <Badge variant="outline">
                          {schedulesForDescription.length} {schedulesForDescription.length === 1 ? 'schedule' : 'schedules'}
                        </Badge>
                        <span className="ml-auto text-lg font-semibold text-orange-600">
                          {formatCurrency(totalRevenue)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {schedulesForDescription.map((schedule) => {
                          const isExpanded = expandedScheduleIds.has(schedule.id)
                          return (
                            <Card key={schedule.id} className={`hover:shadow-md transition-shadow ${isExpanded ? 'md:col-span-2' : ''}`}>
                    <CardHeader
                      className="cursor-pointer py-2 px-3"
                      onClick={() => toggleScheduleExpansion(schedule.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          {schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '' && (
                            <div className="flex items-center gap-1">
                              <ReceiptText className="h-5 w-5 text-green-600" />
                              {schedule.WD_Payment_Status__c?.toLowerCase() === 'paid' && (
                                <DollarSign className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          )}
                          <div>
                            <div className="text-sm text-muted-foreground">Date</div>
                            <div className="text-base font-medium">{formatDate(schedule.ScheduleDate)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Amount</div>
                            <div className="text-base font-semibold text-white">
                              {formatCurrency(schedule.Revenue)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isExpanded && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditSchedule(schedule)
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="space-y-6">
                        {/* Basic Information */}
                        {editingScheduleId === schedule.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Description</Label>
                                <Input
                                  value={editingSchedule.Description || ''}
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, Description: e.target.value })}
                                  placeholder="Schedule description"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Amount</Label>
                                <Input
                                  type="number"
                                  value={editingSchedule.Revenue || ''}
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, Revenue: e.target.value ? parseFloat(e.target.value) : undefined })}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Schedule Date</Label>
                                <Input
                                  type="date"
                                  value={formatDateForInput(editingSchedule.ScheduleDate)}
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, ScheduleDate: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Type</Label>
                                <Input
                                  value={editingSchedule.Type || ''}
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, Type: e.target.value })}
                                  placeholder="Schedule type"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Talent Amount</Label>
                                <Input
                                  type="number"
                                  value={editingSchedule.Talent_Invoice_Line_Amount__c || ''}
                                  onChange={(e) => {
                                    const newTalentAmount = e.target.value ? parseFloat(e.target.value) : undefined
                                    const calculatedSplit = calculateSplitPercent(editingSchedule.Wasserman_Invoice_Line_Amount__c, editingSchedule.Revenue)
                                    setEditingSchedule({
                                      ...editingSchedule,
                                      Talent_Invoice_Line_Amount__c: newTalentAmount,
                                      ScheduleSplitPercent: calculatedSplit
                                    })
                                  }}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Wasserman Amount</Label>
                                <Input
                                  type="number"
                                  value={editingSchedule.Wasserman_Invoice_Line_Amount__c || ''}
                                  onChange={(e) => {
                                    const newWassermanAmount = e.target.value ? parseFloat(e.target.value) : undefined
                                    const calculatedSplit = calculateSplitPercent(newWassermanAmount, editingSchedule.Revenue)
                                    setEditingSchedule({
                                      ...editingSchedule,
                                      Wasserman_Invoice_Line_Amount__c: newWassermanAmount,
                                      ScheduleSplitPercent: calculatedSplit
                                    })
                                  }}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Split %</Label>
                                <Input
                                  type="number"
                                  value={editingSchedule.ScheduleSplitPercent || ''}
                                  onChange={(e) => {
                                    const newSplitPercent = e.target.value ? parseFloat(e.target.value) : undefined
                                    const revenue = typeof editingSchedule.Revenue === 'string' ? parseFloat(editingSchedule.Revenue) : editingSchedule.Revenue

                                    if (newSplitPercent && revenue) {
                                      const newWassermanAmount = (revenue * newSplitPercent) / 100
                                      const newTalentAmount = revenue - newWassermanAmount
                                      setEditingSchedule({
                                        ...editingSchedule,
                                        ScheduleSplitPercent: newSplitPercent,
                                        Wasserman_Invoice_Line_Amount__c: Math.round(newWassermanAmount * 100) / 100,
                                        Talent_Invoice_Line_Amount__c: Math.round(newTalentAmount * 100) / 100
                                      })
                                    } else {
                                      setEditingSchedule({
                                        ...editingSchedule,
                                        ScheduleSplitPercent: newSplitPercent
                                      })
                                    }
                                  }}
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Billable</Label>
                                <Select
                                  value={editingSchedule.Billable !== undefined ? (editingSchedule.Billable ? 'true' : 'false') : ''}
                                  onValueChange={(value) => setEditingSchedule({ ...editingSchedule, Billable: value === 'true' })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select billable status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="true">Yes</SelectItem>
                                    <SelectItem value="false">No</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Invoice ID</Label>
                                <Input
                                  value={editingSchedule.WD_Invoice_ID__c || ''}
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, WD_Invoice_ID__c: e.target.value })}
                                  placeholder="Invoice ID"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Payment Terms</Label>
                                <Input
                                  value={editingSchedule.WD_Payment_Term__c || ''}
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, WD_Payment_Term__c: e.target.value })}
                                  placeholder="Payment terms"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Talent Amount
                                </p>
                                <p className="text-base font-medium">{formatCurrency(schedule.Talent_Invoice_Line_Amount__c)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Wasserman Amount</p>
                                <p className="text-base font-medium">{formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Invoice ID</p>
                                <p className="text-base font-medium">{(schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') ? schedule.WD_Invoice_ID__c : '-'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Payment Status</p>
                                <div className="text-base font-medium">{schedule.WD_Payment_Status__c ? getPaymentStatusBadge(schedule.WD_Payment_Status__c) : '-'}</div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Type</p>
                                <p className="text-base font-medium">{schedule.Type || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Split %</p>
                                <p className="text-base font-medium">
                                  {schedule.ScheduleSplitPercent
                                    ? `${schedule.ScheduleSplitPercent}%`
                                    : calculateSplitPercent(schedule.Wasserman_Invoice_Line_Amount__c, schedule.Revenue)
                                      ? `${calculateSplitPercent(schedule.Wasserman_Invoice_Line_Amount__c, schedule.Revenue)}%`
                                      : '-'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Billable</p>
                                <p className="text-base font-medium">{schedule.Billable !== undefined ? (schedule.Billable ? 'Yes' : 'No') : '-'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Payment Terms</p>
                                <p className="text-base font-medium">{(schedule.WD_Payment_Term__c && schedule.WD_Payment_Term__c !== '') ? schedule.WD_Payment_Term__c : '-'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        {editingScheduleId !== schedule.id && canSendToWorkday(schedule) && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCreateInvoice(schedule)}
                            >
                              <FileText className="h-3 w-3 mr-2" />
                              Create Invoice
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workday Integration Info
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Workday Integration
          </CardTitle>
          <CardDescription>
            Automatic invoice creation and project management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Schedules with reached dates can be sent to Workday for invoicing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>Draft schedules need approval before sending</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>
                {schedules.filter(canSendToWorkday).length} schedules are ready to be sent
              </span>
            </div>

            {schedules.filter(canSendToWorkday).length > 0 && (
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Invoices for All Ready Schedules
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}