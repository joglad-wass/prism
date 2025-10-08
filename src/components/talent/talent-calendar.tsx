'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCalendarEvents } from '../../hooks/useCalendar'
import { CalendarEvent, CalendarEventType } from '../../types'
import { TalentDetail } from '../../types/talent'
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns'
import Link from 'next/link'
import { ResizableDivider } from '../ui/resizable-divider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { cn } from '../../lib/utils'

const EVENT_TYPE_COLORS: Record<CalendarEventType, string> = {
  DEAL_CONTRACT_START: '#22c55e',
  DEAL_CONTRACT_END: '#ef4444',
  DEAL_STAGE_CHANGE: '#3b82f6',
  DEAL_NOTE: '#a855f7',
  DEAL_CREATED: '#10b981',
  SCHEDULE_DATE: '#eab308',
  SCHEDULE_PAYMENT: '#f59e0b',
  PRODUCT_CREATED: '#06b6d4',
  INVOICE_DATE: '#6366f1',
  PAYMENT_DATE: '#84cc16',
  TALENT_NOTE: '#8b5cf6',
  TALENT_EMAIL_LOG: '#ec4899',
  TALENT_CALL_LOG: '#f43f5e',
  TALENT_SIGNED: '#14b8a6',
  TALENT_DROPPED: '#6b7280',
  TALENT_NEW_DEAL: '#0ea5e9',
  TALENT_NEW_BRAND: '#d946ef',
  BRAND_NOTE: '#f97316',
  BRAND_STATUS_CHANGE: '#64748b',
  BRAND_NEW_DEAL: '#2563eb',
}

const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  DEAL_CONTRACT_START: 'Contract Start',
  DEAL_CONTRACT_END: 'Contract End',
  DEAL_STAGE_CHANGE: 'Stage Change',
  DEAL_NOTE: 'Deal Note',
  DEAL_CREATED: 'Deal Created',
  SCHEDULE_DATE: 'Schedule',
  SCHEDULE_PAYMENT: 'Payment',
  PRODUCT_CREATED: 'Product',
  INVOICE_DATE: 'Invoice',
  PAYMENT_DATE: 'Payment',
  TALENT_NOTE: 'Client Note',
  TALENT_EMAIL_LOG: 'Email',
  TALENT_CALL_LOG: 'Call',
  TALENT_SIGNED: 'Client Signed',
  TALENT_DROPPED: 'Client Dropped',
  TALENT_NEW_DEAL: 'New Deal',
  TALENT_NEW_BRAND: 'New Brand',
  BRAND_NOTE: 'Brand Note',
  BRAND_STATUS_CHANGE: 'Brand Status',
  BRAND_NEW_DEAL: 'New Brand Deal',
}

const DEFAULT_SPLIT_RATIO = 60

interface TalentCalendarProps {
  talent: TalentDetail
}

