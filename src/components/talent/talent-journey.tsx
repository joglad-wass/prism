'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  Calendar,
  PenTool,
  Handshake,
  DollarSign,
  Clock,
  CheckCircle,
} from 'lucide-react'

import { TalentDetail } from '../../types/talent'

interface TalentJourneyProps {
  talent: TalentDetail
}

export function TalentJourney({ talent }: TalentJourneyProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTimelineEvents = () => {
    const events = []

    if (talent.firstSignedDate) {
      events.push({
        date: talent.firstSignedDate,
        title: 'First Signed',
        description: 'Initial contract signed with Wasserman',
        icon: PenTool,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      })
    }

    if (talent.firstDealDate) {
      events.push({
        date: talent.firstDealDate,
        title: 'First Deal',
        description: 'First deal completed successfully',
        icon: Handshake,
        color: 'text-green-500',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
      })
    }

    if (talent.lastDealDate) {
      events.push({
        date: talent.lastDealDate,
        title: 'Most Recent Deal',
        description: 'Latest deal activity',
        icon: DollarSign,
        color: 'text-purple-500',
        bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      })
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const calculateDuration = (startDate?: string, endDate?: string) => {
    if (!startDate) return null
    const start = new Date(startDate)
    const end = endDate ? new Date(endDate) : new Date() // Use today if no end date
    const years = end.getFullYear() - start.getFullYear()
    const months = end.getMonth() - start.getMonth()

    const totalMonths = years * 12 + months
    const yearsDisplay = Math.floor(totalMonths / 12)
    const monthsDisplay = totalMonths % 12

    if (yearsDisplay > 0 && monthsDisplay > 0) {
      return `${yearsDisplay} year${yearsDisplay > 1 ? 's' : ''}, ${monthsDisplay} month${monthsDisplay > 1 ? 's' : ''}`
    } else if (yearsDisplay > 0) {
      return `${yearsDisplay} year${yearsDisplay > 1 ? 's' : ''}`
    } else {
      return `${monthsDisplay} month${monthsDisplay > 1 ? 's' : ''}`
    }
  }

  const getLatestActivity = () => {
    if (!talent.deals || talent.deals.length === 0) return null

    // Find the most recent deal activity (could be deal creation, update, or schedule)
    let latestDate = null

    talent.deals.forEach(dealClient => {
      const deal = dealClient.deal

      // Check deal dates
      if (deal.startDate && (!latestDate || new Date(deal.startDate) > new Date(latestDate))) {
        latestDate = deal.startDate
      }
      if (deal.closeDate && (!latestDate || new Date(deal.closeDate) > new Date(latestDate))) {
        latestDate = deal.closeDate
      }

      // Check schedule dates
      deal.schedules?.forEach(schedule => {
        if (schedule.scheduleDate && (!latestDate || new Date(schedule.scheduleDate) > new Date(latestDate))) {
          latestDate = schedule.scheduleDate
        }
      })
    })

    return latestDate
  }

  const getFirstWonDeal = () => {
    if (!talent.deals || talent.deals.length === 0) return null

    // Find the first deal with status indicating it was won/completed
    const wonDeals = talent.deals
      .filter(dealClient => {
        const status = dealClient.deal.Status__c?.toLowerCase()
        return status === 'completed' || status === 'active' || status === 'closed_won'
      })
      .sort((a, b) => {
        const dateA = new Date(a.deal.startDate || a.deal.closeDate || '').getTime()
        const dateB = new Date(b.deal.startDate || b.deal.closeDate || '').getTime()
        return dateA - dateB
      })

    return wonDeals.length > 0 ? (wonDeals[0].deal.startDate || wonDeals[0].deal.closeDate) : null
  }

  const timelineEvents = getTimelineEvents()
  const relationshipDuration = calculateDuration(talent.firstSignedDate) // Calculate to today
  const latestActivity = getLatestActivity()
  const firstWonDeal = getFirstWonDeal()

  return (
    <div className="grid gap-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PenTool className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">First Signed</span>
            </div>
            <div className="text-lg font-semibold">
              {formatDate(talent.firstSignedDate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">First Deal</span>
            </div>
            <div className="text-lg font-semibold">
              {formatDate(talent.firstDealDate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Relationship Duration</span>
            </div>
            <div className="text-lg font-semibold">
              {relationshipDuration || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Career Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineEvents.length > 0 ? (
            <div className="space-y-6">
              {timelineEvents.map((event, index) => {
                const Icon = event.icon
                const isLast = index === timelineEvents.length - 1

                return (
                  <div key={`${event.date}-${event.title}`} className="relative">
                    {/* Timeline line */}
                    {!isLast && (
                      <div className="absolute left-6 top-12 w-0.5 h-6 bg-border" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${event.bgColor}`}>
                        <Icon className={`h-5 w-5 ${event.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base">{event.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(event.date)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No timeline events available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Key Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full" />
                <span className="font-medium">Contract Signing</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {talent.firstSignedDate ? formatDate(talent.firstSignedDate) : 'Not recorded'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="font-medium">First Revenue</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {firstWonDeal ? formatDate(firstWonDeal) : 'Not recorded'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-purple-500 rounded-full" />
                <span className="font-medium">Latest Activity</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {latestActivity ? formatDate(latestActivity) : 'Not recorded'}
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 bg-orange-500 rounded-full" />
                <span className="font-medium">Relationship Length</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {relationshipDuration || 'Not available'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}