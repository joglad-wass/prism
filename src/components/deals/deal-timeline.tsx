'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Calendar,
  Timer,
  MessageCircle,
} from 'lucide-react'
import { Deal } from '../../types'

interface DealTimelineProps {
  deal: Deal
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

export function DealTimeline({ deal }: DealTimelineProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateDaysInStage = () => {
    if (!deal.Stage_Last_Updated__c) return null
    const stageDate = new Date(deal.Stage_Last_Updated__c)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - stageDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
      key: 'PROSPECTING',
      name: 'Prospecting',
      description: 'Initial lead identification and qualification',
      order: 1,
    },
    {
      key: 'QUALIFICATION',
      name: 'Qualification',
      description: 'Assessing fit and opportunity potential',
      order: 2,
    },
    {
      key: 'PROPOSAL',
      name: 'Proposal',
      description: 'Preparing and presenting proposal',
      order: 3,
    },
    {
      key: 'NEGOTIATION',
      name: 'Negotiation',
      description: 'Contract terms and pricing negotiation',
      order: 4,
    },
    {
      key: 'CLOSED_WON',
      name: 'Closed Won',
      description: 'Deal successfully closed',
      order: 5,
    },
    {
      key: 'CLOSED_LOST',
      name: 'Closed Lost',
      description: 'Deal lost or cancelled',
      order: 5,
    },
  ]

  // Find current stage order
  const currentStageOrder = allStages.find(s => s.key === deal.stage)?.order || 0
  const isClosedWon = deal.stage === 'CLOSED_WON'
  const isClosedLost = deal.stage === 'CLOSED_LOST'
  const daysInCurrentStage = calculateDaysInStage()

  // Create timeline with stage information
  const timeline: StageInfo[] = allStages
    .filter(stage => {
      // Show all stages up to current, plus closed states
      if (stage.key === 'CLOSED_WON' || stage.key === 'CLOSED_LOST') {
        return stage.key === deal.stage
      }
      return stage.order <= Math.max(currentStageOrder, 4)
    })
    .map(stage => ({
      ...stage,
      isCurrent: stage.order === currentStageOrder,
      isCompleted: stage.order < currentStageOrder || (isClosedWon && stage.key !== 'CLOSED_LOST'),
      date: stage.key === deal.stage ? deal.Stage_Last_Updated__c : undefined,
      daysInStage: stage.key === deal.stage ? daysInCurrentStage : undefined,
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
                {deal.stage}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {allStages.find(s => s.key === deal.stage)?.description || 'In progress'}
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
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Deal Timeline
          </CardTitle>
          <CardDescription>
            Track the progression through deal stages
          </CardDescription>
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

      {/* Stage Actions */}
      {!isClosedWon && !isClosedLost && (
        <Card>
          <CardHeader>
            <CardTitle>Stage Actions</CardTitle>
            <CardDescription>
              Advance the deal to the next stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Ready to advance?</div>
                <div className="text-sm text-muted-foreground">
                  Move this deal to the next stage in the pipeline
                </div>
              </div>

              <Button className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Advance Stage
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Key Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Created</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(deal.createdAt)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Last Updated</div>
              <div className="text-sm text-muted-foreground">
                {formatDate(deal.updatedAt)}
              </div>
            </div>

            {deal.startDate && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Start Date</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(deal.startDate)}
                </div>
              </div>
            )}

            {deal.closeDate && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Expected Close</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(deal.closeDate)}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}