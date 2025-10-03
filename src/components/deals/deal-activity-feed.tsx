'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Activity,
  Package,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  TrendingUp,
  User,
  Clock,
  Filter,
  ChevronDown,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Deal } from '../../types'
import { useActivityFeed } from '../../hooks/useActivities'
import { useLabels } from '../../hooks/useLabels'

interface DealActivityFeedProps {
  deal: Deal
}

export function DealActivityFeed({ deal }: DealActivityFeedProps) {
  const { labels } = useLabels()
  const [activityTypeFilter, setActivityTypeFilter] = useState<string | undefined>()
  const [limit, setLimit] = useState(50)

  const { data, isLoading, error } = useActivityFeed({
    dealId: deal.id,
    limit,
    activityType: activityTypeFilter,
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    })
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'PRODUCT_CREATED':
      case 'PRODUCT_UPDATED':
        return <Package className="h-4 w-4" />
      case 'SCHEDULE_CREATED':
      case 'SCHEDULE_UPDATED':
      case 'SCHEDULE_SENT_TO_WORKDAY':
        return <Calendar className="h-4 w-4" />
      case 'INVOICE_GENERATED':
        return <FileText className="h-4 w-4" />
      case 'PAYMENT_APPLIED':
        return <CreditCard className="h-4 w-4" />
      case 'NOTE_CREATED':
      case 'NOTE_UPDATED':
      case 'NOTE_DELETED':
        return <MessageSquare className="h-4 w-4" />
      case 'STAGE_CHANGED':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'PRODUCT_CREATED':
      case 'PRODUCT_UPDATED':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-950 dark:text-purple-400'
      case 'SCHEDULE_CREATED':
      case 'SCHEDULE_UPDATED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400'
      case 'SCHEDULE_SENT_TO_WORKDAY':
        return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400'
      case 'INVOICE_GENERATED':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-950 dark:text-orange-400'
      case 'PAYMENT_APPLIED':
        return 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400'
      case 'NOTE_CREATED':
      case 'NOTE_UPDATED':
        return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-400'
      case 'NOTE_DELETED':
        return 'text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400'
      case 'STAGE_CHANGED':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-950 dark:text-amber-400'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-950 dark:text-gray-400'
    }
  }

  const getActivityTypeLabel = (activityType: string) => {
    return activityType
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-5 w-5 animate-spin" />
              <span>Loading activity feed...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-red-600">
            <p>Error loading activity feed</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const activities = data?.data || []
  const hasMore = data?.meta?.hasMore || false

  return (
    <div className="space-y-4">
      {/* Header with filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Feed
              </CardTitle>
              <CardDescription>
                Latest actions and updates on this {labels.deal.toLowerCase()}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={activityTypeFilter || 'all'}
                onValueChange={(value) => setActivityTypeFilter(value === 'all' ? undefined : value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="STAGE_CHANGED">Stage Changes</SelectItem>
                  <SelectItem value="NOTE_CREATED">Notes</SelectItem>
                  <SelectItem value="SCHEDULE_CREATED">Schedules</SelectItem>
                  <SelectItem value="INVOICE_GENERATED">Invoices</SelectItem>
                  <SelectItem value="PAYMENT_APPLIED">Payments</SelectItem>
                  <SelectItem value="PRODUCT_CREATED">Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">No activity yet</h3>
              <p className="text-sm text-muted-foreground">
                Activity will appear here as changes are made to the {labels.deal.toLowerCase()}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

                {/* Activity items */}
                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-4">
                      {/* Activity icon */}
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${getActivityColor(
                          activity.activityType
                        )}`}
                      >
                        {getActivityIcon(activity.activityType)}
                      </div>

                      {/* Activity content */}
                      <div className="flex-1 min-w-0 pb-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{activity.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {getActivityTypeLabel(activity.activityType)}
                              </Badge>
                            </div>

                            {activity.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {activity.description}
                              </p>
                            )}

                            {/* Metadata */}
                            {activity.metadata && (
                              <div className="text-xs text-muted-foreground space-y-1 mt-2">
                                {activity.metadata.amount && (
                                  <div>
                                    Amount: $
                                    {new Intl.NumberFormat('en-US').format(activity.metadata.amount)}
                                  </div>
                                )}
                                {activity.metadata.fromStage && activity.metadata.toStage && (
                                  <div>
                                    {activity.metadata.fromStage} → {activity.metadata.toStage}
                                  </div>
                                )}
                                {activity.metadata.invoiceId && (
                                  <div>Invoice: {activity.metadata.invoiceId}</div>
                                )}
                              </div>
                            )}

                            {/* Actor and timestamp */}
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              {activity.actor && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{activity.actor.name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(activity.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLimit((prev) => prev + 50)}
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary stats */}
      {activities.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.meta?.total || 0}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activities[0] ? formatDate(activities[0].createdAt) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {activities[0]?.title || 'No activity'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contributors</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(activities.filter((a) => a.actor).map((a) => a.actor!.id)).size}
              </div>
              <p className="text-xs text-muted-foreground">Unique users</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
