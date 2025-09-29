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
} from 'lucide-react'
import { Deal, Schedule } from '../../types'
import { useSchedulesByDeal } from '../../hooks/useSchedules'

interface DealSchedulesProps {
  deal: Deal
}

export function DealSchedules({ deal }: DealSchedulesProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [expandedScheduleIds, setExpandedScheduleIds] = useState<Set<string>>(new Set())
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule>>({})
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

  const handleCreateInvoice = (schedule: Schedule) => {
    // Future: Implement invoice creation
    console.log('Creating invoice for schedule:', schedule.id)
  }

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingScheduleId(schedule.id)
    setEditingSchedule({
      Description: schedule.Description,
      Revenue: schedule.Revenue,
      ScheduleDate: schedule.ScheduleDate,
      Type: schedule.Type,
      ScheduleSplitPercent: schedule.ScheduleSplitPercent,
      Billable: schedule.Billable,
    })
  }

  const handleSaveEdit = () => {
    // Future: Implement schedule update API call
    console.log('Saving schedule:', editingScheduleId, editingSchedule)
    setEditingScheduleId(null)
    setEditingSchedule({})
  }

  const handleCancelEdit = () => {
    setEditingScheduleId(null)
    setEditingSchedule({})
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
            <div className="grid gap-4">
              {schedules.map((schedule) => {
                const isExpanded = expandedScheduleIds.has(schedule.id)
                return (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardHeader
                      className="cursor-pointer"
                      onClick={() => toggleScheduleExpansion(schedule.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            {schedule.Description || 'Untitled Schedule'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {canSendToWorkday(schedule) && (
                              <AlertCircle className="h-4 w-4 text-amber-500" />
                            )}
                            Due: {formatDate(schedule.ScheduleDate)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              {formatCurrency(schedule.Revenue)}
                            </div>
                            <div className="flex gap-2 mt-1">
                              {getScheduleStatusBadge(schedule.ScheduleStatus || schedule.scheduleStatus || 'DRAFT')}
                              {getPaymentStatusBadge(schedule.WD_Payment_Status__c || schedule.paymentStatus || 'PENDING')}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {canSendToWorkday(schedule) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCreateInvoice(schedule)
                                }}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Create Invoice
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
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="space-y-6">
                        {/* Basic Information */}
                        {editingScheduleId === schedule.id ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Description</Label>
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
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, Revenue: e.target.value })}
                                  placeholder="0.00"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm text-muted-foreground">Schedule Date</Label>
                                <Input
                                  type="date"
                                  value={editingSchedule.ScheduleDate || ''}
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
                                <Label className="text-sm text-muted-foreground">Split %</Label>
                                <Input
                                  type="number"
                                  value={editingSchedule.ScheduleSplitPercent || ''}
                                  onChange={(e) => setEditingSchedule({ ...editingSchedule, ScheduleSplitPercent: e.target.value ? parseFloat(e.target.value) : undefined })}
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
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Type</p>
                              <p className="font-medium">{schedule.Type || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Split %</p>
                              <p className="font-medium">{schedule.ScheduleSplitPercent ? `${schedule.ScheduleSplitPercent}%` : '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Billable</p>
                              <p className="font-medium">{schedule.Billable !== undefined ? (schedule.Billable ? 'Yes' : 'No') : '-'}</p>
                            </div>
                            {schedule.WD_Invoice_Reference_ID__c && (
                              <div>
                                <p className="text-sm text-muted-foreground">Invoice Reference</p>
                                <p className="font-medium text-xs">{schedule.WD_Invoice_Reference_ID__c}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Invoice Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                          <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Talent Amount
                            </p>
                            <p className="font-medium">{formatCurrency(schedule.Talent_Invoice_Line_Amount__c)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Wasserman Amount</p>
                            <p className="font-medium">{formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Invoice ID</p>
                            <p className="font-medium text-xs">{(schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') ? schedule.WD_Invoice_ID__c : '-'}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Payment Terms</p>
                            <p className="font-medium">{(schedule.WD_Payment_Term__c && schedule.WD_Payment_Term__c !== '') ? schedule.WD_Payment_Term__c : '-'}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        {editingScheduleId !== schedule.id && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <Edit className="h-3 w-3 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                // Handle external link action
                              }}
                            >
                              <ExternalLink className="h-3 w-3 mr-2" />
                              View Details
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                )
              })}
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
                  <FileText className="mr-2 h-4 w-4" />
                  Create Invoices for All Ready Schedules
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}