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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
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
  ChevronRight,
  Info,
  CreditCard,
  FileText,
} from 'lucide-react'
import { Deal, Schedule } from '../../types'
import { useSchedulesByDeal } from '../../hooks/useSchedules'

interface DealSchedulesProps {
  deal: Deal
}

export function DealSchedules({ deal }: DealSchedulesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set())
  const [newSchedule, setNewSchedule] = useState({
    description: '',
    Revenue: '',
    ScheduleDate: '',
    scheduleStatus: 'DRAFT',
    paymentStatus: 'PENDING',
  })

  const { data: schedulesResponse, isLoading, error } = useSchedulesByDeal(deal.id)

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
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getScheduleStatusVariant = (status: string) => {
    switch (status) {
      case 'SENT_TO_WORKDAY':
        return 'default'
      case 'APPROVED':
        return 'secondary'
      case 'PENDING':
        return 'outline'
      case 'DRAFT':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default'
      case 'PENDING':
        return 'outline'
      case 'OVERDUE':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const canSendToWorkday = (schedule: Schedule) => {
    if (!schedule.ScheduleDate) return false
    const scheduleDate = new Date(schedule.ScheduleDate)
    const today = new Date()
    const isDateReached = scheduleDate <= today
    const currentStatus = schedule.ScheduleStatus || schedule.scheduleStatus || 'DRAFT'
    const isNotSent = currentStatus !== 'SENT_TO_WORKDAY'
    return isDateReached && isNotSent
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

  const handleSendToWorkday = (schedule: Schedule) => {
    // Future: Implement Workday integration
    console.log('Sending schedule to Workday:', schedule.id)
  }

  const toggleScheduleExpansion = (scheduleId: string) => {
    const newExpanded = new Set(expandedScheduleIds)
    if (newExpanded.has(scheduleId)) {
      newExpanded.delete(scheduleId)
    } else {
      newExpanded.add(scheduleId)
    }
    setExpandedScheduleIds(newExpanded)
  }

  const ScheduleDetailsRow = ({ schedule }: { schedule: Schedule }) => {
    return (
      <TableRow className="bg-muted/50">
        <TableCell colSpan={6}>
          <div className="p-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Basic Information */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Basic Information
                </h4>
                <div className="space-y-1 text-sm">
                  {/* <div className="flex justify-between">
                    <span className="text-muted-foreground">Schedule ID:</span>
                    <span className="font-mono text-xs">{schedule.id.slice(0, 12)}...</span>
                  </div> */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{schedule.Type || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Split %:</span>
                    <span>{schedule.ScheduleSplitPercent ? `${schedule.ScheduleSplitPercent}%` : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Billable:</span>
                    <span>{schedule.Billable !== undefined ? (schedule.Billable ? 'Yes' : 'No') : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Information */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Invoice Details
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Talent Amount:</span>
                    <span>{formatCurrency(schedule.Talent_Invoice_Line_Amount__c)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wasserman Amount:</span>
                    <span>{formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice ID:</span>
                    <span className="">{(schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') ? schedule.WD_Invoice_ID__c : '-'}</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span className="text-muted-foreground">WD Reference ID:</span>
                    <span>{(schedule.WD_Invoice_Reference_ID__c && schedule.WD_Invoice_Reference_ID__c !== '') ? schedule.WD_Invoice_Reference_ID__c : 'N/A'}</span>
                  </div> */}
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Details
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Status:</span>
                    <Badge variant={getPaymentStatusVariant((schedule.WD_Payment_Status__c && schedule.WD_Payment_Status__c !== '') ? schedule.WD_Payment_Status__c : 'PENDING')} className="text-xs">
                      {(schedule.WD_Payment_Status__c && schedule.WD_Payment_Status__c !== '') ? schedule.WD_Payment_Status__c : 'PENDING'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Terms:</span>
                    <span>{(schedule.WD_Payment_Term__c && schedule.WD_Payment_Term__c !== '') ? schedule.WD_Payment_Term__c : '-'}</span>
                  </div>
                  {schedule.paymentDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Date:</span>
                    <span>{formatDate(schedule.createdAt)}</span>
                  </div>
                  )}
                </div>
              </div>
            </div>

            {/* Full Description */}
            {/* {schedule.Description && (
              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-muted-foreground p-3 bg-background rounded border">
                  {schedule.Description}
                </p>
              </div>
            )} */}
          </div>
        </TableCell>
      </TableRow>
    )
  }

  const schedules = schedulesResponse?.data || []
  const totalScheduleValue = schedules.reduce((sum, schedule) => {
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
            <div className="text-2xl font-bold">{schedules.length}</div>
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
            <CardTitle className="text-sm font-medium">Sendable</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schedules.filter(canSendToWorkday).length}
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
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Schedule Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => {
                    const isExpanded = expandedScheduleIds.has(schedule.id)
                    return (
                      <React.Fragment key={schedule.id}>
                        <TableRow
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleScheduleExpansion(schedule.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {schedule.Description || 'Untitled Schedule'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(schedule.Revenue)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canSendToWorkday(schedule) && (
                                <AlertCircle className="h-4 w-4 text-amber-500" />
                              )}
                              {formatDate(schedule.ScheduleDate)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getScheduleStatusVariant(schedule.ScheduleStatus || schedule.scheduleStatus || 'DRAFT')}>
                              {schedule.ScheduleStatus || schedule.scheduleStatus || 'DRAFT'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getPaymentStatusVariant(schedule.WD_Payment_Status__c || schedule.paymentStatus || 'PENDING')}>
                              {schedule.WD_Payment_Status__c || schedule.paymentStatus || 'PENDING'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canSendToWorkday(schedule) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleSendToWorkday(schedule)
                                  }}
                                >
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle external link action
                                }}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && <ScheduleDetailsRow schedule={schedule} />}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workday Integration Info */}
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
                  <Send className="mr-2 h-4 w-4" />
                  Send All Ready Schedules to Workday
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}