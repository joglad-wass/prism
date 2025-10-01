'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../../components/layout/app-layout'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { DealOverview } from '../../../components/deals/deal-overview'
import { DealTimeline } from '../../../components/deals/deal-timeline'
import { DealProducts } from '../../../components/deals/deal-products'
import { DealSchedules } from '../../../components/deals/deal-schedules'
import { DealNotes } from '../../../components/deals/deal-notes'
import { DealPayments } from '../../../components/deals/deal-payments'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Briefcase,
  CalendarDays,
  Building,
  User,
  DollarSign,
  Target,
  Calculator,
  Percent,
  ArrowUpRight,
} from 'lucide-react'
import { useDeal } from '../../../hooks/useDeals'
import { useSchedulesByDeal } from '../../../hooks/useSchedules'
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
  const { data: schedulesResponse } = useSchedulesByDeal(id)

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

  const calculateCommission = () => {
    const schedules = schedulesResponse?.data || []
    const totalWassermanAmount = schedules.reduce((sum, schedule) => {
      const wassermanAmount = typeof schedule.Wasserman_Invoice_Line_Amount__c === 'string'
        ? parseFloat(schedule.Wasserman_Invoice_Line_Amount__c)
        : (schedule.Wasserman_Invoice_Line_Amount__c || 0)
      return sum + (isNaN(wassermanAmount) ? 0 : wassermanAmount)
    }, 0)
    return totalWassermanAmount
  }

  const calculateRecognizedCommissionFee = () => {
    if (!deal || !deal.Amount) return 0
    const commission = calculateCommission()
    return deal.Amount > 0 ? (commission / deal.Amount) * 100 : 0
  }

  const handleExternalLink = (type: 'salesforce' | 'workday') => {
    const dealId = type === 'salesforce' ? deal?.salesforceId : deal?.workdayProjectId
    if (dealId) {
      // In a real app, these would be proper external URLs
      if (type === 'salesforce') {
        window.open(`https://teamwass--uat072825.sandbox.lightning.force.com/lightning/r/Opportunity/${deal?.OpportunityId__c}/view`, '_blank')
      } else {
        window.open(`https://wd5.myworkday.com/teamwass/d/inst/1$1732/${deal?.Workday_Project_WID__c}.htmld`, '_blank')
      }
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {deal.Name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {/* <Badge variant={getStageVariant(deal.StageName)}>
              {deal.StageName}
            </Badge> */}
            {deal.division && (
              <span className="text-sm text-muted-foreground">
                {deal.division}
              </span>
            )}
          </div>
        </div>

        {/* Deal Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Deal Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Deal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="outline">{deal.Status__c}</Badge>
                </div> */}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stage</span>
                  <Badge variant="secondary">{deal.StageName}</Badge>
                </div>

                {deal.division && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Division</span>
                    <span className="text-sm text-muted-foreground">{deal.division}</span>
                  </div>
                )}

                {deal.company && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Company</span>
                    <span className="text-sm text-muted-foreground">{deal.company}</span>
                  </div>
                )}

                {deal.Account_Industry__c && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Industry</span>
                    <span className="text-sm text-muted-foreground">{deal.Account_Industry__c}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Brand/Account</span>
                  {deal.brand?.id ? (
                    <button
                      onClick={() => router.push(`/brands/${deal.brand?.id}`)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {deal.brand?.name || deal.Account_Name__c || 'Unknown'}
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {deal.Account_Name__c || 'Unknown'}
                    </span>
                  )}
                </div>

                {deal.clients && deal.clients.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Talent Client</span>
                    {deal.clients[0].talentClient?.id ? (
                      <button
                        onClick={() => router.push(`/talents/${deal.clients?.[0].talentClient?.id}`)}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {deal.clients[0].talentClient?.Name || 'Unknown'}
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {deal.clients[0].talentClient?.Name || 'Unknown'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Start Date</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(deal.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Close Date</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(deal.CloseDate)}
                  </span>
                </div>

                {deal.Stage_Last_Updated__c && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stage Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(deal.Stage_Last_Updated__c)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Owner</span>
                  <span className="text-sm text-muted-foreground">
                    {deal.owner?.name || deal.Licence_Holder_Name__c || 'Unassigned'}
                  </span>
                </div>

                {deal.owner?.email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Owner Email</span>
                    <span className="text-sm text-muted-foreground">{deal.owner.email}</span>
                  </div>
                )}

                {deal.Owner_Workday_Cost_Center__c && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cost Center</span>
                    <span className="text-sm text-muted-foreground">
                      {deal.Owner_Workday_Cost_Center__c}
                    </span>
                  </div>
                )}

                {deal.CompanyReference__c && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Company Reference</span>
                    <span className="text-sm text-muted-foreground">
                      {deal.CompanyReference__c}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </CardTitle>
            <CardDescription>
              Deal amounts, percentages, and commission calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Deal Amount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Deal Amount</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(deal.Amount)}
                </div>
                {deal.splitPercent && (
                  <div className="text-xs text-muted-foreground">
                    Split: {deal.splitPercent}%
                  </div>
                )}
              </div>

              {/* Contract Amount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contract Amount</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(deal.Contract_Amount__c)}
                </div>
              </div>

              {/* Commission */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Commission</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateCommission())}
                </div>
                {deal.dealPercent && (
                  <div className="text-xs text-muted-foreground">
                    Rate: {deal.dealPercent}%
                  </div>
                )}
              </div>
            </div>

            {/* Deal Percentages */}
            {(deal.dealPercent || deal.splitPercent || deal.Talent_Marketing_Fee_Percentage__c) && (
              <>
                <Separator className="my-6" />
                <div className="grid gap-4 md:grid-cols-2">
                  {deal.dealPercent && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Deal Percentage</span>
                      </div>
                      <span className="text-sm font-semibold">{deal.dealPercent}%</span>
                    </div>
                  )}

                  {deal.splitPercent && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Split Percentage</span>
                      </div>
                      <span className="text-sm font-semibold">{deal.splitPercent}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {deal.Talent_Marketing_Fee_Percentage__c && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Default Commission Fee</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {deal.Talent_Marketing_Fee_Percentage__c}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recognized Commission Fee</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {calculateRecognizedCommissionFee().toFixed(2)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
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

          <TabsContent value="payments">
            <DealPayments deal={deal} />
          </TabsContent>

          <TabsContent value="notes">
            <DealNotes deal={deal} />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}