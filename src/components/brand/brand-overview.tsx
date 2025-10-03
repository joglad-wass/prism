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
  Building
} from 'lucide-react'

import { Brand } from '../../types'
import { useLabels } from '../../hooks/useLabels'

interface BrandOverviewProps {
  brand: Brand & {
    metrics?: {
      dealCount: number
      activeDeals: number
      completedDeals: number
      totalContracted: number
      projectedRevenue: number
    }
    popularClients?: Array<{
      client: {
        id: string
        Name: string
        Client_Category__c?: string
      }
      dealCount: number
      totalRevenue: number
    }>
  }
}

export function BrandOverview({ brand }: BrandOverviewProps) {
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
        return 'secondary'
      case 'PROSPECT':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getTypeVariant = (type: string) => {
    return type === 'AGENCY' ? 'secondary' : 'default'
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {brand.legalName && brand.legalName !== brand.name && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Legal Name</span>
              <span className="text-sm text-muted-foreground">{brand.legalName}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Currency</span>
            </div>
            <span className="text-sm text-muted-foreground">{brand.currency}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Owner</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {brand.owner?.name || 'Unassigned'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Business Metrics */}
      {brand.metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Business Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total {labels.deals}</span>
              <span className="text-2xl font-bold">{brand.metrics.dealCount}</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active {labels.deals}</span>
              <span className="text-xl font-semibold text-green-600 dark:text-green-400">
                {brand.metrics.activeDeals}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Completed {labels.deals}</span>
              <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                {brand.metrics.completedDeals}
              </span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Contracted</span>
              </div>
              <span className="text-lg font-bold">{formatCurrency(brand.metrics.totalContracted)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Projected Revenue</span>
              </div>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(brand.metrics.projectedRevenue)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* External IDs */}
      {(brand.salesforceId || brand.workdayId) && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              External System IDs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {brand.salesforceId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salesforce ID</span>
                <span className="text-sm font-mono text-muted-foreground">{brand.salesforceId}</span>
              </div>
            )}
            {brand.workdayId && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Workday ID</span>
                <span className="text-sm font-mono text-muted-foreground">{brand.workdayId}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
