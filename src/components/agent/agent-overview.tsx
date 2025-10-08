'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import {
  Building2,
  User,
  DollarSign,
  TrendingUp,
  Users,
  Briefcase
} from 'lucide-react'

import { Agent } from '../../types'
import { useLabels } from '../../hooks/useLabels'

interface AgentOverviewProps {
  agent: Agent & {
    metrics?: {
      clientCount: number
      activeClients: number
      dealCount: number
      activeDeals: number
      totalRevenue: number
      brandCount: number
    }
  }
}

export function AgentOverview({ agent }: AgentOverviewProps) {
  const { labels } = useLabels()

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate metrics from agent data if not provided
  const clientCount = agent.metrics?.clientCount ?? agent.clients?.length ?? 0
  const dealCount = agent.metrics?.dealCount ?? agent.deals?.length ?? 0
  const brandCount = agent.metrics?.brandCount ?? agent.ownedBrands?.length ?? 0

  const totalRevenue = agent.metrics?.totalRevenue ?? agent.deals?.reduce((sum, deal) => {
    return sum + (deal.Amount ? Number(deal.Amount) : 0)
  }, 0) ?? 0

  const activeDeals = agent.metrics?.activeDeals ?? agent.deals?.filter(deal => {
    if (deal.Status__c === 'ACTIVE') return true
    if (deal.Status__c === null && (deal.Amount || deal.Contract_Amount__c)) return true
    return false
  }).length ?? 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {agent.email && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email</span>
              <a
                href={`mailto:${agent.email}`}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {agent.email}
              </a>
            </div>
          )}

          {agent.phone && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Phone</span>
              <a
                href={`tel:${agent.phone}`}
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                {agent.phone}
              </a>
            </div>
          )}

          {agent.title && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Title</span>
              <span className="text-sm text-muted-foreground">{agent.title}</span>
            </div>
          )}

          {agent.company && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Company</span>
              </div>
              <span className="text-sm text-muted-foreground">{agent.company}</span>
            </div>
          )}

          {agent.division && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Division</span>
              <span className="text-sm text-muted-foreground">{agent.division}</span>
            </div>
          )}

          {agent.costCenter && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Cost Center</span>
              <span className="text-sm text-muted-foreground">{agent.costCenter}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Clients</span>
            </div>
            <span className="text-2xl font-bold">{clientCount}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total {labels.deals}</span>
            </div>
            <span className="text-2xl font-bold">{dealCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Active {labels.deals}</span>
            <span className="text-xl font-semibold text-green-600 dark:text-green-400">
              {activeDeals}
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <span className="text-lg font-bold">{formatCurrency(totalRevenue)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Owned Brands</span>
            </div>
            <span className="text-lg font-bold">{brandCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
