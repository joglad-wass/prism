'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Calendar as CalendarIcon, LayoutGrid, Maximize2, RotateCcw, X, Check, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useCalendarEvents } from '../../hooks/useCalendar'
import { useLabels } from '../../hooks/useLabels'
import { CalendarEvent, CalendarEventType } from '../../types'
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, parseISO } from 'date-fns'
import Link from 'next/link'
import { ResizableDivider } from '../ui/resizable-divider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
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

// Event type categories for filtering
const EVENT_CATEGORIES = {
  'Deal/Slip': [
    'DEAL_CREATED',
    'DEAL_CONTRACT_START',
    'DEAL_CONTRACT_END',
    'PRODUCT_CREATED',
    'DEAL_STAGE_CHANGE',
    'DEAL_NOTE',
    'INVOICE_DATE',
    'SCHEDULE_DATE',
    'PAYMENT_DATE', // Only one payment type
  ],
  'Talent': [
    'TALENT_SIGNED',
    'TALENT_NEW_DEAL',
    'TALENT_NEW_BRAND',
    'TALENT_NOTE',
    'TALENT_DROPPED',
    'TALENT_EMAIL_LOG',
    'TALENT_CALL_LOG',
  ],
  'Brand': [
    'BRAND_NEW_DEAL',
    'BRAND_NOTE',
    'BRAND_STATUS_CHANGE',
  ],
} as const

type ViewMode = 'detail' | 'fullWidth'

const DEFAULT_SPLIT_RATIO = 60 // 60% calendar, 40% detail
const STORAGE_KEY_VIEW_MODE = 'calendar-view-mode'
const STORAGE_KEY_SPLIT_RATIO = 'calendar-split-ratio'
const STORAGE_KEY_DEFAULT_SPLIT = 'calendar-default-split-ratio'

