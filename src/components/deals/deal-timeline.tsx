'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import {
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Calendar,
  Timer,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { Deal } from '../../types'

interface DealTimelineProps {
  deal: Deal
  onNavigateToSchedule?: (scheduleId: string) => void
}

interface StageInfo {
  key: string
  name: string
  description: string
  order: number
  isCurrent: boolean
  isCompleted: boolean
  date?: string
  daysInStage?: number
}

export function DealTimeline({ deal, onNavigateToSchedule }: DealTimelineProps) {
  const [calendarDate, setCalendarDate] = useState(new Date())

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateDaysInStage = (): number | undefined => {
    if (!deal.Stage_Last_Updated__c) return undefined
    const stageDate = new Date(deal.Stage_Last_Updated__c)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - stageDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Calendar helpers
  const getCalendarDates = () => {
    const dates: Array<{
      date: Date
      label: string
      amount?: number
      type: string
      scheduleId?: string
      productName?: string
      deliverables?: string
      invoiceId?: string
      paymentStatus?: string
      poNumber?: string
      paymentTerms?: string
      scheduleStatus?: string
    }> = []

    // Handle start date - try multiple field names
    const startDate = deal.startDate || (deal as any).StartDate || deal.createdAt
    if (startDate) {
      dates.push({
        date: new Date(startDate),
        label: 'Deal Start',
        type: 'start'
      })
    }

    // Handle close date - try multiple field names
    const closeDate = deal.closeDate || (deal as any).CloseDate
    if (closeDate) {
      dates.push({
        date: new Date(closeDate),
        label: 'Expected Close',
        type: 'close'
      })
    }

    deal.products?.forEach((product) => {
      product.schedules?.forEach((schedule) => {
        if (schedule.ScheduleDate) {
          dates.push({
            date: new Date(schedule.ScheduleDate),
            label: schedule.Description || 'Schedule',
            amount: schedule.Revenue,
            type: 'invoice',
            scheduleId: schedule.id,
            productName: product.Product_Name__c,
            deliverables: product.Project_Deliverables__c,
            invoiceId: schedule.WD_Invoice_ID__c,
            paymentStatus: schedule.WD_Payment_Status__c,
            poNumber: schedule.WD_PO_Number__c,
            paymentTerms: schedule.WD_Payment_Term__c,
            scheduleStatus: schedule.ScheduleStatus
          })
        }
      })
    })

    deal.schedules?.filter(schedule => !deal.products?.some(product =>
      product.schedules?.some(ps => ps.id === schedule.id)
    )).forEach((schedule) => {
      if (schedule.ScheduleDate) {
        dates.push({
          date: new Date(schedule.ScheduleDate),
          label: schedule.Description || 'Schedule',
          amount: schedule.Revenue,
          type: 'invoice',
          scheduleId: schedule.id,
          invoiceId: schedule.WD_Invoice_ID__c,
          paymentStatus: schedule.WD_Payment_Status__c,
          poNumber: schedule.WD_PO_Number__c,
          paymentTerms: schedule.WD_Payment_Term__c,
          scheduleStatus: schedule.ScheduleStatus
        })
      }
    })

    return dates
  }

  const generateCalendarDays = () => {
    const allDates = getCalendarDates()
    if (allDates.length === 0) return { days: [], monthYear: '', hasEvents: false }

    const currentMonth = calendarDate.getMonth()
    const currentYear = calendarDate.getFullYear()

    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startingDayOfWeek = firstDay.getDay()

    const days: Array<{
      day: number | null
      isCurrentMonth: boolean
      events: typeof allDates
    }> = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false, events: [] })
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const eventsOnDay = allDates.filter(event => {
        return event.date.getDate() === day &&
               event.date.getMonth() === currentMonth &&
               event.date.getFullYear() === currentYear
      })

      days.push({
        day,
        isCurrentMonth: true,
        events: eventsOnDay
      })
    }

    const monthYear = firstDay.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })

    return { days, monthYear, hasEvents: true }
  }

  const previousMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
  }

  const jumpToNextEvent = () => {
    const allDates = getCalendarDates()
    if (allDates.length === 0) return

    const currentMonthEnd = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0)

    // Find the next event after the current month
    const nextEvent = allDates
      .filter(event => event.date > currentMonthEnd)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0]

    if (nextEvent) {
      setCalendarDate(new Date(nextEvent.date.getFullYear(), nextEvent.date.getMonth(), 1))
    }
  }

  const jumpToPreviousEvent = () => {
    const allDates = getCalendarDates()
    if (allDates.length === 0) return

    const currentMonthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1)

    // Find the previous event before the current month
    const previousEvent = allDates
      .filter(event => event.date < currentMonthStart)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0]

    if (previousEvent) {
      setCalendarDate(new Date(previousEvent.date.getFullYear(), previousEvent.date.getMonth(), 1))
    }
  }

  const hasNextEvent = () => {
    const allDates = getCalendarDates()
    const currentMonthEnd = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0)
    return allDates.some(event => event.date > currentMonthEnd)
  }

  const hasPreviousEvent = () => {
    const allDates = getCalendarDates()
    const currentMonthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1)
    return allDates.some(event => event.date < currentMonthStart)
  }

  const goToToday = () => {
    setCalendarDate(new Date())
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return calendarDate.getMonth() === today.getMonth() &&
           calendarDate.getFullYear() === today.getFullYear()
  }

  // Define the deal stages in order
  const allStages: Omit<StageInfo, 'isCurrent' | 'isCompleted' | 'date' | 'daysInStage'>[] = [
    {
      key: 'INITIAL_OUTREACH',
      name: 'Initial Outreach',
      description: 'First contact made with prospect',
      order: 0,
    },
    {
      key: 'NEGOTIATION',
      name: 'Negotiation',
      description: 'Contract terms and pricing negotiation',
      order: 1,
    },
    {
      key: 'TERMS_AGREED_UPON',
      name: 'Terms Agreed Upon',
      description: 'Terms finalized and agreed by both parties',
      order: 2,
    },
    {
      key: 'CLOSED_WON',
      name: 'Closed Won',
      description: 'Deal successfully closed',
      order: 3,
    },
    {
      key: 'CLOSED_LOST',
      name: 'Closed Lost',
      description: 'Deal lost or cancelled',
      order: 3,
    },
  ]

  // Find current stage order
  const currentStageOrder = allStages.find(s => s.key === deal.StageName)?.order || 0
  const isClosedWon = deal.StageName === 'CLOSED_WON'
  const isClosedLost = deal.StageName === 'CLOSED_LOST'
  const daysInCurrentStage = calculateDaysInStage()

  // Create timeline with stage information
  const timeline: StageInfo[] = allStages
    .filter(stage => {
      // Always show Closed Won, only show Closed Lost if it's the current stage
      if (stage.key === 'CLOSED_WON') {
        return true
      }
      if (stage.key === 'CLOSED_LOST') {
        return stage.key === deal.StageName
      }
      return stage.order <= Math.max(currentStageOrder, 2)
    })
    .map(stage => ({
      ...stage,
      isCurrent: stage.order === currentStageOrder,
      isCompleted: stage.order < currentStageOrder || (isClosedWon && stage.key !== 'CLOSED_LOST'),
      date: stage.key === deal.StageName ? deal.Stage_Last_Updated__c : undefined,
      daysInStage: stage.key === deal.StageName ? daysInCurrentStage : undefined,
    }))

  const getStageIcon = (stage: StageInfo) => {
    if (stage.key === 'INITIAL_OUTREACH') {
      if (stage.isCompleted) {
        return <MessageCircle className="h-5 w-5 text-green-600 fill-current" />
      } else if (stage.isCurrent) {
        return <MessageCircle className="h-5 w-5 text-blue-600"  />
      } else {
        return <MessageCircle className="h-5 w-5 text-gray-400" />
      }
    }
    if (stage.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (stage.isCurrent) {
      return <Clock className="h-5 w-5 text-blue-600" />
    } else {
      return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStageVariant = (stage: StageInfo) => {
    if (stage.key === 'CLOSED_WON') return 'default'
    if (stage.key === 'CLOSED_LOST') return 'destructive'
    if (stage.isCompleted) return 'secondary'
    if (stage.isCurrent) return 'outline'
    return 'secondary'
  }

  return (
    <div className="space-y-6">
      {/* Current Stage Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Current Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge variant={getStageVariant(timeline.find(s => s.isCurrent) || timeline[0])}>
                {deal.StageName}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {allStages.find(s => s.key === deal.StageName)?.description || 'In progress'}
              </div>
            </div>
            <div className="text-right space-y-1">
              {daysInCurrentStage && (
                <div className="text-2xl font-bold">
                  {daysInCurrentStage}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    days
                  </span>
                </div>
              )}
              {deal.Stage_Last_Updated__c && (
                <div className="text-xs text-muted-foreground">
                  Since {formatDate(deal.Stage_Last_Updated__c)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Deal Timeline
              </CardTitle>
              <CardDescription>
                Track the progression through deal stages
              </CardDescription>
            </div>
            {!isClosedWon && !isClosedLost && (
              <Button className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Advance Stage
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {timeline.map((stage, index) => (
              <div key={stage.key} className="relative">
                {/* Connection line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-2.5 top-8 w-0.5 h-8 bg-border" />
                )}

                <div className="flex items-start gap-4">
                  {/* Stage icon */}
                  <div className="flex-shrink-0">
                    {getStageIcon(stage)}
                  </div>

                  {/* Stage content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{stage.name}</h4>
                          {stage.isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {stage.description}
                        </p>
                      </div>

                      <div className="text-right space-y-1">
                        {stage.date && (
                          <div className="text-sm font-medium">
                            {formatDate(stage.date)}
                          </div>
                        )}
                        {stage.daysInStage && (
                          <div className="text-xs text-muted-foreground">
                            {stage.daysInStage} days
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Deal Calendar
          </CardTitle>
          <CardDescription>
            Important dates and milestones for this deal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const { days, monthYear, hasEvents } = generateCalendarDays()

            if (!hasEvents) {
              return (
                <div className="text-center py-6 text-muted-foreground">
                  No calendar events yet
                </div>
              )
            }

            return (
              <div>
                {/* Month/Year Header with Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={jumpToPreviousEvent}
                      disabled={!hasPreviousEvent()}
                      title="Jump to previous event"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <ChevronLeft className="h-4 w-4 -ml-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={previousMonth}
                      title="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      disabled={isCurrentMonth()}
                      title="Go to today"
                    >
                      Today
                    </Button>
                  </div>
                  <div className="text-lg font-semibold">
                    {monthYear}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextMonth}
                      disabled={calendarDate.getFullYear() >= 2030}
                      title="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={jumpToNextEvent}
                      disabled={!hasNextEvent() || calendarDate.getFullYear() >= 2030}
                      title="Jump to next event"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <ChevronRight className="h-4 w-4 -ml-3" />
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {days.map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`min-h-[80px] p-1 border rounded-lg ${
                        dayInfo.isCurrentMonth
                          ? dayInfo.events.length > 0
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900'
                            : 'bg-background'
                          : 'bg-muted/20'
                      }`}
                    >
                      {dayInfo.day && (
                        <>
                          <div className={`text-xs font-medium p-1 ${
                            dayInfo.events.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                          }`}>
                            {dayInfo.day}
                          </div>

                          {/* Events for this day */}
                          <TooltipProvider delayDuration={300}>
                            <div className="space-y-1">
                              {dayInfo.events.map((event, eventIndex) => (
                                <Tooltip key={eventIndex}>
                                  <TooltipTrigger asChild>
                                    <div
                                      onClick={() => {
                                        if (event.type === 'invoice' && event.scheduleId && onNavigateToSchedule) {
                                          onNavigateToSchedule(event.scheduleId)
                                        }
                                      }}
                                      className={`text-[10px] p-1 rounded truncate ${
                                        event.type === 'invoice' && event.scheduleId && onNavigateToSchedule
                                          ? 'cursor-pointer hover:ring-2 hover:ring-offset-1'
                                          : 'cursor-default'
                                      } ${
                                        event.type === 'start'
                                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                          : event.type === 'close'
                                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'
                                          : event.type === 'invoice'
                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 hover:ring-blue-400'
                                          : 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400'
                                      }`}
                                    >
                                      {event.label}
                                      {event.amount && (
                                        <div className="font-medium">
                                          ${(event.amount / 1000).toFixed(0)}k
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-2">
                                      {/* Event Header */}
                                      <div>
                                        <div className="font-semibold text-sm">{event.label}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {event.date.toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </div>
                                      </div>

                                      {/* Deal Information */}
                                      <div className="space-y-1">
                                        <div className="text-xs">
                                          <span className="font-medium">Deal:</span> {deal.Name}
                                        </div>
                                        {deal.brand?.name && (
                                          <div className="text-xs">
                                            <span className="font-medium">Brand:</span> {deal.brand.name}
                                          </div>
                                        )}
                                      </div>

                                      {/* Amount */}
                                      {event.amount && (
                                        <div className="text-sm font-semibold">
                                          {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                          }).format(event.amount)}
                                        </div>
                                      )}

                                      {/* Invoice/Payment Details */}
                                      {event.type === 'invoice' && (
                                        <div className="space-y-1 border-t pt-2">
                                          {event.productName && (
                                            <div className="text-xs">
                                              <span className="font-medium">Product:</span> {event.productName}
                                            </div>
                                          )}
                                          {event.deliverables && (
                                            <div className="text-xs">
                                              <span className="font-medium">Deliverables:</span> {event.deliverables}
                                            </div>
                                          )}
                                          {event.invoiceId && (
                                            <div className="text-xs">
                                              <span className="font-medium">Invoice ID:</span> {event.invoiceId}
                                            </div>
                                          )}
                                          {event.poNumber && (
                                            <div className="text-xs">
                                              <span className="font-medium">PO Number:</span> {event.poNumber}
                                            </div>
                                          )}
                                          {event.paymentStatus && (
                                            <div className="text-xs">
                                              <span className="font-medium">Payment Status:</span> {event.paymentStatus}
                                            </div>
                                          )}
                                          {event.paymentTerms && (
                                            <div className="text-xs">
                                              <span className="font-medium">Payment Terms:</span> {event.paymentTerms}
                                            </div>
                                          )}
                                          {event.scheduleStatus && (
                                            <div className="text-xs">
                                              <span className="font-medium">Status:</span> {event.scheduleStatus}
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      {/* Start/Close Date Details */}
                                      {event.type === 'start' && (
                                        <div className="text-xs text-muted-foreground border-t pt-2">
                                          This is when the deal officially started
                                        </div>
                                      )}
                                      {event.type === 'close' && (
                                        <div className="text-xs text-muted-foreground border-t pt-2">
                                          Expected closing date for this deal
                                        </div>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </TooltipProvider>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950" />
                    <span className="text-muted-foreground">Start Date</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-purple-100 dark:bg-purple-950" />
                    <span className="text-muted-foreground">Close Date</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-950" />
                    <span className="text-muted-foreground">Schedule</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-950" />
                    <span className="text-muted-foreground">Payment</span>
                  </div>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>
    </div>
  )
}