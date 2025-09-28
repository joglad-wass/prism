'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../../components/layout/app-layout'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { DealOverview } from '../../../components/deals/deal-overview'
import { DealTimeline } from '../../../components/deals/deal-timeline'
import { DealProducts } from '../../../components/deals/deal-products'
import { DealSchedules } from '../../../components/deals/deal-schedules'
import { DealNotes } from '../../../components/deals/deal-notes'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Briefcase,
  CalendarDays,
} from 'lucide-react'
import { useDeal } from '../../../hooks/useDeals'
import { Deal } from '../../../types'

interface DealDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const { id } = use(params)

  const { data: deal, isLoading, error } = useDeal(id)

  const getStageVariant = (stage: string) => {
    switch (stage) {
      case 'CLOSED_WON':
        return 'default'
      case 'CLOSED_LOST':
        return 'destructive'
      case 'NEGOTIATION':
        return 'secondary'
      case 'PROPOSAL':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleExternalLink = (type: 'salesforce' | 'workday') => {
    const dealId = type === 'salesforce' ? deal?.salesforceId : deal?.workdayProjectId
    if (dealId) {
      // In a real app, these would be proper external URLs
      console.log(`Opening ${type} with ID: ${dealId}`)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading deal details...</span>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading Deal</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Failed to load deal details'}
            </p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!deal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold">Deal Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2">
              The deal you're looking for doesn't exist.
            </p>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {deal.salesforceId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExternalLink('salesforce')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Salesforce
              </Button>
            )}
            {deal.workdayProjectId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExternalLink('workday')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Workday
              </Button>
            )}
          </div>
        </div>

        {/* Deal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Briefcase className="h-8 w-8" />
                {deal.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant={getStageVariant(deal.stage)}>
                  {deal.stage}
                </Badge>
                {deal.division && (
                  <span className="text-sm text-muted-foreground">
                    {deal.division}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-3">
                {deal.amount && (
                  <div className="text-lg font-semibold">
                    {formatCurrency(deal.amount)}
                  </div>
                )}
                {deal.closeDate && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    Close: {formatDate(deal.closeDate)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DealOverview deal={deal} />
          </TabsContent>

          <TabsContent value="timeline">
            <DealTimeline deal={deal} />
          </TabsContent>

          <TabsContent value="products">
            <DealProducts deal={deal} />
          </TabsContent>

          <TabsContent value="schedules">
            <DealSchedules deal={deal} />
          </TabsContent>

          <TabsContent value="notes">
            <DealNotes deal={deal} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}