export function ActivityCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('detail')
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const [splitRatio, setSplitRatio] = useState(DEFAULT_SPLIT_RATIO)
  const [defaultSplitRatio, setDefaultSplitRatio] = useState(DEFAULT_SPLIT_RATIO)
  const [hoveredDate, setHoveredDate] = useState<Date | undefined>(undefined)
  const [isEventTypesExpanded, setIsEventTypesExpanded] = useState(false)

  // Get labels for dynamic category names
  const { labels } = useLabels()

  // Filter state
  const [selectedTalentIds, setSelectedTalentIds] = useState<Set<string>>(new Set())
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set())
  const [selectedEventTypes, setSelectedEventTypes] = useState<Set<CalendarEventType>>(
    new Set(Object.keys(EVENT_TYPE_LABELS) as CalendarEventType[])
  )
  const [talentSearchQuery, setTalentSearchQuery] = useState('')
  const [brandSearchQuery, setBrandSearchQuery] = useState('')

  // Get dynamic category label
  const dealLabel = labels.deal || 'Deal'

  // Load preferences from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem(STORAGE_KEY_VIEW_MODE) as ViewMode | null
    const savedSplitRatio = localStorage.getItem(STORAGE_KEY_SPLIT_RATIO)
    const savedDefaultSplit = localStorage.getItem(STORAGE_KEY_DEFAULT_SPLIT)

    if (savedViewMode) setViewMode(savedViewMode)
    if (savedSplitRatio) setSplitRatio(Number(savedSplitRatio))
    if (savedDefaultSplit) setDefaultSplitRatio(Number(savedDefaultSplit))
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, viewMode)
  }, [viewMode])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SPLIT_RATIO, String(splitRatio))
  }, [splitRatio])

  const handleSetDefaultSplit = useCallback(() => {
    setDefaultSplitRatio(splitRatio)
    localStorage.setItem(STORAGE_KEY_DEFAULT_SPLIT, String(splitRatio))
  }, [splitRatio])

  const isCustomSplit = Math.abs(splitRatio - defaultSplitRatio) > 2 // 2% tolerance

  const startDate = startOfMonth(currentMonth)
  const endDate = endOfMonth(currentMonth)

  const { data: events, isLoading } = useCalendarEvents({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  })

  // Get unique talents and brands from calendar events
  const { talents, brands } = useMemo(() => {
    if (!events) return { talents: [], brands: [] }

    const talentMap = new Map<string, { id: string; Name: string }>()
    const brandMap = new Map<string, { id: string; name: string }>()

    events.forEach((event) => {
      if (event.talentClient && !talentMap.has(event.talentClient.id)) {
        talentMap.set(event.talentClient.id, event.talentClient)
      }
      if (event.brand && !brandMap.has(event.brand.id)) {
        brandMap.set(event.brand.id, event.brand)
      }
    })

    return {
      talents: Array.from(talentMap.values()).sort((a, b) => a.Name.localeCompare(b.Name)),
      brands: Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
    }
  }, [events])

  // Filtered talents and brands based on search
  const filteredTalents = useMemo(() => {
    if (!talentSearchQuery) return talents
    const query = talentSearchQuery.toLowerCase()
    return talents.filter(talent => talent.Name.toLowerCase().includes(query))
  }, [talents, talentSearchQuery])

  const filteredBrands = useMemo(() => {
    if (!brandSearchQuery) return brands
    const query = brandSearchQuery.toLowerCase()
    return brands.filter(brand => brand.name.toLowerCase().includes(query))
  }, [brands, brandSearchQuery])

  // Filter events based on entity and event type filters
  const filteredEvents = useMemo(() => {
    if (!events) return []

    return events.filter((event) => {
      // Talent/Brand ID filter - if any are selected, only show matching events
      const hasTalentFilter = selectedTalentIds.size > 0
      const hasBrandFilter = selectedBrandIds.size > 0

      if (hasTalentFilter || hasBrandFilter) {
        const matchesTalent = event.talentClient && selectedTalentIds.has(event.talentClient.id)
        const matchesBrand = event.brand && selectedBrandIds.has(event.brand.id)

        // If both filters active, event must match at least one
        if (hasTalentFilter && hasBrandFilter) {
          if (!matchesTalent && !matchesBrand) return false
        } else if (hasTalentFilter && !matchesTalent) {
          return false
        } else if (hasBrandFilter && !matchesBrand) {
          return false
        }
      }

      // Event type filter
      if (!selectedEventTypes.has(event.type)) return false

      return true
    })
  }, [events, selectedTalentIds, selectedBrandIds, selectedEventTypes])

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

  // Filter handlers
  const toggleEventType = useCallback((eventType: CalendarEventType) => {
    setSelectedEventTypes((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(eventType)) {
        newSet.delete(eventType)
      } else {
        newSet.add(eventType)
      }
      return newSet
    })
  }, [])

  const toggleCategoryEventTypes = useCallback((category: keyof typeof EVENT_CATEGORIES) => {
    const categoryTypes = EVENT_CATEGORIES[category] as readonly CalendarEventType[]
    const allSelected = categoryTypes.every((type) => selectedEventTypes.has(type))

    setSelectedEventTypes((prev) => {
      const newSet = new Set(prev)
      categoryTypes.forEach((type) => {
        if (allSelected) {
          newSet.delete(type)
        } else {
          newSet.add(type)
        }
      })
      return newSet
    })
  }, [selectedEventTypes])

  const clearAllFilters = useCallback(() => {
    setSelectedTalentIds(new Set())
    setSelectedBrandIds(new Set())
    setSelectedEventTypes(new Set(Object.keys(EVENT_TYPE_LABELS) as CalendarEventType[]))
  }, [])

  // Calendar grid generation helpers
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

  const jumpToNextEvent = () => {
    if (!filteredEvents) return

    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    // Find the next event after the current month
    const nextEvent = filteredEvents
      .filter(event => parseISO(event.date) > currentMonthEnd)
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0]

    if (nextEvent) {
      const eventDate = parseISO(nextEvent.date)
      setCurrentMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1))
      setSelectedDate(eventDate)
    }
  }

  const jumpToPreviousEvent = () => {
    if (!filteredEvents) return

    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

    // Find the previous event before the current month
    const previousEvent = filteredEvents
      .filter(event => parseISO(event.date) < currentMonthStart)
      .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())[0]

    if (previousEvent) {
      const eventDate = parseISO(previousEvent.date)
      setCurrentMonth(new Date(eventDate.getFullYear(), eventDate.getMonth(), 1))
      setSelectedDate(eventDate)
    }
  }

  const hasNextEvent = () => {
    if (!filteredEvents) return false
    const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    return filteredEvents.some(event => parseISO(event.date) > currentMonthEnd)
  }

  const hasPreviousEvent = () => {
    if (!filteredEvents) return false
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    return filteredEvents.some(event => parseISO(event.date) < currentMonthStart)
  }

  // View mode handlers
  const handleViewModeToggle = (mode: ViewMode) => {
    setViewMode(mode)
    if (mode === 'detail') {
      setIsDetailOpen(true)
    } else {
      // In full-width mode, clicking the button again toggles the detail pane
      if (viewMode === 'fullWidth') {
        setIsDetailOpen(!isDetailOpen)
      } else {
        setIsDetailOpen(false)
      }
    }
  }

  // Handle day click in full-width mode
  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date)
    if (viewMode === 'fullWidth') {
      setIsDetailOpen(true)
    }
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
      <Card className="col-span-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Activity Calendar
              </CardTitle>
              <CardDescription>
                All activities for your clients, deals, and brands
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* Entity Filters - Moved Here */}
              <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Filter by:</span>

            {/* Talent Multi-Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Talents:</span>
              <div className="relative">
                <Select
                  value={selectedTalentIds.size === 0 ? 'all' : 'selected'}
                  onValueChange={() => {}}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue>
                      {selectedTalentIds.size === 0
                        ? 'All Talents'
                        : `${selectedTalentIds.size} selected`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      <div className="p-2 border-b space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Search talents..."
                            value={talentSearchQuery}
                            onChange={(e) => setTalentSearchQuery(e.target.value)}
                            className="pl-7 h-8 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setSelectedTalentIds(new Set())}
                        >
                          Clear All
                        </Button>
                      </div>
                      {filteredTalents.map((talent) => {
                        const isSelected = selectedTalentIds.has(talent.id)
                        return (
                          <SelectItem
                            key={talent.id}
                            value={talent.id}
                            onSelect={(e) => {
                              e.preventDefault()
                              setSelectedTalentIds((prev) => {
                                const newSet = new Set(prev)
                                if (isSelected) {
                                  newSet.delete(talent.id)
                                } else {
                                  newSet.add(talent.id)
                                }
                                return newSet
                              })
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center',
                                  isSelected
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground'
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span>{talent.Name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Brand Multi-Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Brands:</span>
              <div className="relative">
                <Select
                  value={selectedBrandIds.size === 0 ? 'all' : 'selected'}
                  onValueChange={() => {}}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue>
                      {selectedBrandIds.size === 0
                        ? 'All Brands'
                        : `${selectedBrandIds.size} selected`}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      <div className="p-2 border-b space-y-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Search brands..."
                            value={brandSearchQuery}
                            onChange={(e) => setBrandSearchQuery(e.target.value)}
                            className="pl-7 h-8 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => setSelectedBrandIds(new Set())}
                        >
                          Clear All
                        </Button>
                      </div>
                      {filteredBrands.map((brand) => {
                        const isSelected = selectedBrandIds.has(brand.id)
                        return (
                          <SelectItem
                            key={brand.id}
                            value={brand.id}
                            onSelect={(e) => {
                              e.preventDefault()
                              setSelectedBrandIds((prev) => {
                                const newSet = new Set(prev)
                                if (isSelected) {
                                  newSet.delete(brand.id)
                                } else {
                                  newSet.add(brand.id)
                                }
                                return newSet
                              })
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center',
                                  isSelected
                                    ? 'bg-primary border-primary'
                                    : 'border-muted-foreground'
                                )}
                              >
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span>{brand.name}</span>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>

              </div>

              {/* View Mode Picker */}
              <div className="flex items-center gap-1 border rounded-md p-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'detail' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeToggle('detail')}
                      className="h-8 px-3"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Detail View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'fullWidth' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleViewModeToggle('fullWidth')}
                      className="h-8 px-3"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Full-Width View</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Custom Split Indicator */}
          {viewMode === 'detail' && isCustomSplit && (
            <div className="flex items-center justify-end gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Custom layout detected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetDefaultSplit}
                className="h-7 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Set as Default
              </Button>
            </div>
          )}

          {/* Clear All Filters Button */}
          {(selectedTalentIds.size > 0 ||
            selectedBrandIds.size > 0 ||
            selectedEventTypes.size < Object.keys(EVENT_TYPE_LABELS).length) && (
            <div className="flex justify-end mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All Filters
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading calendar...</p>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'flex gap-2'
              )}
            >
              {/* Calendar */}
              <div
                style={{
                  width:
                    viewMode === 'detail' && isDetailOpen
                      ? `${splitRatio}%`
                      : viewMode === 'fullWidth' && !isDetailOpen
                      ? '100%'
                      : viewMode === 'fullWidth' && isDetailOpen
                      ? '60%'
                      : '100%',
                  transition: 'width 0.2s ease-in-out',
                }}
              >
                <div className="rounded-md border w-full p-4">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={jumpToNextEvent}
                        disabled={!hasNextEvent()}
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
                        onClick={() => dayInfo.date && handleDayClick(dayInfo.date)}
                        onMouseEnter={() => viewMode === 'fullWidth' && dayInfo.date && setHoveredDate(dayInfo.date)}
                        onMouseLeave={() => viewMode === 'fullWidth' && setHoveredDate(undefined)}
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
                                      {event.talentClient && (
                                        <div className="text-xs">
                                          <span className="font-medium">Client:</span> {event.talentClient.Name}
                                        </div>
                                      )}
                                      {event.brand && (
                                        <div className="text-xs">
                                          <span className="font-medium">Brand:</span> {event.brand.name}
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

              {/* Resizable Divider - Only in detail view */}
              {viewMode === 'detail' && isDetailOpen && (
                <div className="flex items-center self-stretch">
                  <ResizableDivider
                    onResize={setSplitRatio}
                    minLeftPercentage={40}
                    maxLeftPercentage={80}
                  />
                </div>
              )}

              {/* Events for Selected Date - Sidebar */}
              {isDetailOpen && (
                <div
                  className={cn(
                    'flex flex-col',
                    viewMode === 'fullWidth' &&
                      'fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 p-6'
                  )}
                  style={{
                    width:
                      viewMode === 'detail' && isDetailOpen
                        ? `${100 - splitRatio}%`
                        : undefined,
                    transition: 'width 0.2s ease-in-out',
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
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
                    {viewMode === 'fullWidth' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsDetailOpen(false)}
                        className="h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    )}
                  </div>

                  <div
                    className="space-y-2 overflow-y-auto pr-2"
                    style={{
                      maxHeight:
                        viewMode === 'fullWidth'
                          ? 'calc(100vh - 120px)'
                          : 'calc(5 * 5.8rem)',
                    }}
                  >
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
                          {event.talentClient && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Client: {event.talentClient.Name}
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
                ) : fallbackEvents ? (
                  <>
                    <div className="flex items-center justify-center text-center text-muted-foreground py-8 text-sm border-b">
                      No events on this date
                    </div>
                    <div className="pt-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {fallbackEvents.type === 'future' ? 'Upcoming events this month' : 'Recent events this month'}
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
                              {event.talentClient && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Client: {event.talentClient.Name}
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
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-16 text-center text-muted-foreground text-sm">
                      No events on this date
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Event Type Filters - Horizontal Scrollable by Category */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Event Types</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEventTypesExpanded(!isEventTypesExpanded)}
                className="h-7 text-xs"
              >
                {isEventTypesExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
            {isEventTypesExpanded && <div className="space-y-3">
              {(Object.entries(EVENT_CATEGORIES) as [keyof typeof EVENT_CATEGORIES, readonly CalendarEventType[]][]).map(([category, eventTypes]) => {
                // Use dynamic label for Deal/Slip
                const displayCategory = category === 'Deal/Slip' ? dealLabel : category

                return (
                  <div key={category} className="flex items-center gap-3">
                    {/* Category Label - Clickable */}
                    <button
                      onClick={() => toggleCategoryEventTypes(category)}
                      className="text-xs font-semibold text-foreground hover:text-primary transition-colors whitespace-nowrap min-w-[80px] text-left"
                    >
                      {displayCategory}
                    </button>

                    {/* Horizontal Scrollable Legend Items */}
                    <div className="flex-1">
                      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                        <div className="flex gap-3 pb-2">
                          {eventTypes.map((type) => {
                            const isSelected = selectedEventTypes.has(type)
                            return (
                              <button
                                key={type}
                                onClick={() => toggleEventType(type)}
                                className={cn(
                                  "flex items-center gap-2 px-2 py-1 rounded transition-all whitespace-nowrap flex-shrink-0",
                                  "hover:bg-muted",
                                  !isSelected && "opacity-50"
                                )}
                                style={{
                                  transform: !isSelected ? 'scale(0.95)' : 'scale(1)',
                                }}
                              >
                                <div
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: EVENT_TYPE_COLORS[type],
                                  }}
                                />
                                <span
                                  className={cn(
                                    "text-xs text-muted-foreground",
                                    !isSelected && "line-through"
                                  )}
                                >
                                  {EVENT_TYPE_LABELS[type]}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
