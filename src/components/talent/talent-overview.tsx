'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useLabels } from '../../hooks/useLabels'
import {
  User,
  Building,
  Trophy,
  DollarSign,
  ExternalLink,
  MapPin
} from 'lucide-react'

import { TalentDetail } from '../../types/talent'

interface TalentOverviewProps {
  talent: TalentDetail
}

export function TalentOverview({ talent }: TalentOverviewProps) {
  const { labels } = useLabels()

  // Helper functions for multi-agent support
  const getPrimaryAgent = () => {
    return talent.agents?.find(ta => ta.isPrimary)?.agent || talent.agents?.[0]?.agent || null
  }

  const formatAgentsDisplay = () => {
    if (!talent.agents || talent.agents.length === 0) {
      return `No ${labels.agent.toLowerCase()} assigned`
    }

    if (talent.agents.length === 1) {
      return talent.agents[0].agent.name
    }

    const primaryAgent = talent.agents.find(ta => ta.isPrimary)?.agent
    const otherAgents = talent.agents.filter(ta => !ta.isPrimary)

    if (primaryAgent && otherAgents.length > 0) {
      return `${primaryAgent.name} +${otherAgents.length} other${otherAgents.length > 1 ? 's' : ''}`
    }

    return talent.agents.map(ta => ta.agent.name).join(', ')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusVariant = (status: string) => {
    const lowercaseStatus = status?.toLowerCase()
    if (lowercaseStatus?.includes('active') || lowercaseStatus?.includes('current')) {
      return 'default'
    }
    if (lowercaseStatus?.includes('retired') || lowercaseStatus?.includes('ended')) {
      return 'outline'
    }
    return 'secondary'
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Name</span>
            <span className="font-semibold">{talent.name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={getStatusVariant(talent.status)}>
              {talent.status}
            </Badge>
          </div>

          {talent.location && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{talent.location}</span>
              </div>
            </div>
          )}

          {talent.category && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Category</span>
              <div className="flex gap-1">
                <Badge variant="outline">{talent.category}</Badge>
                {talent.isNil && <Badge variant="secondary">NIL</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Professional Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{talent.agents?.length > 1 ? labels.agents : labels.agent}</span>
            <span className="text-sm">{formatAgentsDisplay()}</span>
          </div>

          {(talent.Cost_Center__c || talent.costCenter) && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cost Center</span>
              <span className="text-sm">{talent.Cost_Center__c || talent.costCenter}</span>
            </div>
          )}

          {(talent.Sport__c || talent.CSM_Sport__c || talent.sport) && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sport</span>
              <div className="flex items-center gap-1">
                <span className="text-sm">{talent.Sport__c || talent.CSM_Sport__c || talent.sport}</span>
              </div>
            </div>
          )}

          {talent.Sub_Sport__c && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sub Sport</span>
              <span className="text-sm">{talent.Sub_Sport__c}</span>
            </div>
          )}

          {(talent.Client_Category__c || talent.category) && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Category</span>
              <div className="flex items-center gap-1">
                <span className="text-sm">{talent.Client_Category__c || talent.category}</span>
              </div>
            </div>
          )}

          {(talent.Team__c || talent.team) && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Team</span>
              <span className="text-sm">{talent.Team__c || talent.team}</span>
            </div>
          )}

          {(talent.Agency__c || talent.Agency__pc) && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Agency</span>
              <span className="text-sm">{talent.Agency__c || talent.Agency__pc}</span>
            </div>
          )}

          {talent.Account_Type__c && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Account Type</span>
              <Badge variant="outline">{talent.Account_Type__c}</Badge>
            </div>
          )}

          {talent.Exclusive__c && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Exclusive</span>
              <Badge variant="default">Exclusive</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Deal Count</span>
            <span className="text-xl font-bold">{talent.dealCount}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Revenue</span>
            <span className="text-lg font-semibold text-green-600">
              {formatCurrency(talent.totalRevenue)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wass Revenue</span>
            <span className="text-lg font-semibold text-blue-600">
              {formatCurrency(talent.wassRevenue || 0)}
            </span>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Commission Rate</div>
            <div className="text-sm font-medium">
              {(talent.Marketing_Fee_Percentage__c || talent.marketingFeePercentage) ? `${talent.Marketing_Fee_Percentage__c || talent.marketingFeePercentage}%` : 'Not set'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            External Records
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {talent.salesforceId && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Salesforce</span>
              <Button variant="outline" size="sm" className="h-8">
                <ExternalLink className="mr-2 h-3 w-3" />
                View Record
              </Button>
            </div>
          )}

          {talent.workdayId && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Workday</span>
              <Button variant="outline" size="sm" className="h-8">
                <ExternalLink className="mr-2 h-3 w-3" />
                View Record
              </Button>
            </div>
          )}

          {!talent.salesforceId && !talent.workdayId && (
            <div className="text-center py-4 text-muted-foreground">
              <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No external records linked</p>
            </div>
          )}
        </CardContent>
      </Card> */}
    </div>
  )
}