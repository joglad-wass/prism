'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
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
import { useFilter } from '../../contexts/filter-context'
import { DealListPanel } from '../../components/deals/deal-list-panel'
import { DealDetailsPanel } from '../../components/deals/deal-details-panel'
import { DealTableView } from '../../components/deals/deal-table-view'
import { ViewToggle } from '../../components/talent/view-toggle'
import { Search, Plus, Briefcase, DollarSign, TrendingUp, Calendar, Target, Loader2 } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'
import { useUser } from '../../contexts/user-context'
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useAgentStats } from '../../hooks/useAgentStats'

export default function DealsPage() {
  const router = useRouter()
  const { labels } = useLabels()
  const { user } = useUser()
  const { filterSelection } = useFilter()
  const [activeTab, setActiveTab] = useState<'my-deals' | 'all-deals'>(
    user?.userType === 'AGENT' ? 'my-deals' : 'all-deals'
  )
  const [filters, setFilters] = useState<DealFilters>({
    limit: 50,
    page: 1,
  })
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null)

  // Initialize view from localStorage
  const [view, setView] = useState<'modular' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('deal-view-preference')
      return (savedView === 'table' ? 'table' : 'modular') as 'modular' | 'table'
    }
    return 'modular'
  })

  const [panelTopPosition, setPanelTopPosition] = useState<number>(0)
  const detailsPanelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dealListRef = useRef<HTMLDivElement>(null)

  // Save view preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('deal-view-preference', view)
  }, [view])

  // Get agent stats to find the agent ID for the current user
  const { data: agentStats } = useAgentStats()
  const [agentId, setAgentId] = useState<string | null>(null)

  const { data: dealsResponse, isLoading, error } = useDeals(filters)

  // Get agent ID from backend when agent stats are loaded
  useEffect(() => {
    const fetchAgentId = async () => {
      if (!user?.email) return

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }

        if (user.id) {
          headers['x-user-id'] = user.id
        }

        const response = await fetch(`${API_BASE_URL}/api/agents?search=${encodeURIComponent(user.email)}&limit=1`, { headers })
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          setAgentId(data.data[0].id)
        }
      } catch (error) {
        console.error('Failed to fetch agent ID:', error)
      }
    }

    if (user?.userType === 'AGENT') {
      fetchAgentId()
    }
  }, [user])

  // Update filters when filter selection changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      costCenter: filterSelection.type === 'individual' ? filterSelection.value || undefined : undefined,
      costCenterGroup: filterSelection.type === 'group' ? filterSelection.value || undefined : undefined,
      page: 1
    }))
  }, [filterSelection])

  // Update filters when tab changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ownerId: activeTab === 'my-deals' && agentId ? agentId : undefined,
      page: 1
    }))
  }, [activeTab, agentId])

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value || undefined, page: 1 })
  }

  const handleDealClick = (dealId: string) => {
    // Calculate where to position the detail panel based on current scroll
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight

      // Position the panel to align with the current viewport center
      const idealTop = scrollTop + (viewportHeight / 2) - containerRect.top - 200
      setPanelTopPosition(Math.max(0, idealTop))
    }

    setSelectedDealId(dealId)
  }

  // Handle click outside to close detail panel (but allow clicking other deal cards)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedDealId &&
        detailsPanelRef.current &&
        dealListRef.current &&
        !detailsPanelRef.current.contains(event.target as Node) &&
        !dealListRef.current.contains(event.target as Node)
      ) {
        setSelectedDealId(null)
      }
    }

    if (selectedDealId) {
      // Add a small delay to avoid closing immediately after opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [selectedDealId])

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

  const formatCompactCurrency = (amount?: number) => {
    if (!amount) return 'N/A'

    const absAmount = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''

    if (absAmount >= 1_000_000_000) {
      return `${sign}$${(absAmount / 1_000_000_000).toFixed(1)}B`
    } else if (absAmount >= 1_000_000) {
      return `${sign}$${(absAmount / 1_000_000).toFixed(1)}M`
    } else if (absAmount >= 1_000) {
      return `${sign}$${(absAmount / 1_000).toFixed(1)}K`
    } else {
      return `${sign}$${absAmount.toFixed(2)}`
    }
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
    acc.total += deal.Amount || 0
    acc.count++
    if (deal.StageName === 'CLOSED_WON') acc.won += deal.Amount || 0
    if (deal.StageName === 'NEGOTIATION') acc.negotiating += deal.Amount || 0
    if (deal.StageName === 'PROPOSAL') acc.proposal += deal.Amount || 0
    return acc
  }, { total: 0, count: 0, won: 0, negotiating: 0, proposal: 0 }) ||
  { total: 0, count: 0, won: 0, negotiating: 0, proposal: 0 }

  // Get selected deal from the deals array
  const selectedDeal = dealsResponse?.data.find(d => d.id === selectedDealId) || null

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading {labels.deals}</h2>
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
            <h1 className="text-2xl font-bold tracking-tight">{labels.deals}</h1>
            <p className="text-muted-foreground">
              Track your {labels.deal.toLowerCase()} pipeline and manage client contracts
            </p>
          </div>
          <Button onClick={() => router.push('/deals/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New {labels.deal}
          </Button>
        </div>

        {/* Tabs - For Agents Only */}
        {user?.userType === 'AGENT' && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'my-deals' | 'all-deals')}>
            <TabsList>
              <TabsTrigger value="my-deals">My {labels.deals}</TabsTrigger>
              <TabsTrigger value="all-deals">All {labels.deals}</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Pipeline Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {activeTab === 'my-deals' ? `My Total ${labels.deals}` : `Total ${labels.deals}`}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dealsResponse?.meta.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {activeTab === 'my-deals' ? `My ${labels.deals.toLowerCase()}` : `All ${labels.deals.toLowerCase()}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {activeTab === 'my-deals' ? 'My Pipeline Value' : 'Pipeline Value'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCompactCurrency(pipelineStats.total)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {activeTab === 'my-deals' ? `My Won ${labels.deals}` : `Won ${labels.deals}`}
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                {activeTab === 'my-deals' ? 'My Negotiating' : 'Negotiating'}
              </CardTitle>
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
              <CardTitle className="text-sm font-medium">
                {activeTab === 'my-deals' ? 'My Proposals' : 'Proposals'}
              </CardTitle>
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
              Filter and search through your {labels.deal.toLowerCase()} pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${labels.deals.toLowerCase()}...`}
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

        {/* Deal Pipeline - Panel Layout */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {activeTab === 'my-deals' ? `My ${labels.deal} Pipeline` : `${labels.deal} Pipeline`}
                </CardTitle>
                <CardDescription>
                  {isLoading ? 'Loading...' : `Showing ${dealsResponse?.data.length || 0} of ${dealsResponse?.meta.total || 0} ${labels.deals.toLowerCase()}`}
                </CardDescription>
              </div>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </CardHeader>
          <CardContent>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Loading {labels.deals.toLowerCase()}...</p>
                    </div>
                  ) : dealsResponse?.data.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No {labels.deals.toLowerCase()} found matching your criteria</p>
                    </div>
                  ) : view === 'table' ? (
                    <DealTableView
                      deals={dealsResponse?.data || []}
                      getStageVariant={getStageVariant}
                      formatCompactCurrency={formatCompactCurrency}
                      formatDate={formatDate}
                    />
                  ) : (
                    <div ref={containerRef} className="relative">
                      <div className={`transition-all duration-300 ${selectedDealId ? 'lg:grid lg:grid-cols-3 gap-6' : ''}`}>
                        <div ref={dealListRef}>
                          <DealListPanel
                            deals={dealsResponse?.data || []}
                            selectedDealId={selectedDealId}
                            onDealClick={handleDealClick}
                            getStageVariant={getStageVariant}
                            formatCompactCurrency={formatCompactCurrency}
                            formatDate={formatDate}
                          />
                        </div>

                        {selectedDealId && (
                          <div
                            ref={detailsPanelRef}
                            className="lg:col-span-2 animate-in slide-in-from-right duration-300"
                            style={{
                              position: selectedDealId ? 'sticky' : 'static',
                              top: '1rem',
                              alignSelf: 'flex-start'
                            }}
                          >
                            <DealDetailsPanel
                              deal={selectedDeal}
                              emptyMessage={`Select a ${labels.deal.toLowerCase()} to view details`}
                              formatCurrency={formatCurrency}
                              formatDate={formatDate}
                              getStageVariant={getStageVariant}
                              onClose={() => setSelectedDealId(null)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
      </div>
    </AppLayout>
  )
}