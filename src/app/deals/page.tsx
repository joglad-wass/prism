'use client'

import { useState } from 'react'
import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useDeals } from '../../hooks/useDeals'
import { DealFilters } from '../../types'
import { Search, Plus, Briefcase, DollarSign, TrendingUp, Calendar, Target } from 'lucide-react'
import { DealQuickView, type DealQuickViewData } from '../../components/deals/deal-quick-view'
import { useRouter } from 'next/navigation'

export default function DealsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<DealFilters>({
    limit: 50,
    page: 1,
  })
  const [selectedDeal, setSelectedDeal] = useState<DealQuickViewData | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  const { data: dealsResponse, isLoading, error } = useDeals(filters)

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value || undefined, page: 1 })
  }

  const handleDealClick = (deal: any) => {
    setSelectedDeal(deal)
    setIsQuickViewOpen(true)
  }

  const handleStageChange = (value: string) => {
    setFilters({
      ...filters,
      stage: value === 'all' ? undefined : value as DealFilters['stage'],
      page: 1
    })
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }


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

  // Pipeline stats
  const pipelineStats = dealsResponse?.data.reduce((acc, deal) => {
    acc.total += deal.amount || 0
    acc.count++
    if (deal.stage === 'CLOSED_WON') acc.won += deal.amount || 0
    if (deal.stage === 'NEGOTIATION') acc.negotiating += deal.amount || 0
    if (deal.stage === 'PROPOSAL') acc.proposal += deal.amount || 0
    return acc
  }, { total: 0, count: 0, won: 0, negotiating: 0, proposal: 0 }) ||
  { total: 0, count: 0, won: 0, negotiating: 0, proposal: 0 }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading Deals</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Could not connect to the API. Make sure the backend server is running on http://localhost:3001
            </p>
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
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
            <p className="text-muted-foreground">
              Track your deal pipeline and manage client contracts
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dealsResponse?.meta.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(pipelineStats.total)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(pipelineStats.won)}
              </div>
              <p className="text-xs text-muted-foreground">
                Closed won
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negotiating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(pipelineStats.negotiating)}
              </div>
              <p className="text-xs text-muted-foreground">
                In negotiation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proposals</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(pipelineStats.proposal)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending proposals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter and search through your deal pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search deals..."
                    className="pl-8"
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              {/* <Select onValueChange={handleStatusChange} defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Stage Filter */}
              <Select onValueChange={handleStageChange} defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stages</SelectItem>
                  <SelectItem value="PROSPECTING">Prospecting</SelectItem>
                  <SelectItem value="QUALIFICATION">Qualification</SelectItem>
                  <SelectItem value="PROPOSAL">Proposal</SelectItem>
                  <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                  <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                  <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Deals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `Showing ${dealsResponse?.data.length || 0} of ${dealsResponse?.meta.total || 0} deals`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal Name</TableHead>
                    <TableHead>Brand</TableHead>
                    {/* <TableHead>Status</TableHead> */}
                    <TableHead>Stage</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Contract Amount</TableHead>
                    {/* <TableHead>Products</TableHead> */}
                    <TableHead>Owner</TableHead>
                    <TableHead>Close Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Loading deals...
                      </TableCell>
                    </TableRow>
                  ) : dealsResponse?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No deals found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    dealsResponse?.data.map((deal) => (
                      <TableRow
                        key={deal.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleDealClick(deal)}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{deal.name}</div>
                            {deal.division && (
                              <div className="text-sm text-muted-foreground">
                                {deal.division}
                              </div>
                            )}
                            {deal.Account_Industry__c && (
                              <div className="text-xs text-muted-foreground">
                                {deal.Account_Industry__c}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{deal.brand?.name || deal.Account_Name__c || 'Unknown Brand'}</div>
                            {deal.Owner_Workday_Cost_Center__c && (
                              <div className="text-xs text-muted-foreground">
                                {deal.Owner_Workday_Cost_Center__c}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        {/* <TableCell>
                          <Badge variant={getStatusVariant(deal.status)}>
                            {deal.status}
                          </Badge>
                        </TableCell> */}
                        <TableCell>
                          <Badge variant={getStageVariant(deal.stage)}>
                            {deal.stage}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(deal.amount)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(deal.Contract_Amount__c)}
                          {deal.Talent_Marketing_Fee_Percentage__c && (
                            <div className="text-xs text-muted-foreground">
                              {deal.Talent_Marketing_Fee_Percentage__c}% fee
                            </div>
                          )}
                        </TableCell>
                        {/* <TableCell>
                          <div className="text-sm">
                            {deal.products?.length || 0} products
                            <div className="text-xs text-muted-foreground">
                              {deal._count?.schedules || 0} schedules
                            </div>
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <div>
                            <div>{deal.owner?.name || deal.Licence_Holder_Name__c || 'Unassigned'}</div>
                            {deal.owner?.email && (
                              <div className="text-xs text-muted-foreground">
                                {deal.owner.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(deal.closeDate)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination info */}
        {dealsResponse && dealsResponse.meta.total > 0 && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>
              Page {dealsResponse.meta.page} of {dealsResponse.meta.totalPages}
            </span>
          </div>
        )}

        {/* Deal Quick View Modal */}
        <DealQuickView
          deal={selectedDeal}
          open={isQuickViewOpen}
          onOpenChange={setIsQuickViewOpen}
          onViewDetails={(dealId) => {
            router.push(`/deals/${dealId}`)
          }}
        />
      </div>
    </AppLayout>
  )
}