export function TalentCalendar({ talent }: TalentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [splitRatio, setSplitRatio] = useState(DEFAULT_SPLIT_RATIO)

  const startDate = startOfMonth(currentMonth)
  const endDate = endOfMonth(currentMonth)

  const { data: allEvents, isLoading } = useCalendarEvents({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  })

  // Filter events for this specific talent
  const filteredEvents = useMemo(() => {
    if (!allEvents) return []
    return allEvents.filter(event => event.talentClient?.id === talent.id)
  }, [allEvents, talent.id])

  // Get events for selected date
  const selectedDateEvents = filteredEvents?.filter((event) =>
    selectedDate ? isSameDay(parseISO(event.date), selectedDate) : false
  )

  // Get fallback events if no events on selected date
  const fallbackEvents = useMemo(() => {
    if (!filteredEvents || !selectedDate || (selectedDateEvents && selectedDateEvents.length > 0)) {
      return null
    }

    // First, try to get future events in the current month
    const futureEventsInMonth = filteredEvents
      .filter((event) => {
        const eventDate = parseISO(event.date)
        return eventDate > selectedDate &&
               eventDate.getMonth() === selectedDate.getMonth() &&
               eventDate.getFullYear() === selectedDate.getFullYear()
      })
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
      .slice(0, 5)

    if (futureEventsInMonth.length > 0) {
      return { type: 'future' as const, events: futureEventsInMonth }
    }

    // If no future events, get recent past events in the month
    const pastEventsInMonth = filteredEvents
      .filter((event) => {
        const eventDate = parseISO(event.date)
        return eventDate < selectedDate &&
               eventDate.getMonth() === selectedDate.getMonth() &&
               eventDate.getFullYear() === selectedDate.getFullYear()
      })
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
      .slice(0, 5)

    if (pastEventsInMonth.length > 0) {
      return { type: 'past' as const, events: pastEventsInMonth }
    }

    return null
  }, [filteredEvents, selectedDate, selectedDateEvents])

  // Calendar grid generation
  const generateCalendarDays = () => {
    const currentMonthNum = currentMonth.getMonth()
    const currentYear = currentMonth.getFullYear()

    const firstDay = new Date(currentYear, currentMonthNum, 1)
    const lastDay = new Date(currentYear, currentMonthNum + 1, 0)
    const startingDayOfWeek = firstDay.getDay()

    const days: Array<{
      day: number | null
      date: Date | null
      isCurrentMonth: boolean
      events: CalendarEvent[]
    }> = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, date: null, isCurrentMonth: false, events: [] })
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentYear, currentMonthNum, day)
      const eventsOnDay = filteredEvents?.filter((event) =>
        isSameDay(parseISO(event.date), date)
      ) || []

      days.push({
        day,
        date,
        isCurrentMonth: true,
        events: eventsOnDay
      })
    }

    return days
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(today)
  }

  const isCurrentMonth = () => {
    const today = new Date()
    return currentMonth.getMonth() === today.getMonth() &&
           currentMonth.getFullYear() === today.getFullYear()
  }

  // Get link for event
  const getEventLink = (event: CalendarEvent): string => {
    if (event.deal) return `/deals/${event.deal.id}`
    if (event.talentClient) return `/talent/${event.talentClient.id}`
    if (event.brand) return `/brands/${event.brand.id}`
    return '#'
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Calendar */}
            <div
              style={{
                width: `${splitRatio}%`,
                transition: 'width 0.2s ease-in-out',
              }}
            >
              <div className="rounded-md border w-full p-4">
                {/* Month/Year Header with Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
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
                    {format(currentMonth, 'MMMM yyyy')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextMonth}
                      title="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
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
                  {generateCalendarDays().map((dayInfo, index) => (
                    <div
                      key={index}
                      className={cn(
                        'min-h-[80px] p-1 border rounded-lg cursor-pointer transition-colors',
                        dayInfo.isCurrentMonth
                          ? dayInfo.events.length > 0
                            ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950/50'
                            : 'bg-background hover:bg-muted/50'
                          : 'bg-muted/20',
                        selectedDate && dayInfo.date && isSameDay(selectedDate, dayInfo.date) && 'ring-2 ring-primary'
                      )}
                      onClick={() => dayInfo.date && setSelectedDate(dayInfo.date)}
                    >
                      {dayInfo.day && (
                        <>
                          <div className={cn(
                            'text-xs font-medium p-1',
                            dayInfo.events.length > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'
                          )}>
                            {dayInfo.day}
                          </div>

                          {/* Events for this day */}
                          <div className="space-y-1">
                            {dayInfo.events.slice(0, 3).map((event, eventIndex) => (
                              <Tooltip key={eventIndex}>
                                <TooltipTrigger asChild>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      window.location.href = getEventLink(event)
                                    }}
                                    className="text-[10px] p-1 rounded truncate cursor-pointer hover:ring-2 hover:ring-offset-1 bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 hover:ring-blue-400"
                                    style={{
                                      backgroundColor: `${EVENT_TYPE_COLORS[event.type]}20`,
                                      borderLeft: `3px solid ${EVENT_TYPE_COLORS[event.type]}`
                                    }}
                                  >
                                    <div className="font-medium truncate">{event.title}</div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="max-w-xs">
                                  <div className="space-y-2">
                                    <div>
                                      <div className="font-semibold text-sm">{event.title}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {dayInfo.date && format(dayInfo.date, 'MMMM d, yyyy')}
                                      </div>
                                    </div>
                                    <div>
                                      <Badge variant="outline" className="text-xs">
                                        {EVENT_TYPE_LABELS[event.type]}
                                      </Badge>
                                    </div>
                                    {event.metadata && event.metadata.amount && (
                                      <div className="text-sm font-semibold">
                                        ${(event.metadata.amount / 1000000).toFixed(2)}M
                                      </div>
                                    )}
                                    {event.deal && (
                                      <div className="text-xs">
                                        <span className="font-medium">Deal:</span> {event.deal.Name}
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                            {dayInfo.events.length > 3 && (
                              <div className="text-[9px] text-center text-muted-foreground">
                                +{dayInfo.events.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Resizable Divider */}
            <div className="flex items-center self-stretch">
              <ResizableDivider
                onResize={setSplitRatio}
                minLeftPercentage={40}
                maxLeftPercentage={80}
              />
            </div>

            {/* Events for Selected Date - Sidebar */}
            <div
              className="flex flex-col"
              style={{
                width: `${100 - splitRatio}%`,
                transition: 'width 0.2s ease-in-out',
              }}
            >
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">
                  {selectedDate
                    ? format(selectedDate, 'MMMM d, yyyy')
                    : 'Select a date'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedDateEvents?.length || 0}{' '}
                  {selectedDateEvents?.length === 1 ? 'event' : 'events'}
                </p>
              </div>

              <div
                className="space-y-2 overflow-y-auto pr-2"
                style={{
                  maxHeight: 'calc(5 * 5.8rem)',
                }}
              >
                {/* Show past events first if they exist */}
                {fallbackEvents && fallbackEvents.type === 'past' && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Recent events this month
                    </p>
                    {fallbackEvents.events.map((event) => (
                      <Link
                        key={event.id}
                        href={getEventLink(event)}
                        className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors mb-2"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-2 h-2 rounded-full mt-1.5"
                            style={{
                              backgroundColor: EVENT_TYPE_COLORS[event.type],
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{event.title}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(parseISO(event.date), 'MMM d')}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {EVENT_TYPE_LABELS[event.type]}
                            </Badge>
                            {event.metadata && event.metadata.amount && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ${(event.metadata.amount / 1000000).toFixed(2)}M
                              </p>
                            )}
                            {event.deal && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Deal: {event.deal.Name}
                              </p>
                            )}
                            {event.brand && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Brand: {event.brand.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                    <div className="border-b my-4" />
                  </div>
                )}

                {/* Current date events or "no events" message */}
                {selectedDateEvents && selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event) => (
                    <Link
                      key={event.id}
                      href={getEventLink(event)}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5"
                          style={{
                            backgroundColor: EVENT_TYPE_COLORS[event.type],
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{event.title}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {EVENT_TYPE_LABELS[event.type]}
                          </Badge>
                          {event.metadata && event.metadata.amount && (
                            <p className="text-xs text-muted-foreground mt-1">
                              ${(event.metadata.amount / 1000000).toFixed(2)}M
                            </p>
                          )}
                          {event.deal && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Deal: {event.deal.Name}
                            </p>
                          )}
                          {event.brand && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Brand: {event.brand.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : !fallbackEvents ? (
                  <div className="flex items-center justify-center py-16 text-center text-muted-foreground text-sm">
                    No events on this date
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-center text-muted-foreground py-8 text-sm">
                    No events on this date
                  </div>
                )}

                {/* Show future events last if they exist */}
                {fallbackEvents && fallbackEvents.type === 'future' && (
                  <div className="mt-4">
                    <div className="border-b mb-4" />
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Upcoming events this month
                    </p>
                    {fallbackEvents.events.map((event) => (
                      <Link
                        key={event.id}
                        href={getEventLink(event)}
                        className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors mb-2"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-2 h-2 rounded-full mt-1.5"
                            style={{
                              backgroundColor: EVENT_TYPE_COLORS[event.type],
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{event.title}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(parseISO(event.date), 'MMM d')}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs mt-1">
                              {EVENT_TYPE_LABELS[event.type]}
                            </Badge>
                            {event.metadata && event.metadata.amount && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ${(event.metadata.amount / 1000000).toFixed(2)}M
                              </p>
                            )}
                            {event.deal && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Deal: {event.deal.Name}
                              </p>
                            )}
                            {event.brand && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Brand: {event.brand.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
