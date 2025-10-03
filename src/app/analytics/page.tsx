'use client'

import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { useTalents } from '../../hooks/useTalents'
import { useBrands } from '../../hooks/useBrands'
import { useAgents } from '../../hooks/useAgents'
import { useDeals } from '../../hooks/useDeals'
import { useFilter } from '../../contexts/filter-context'
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Briefcase,
  Award,
  Target,
  Calendar,
  Download
} from 'lucide-react'

export default function AnalyticsPage() {
  const { filterSelection } = useFilter()

  const filterParams = {
    ...(filterSelection.type === 'individual' && { costCenter: filterSelection.value || undefined }),
    ...(filterSelection.type === 'group' && { costCenterGroup: filterSelection.value || undefined })
  }

  const { data: talentsResponse } = useTalents({ limit: 1000, ...filterParams })
  const { data: brandsResponse } = useBrands({ limit: 1000 })
  const { data: agentsResponse } = useAgents({ hasDeals: true, limit: 100, ...filterParams })
  const { data: dealsResponse } = useDeals({ limit: 1000, ...filterParams })

  // Calculate analytics
  const talents = talentsResponse?.data || []
  const brands = brandsResponse?.data || []
  const agents = agentsResponse?.data || []
  const deals = dealsResponse?.data || []

  // Talent Analytics
  const talentsByCategory = talents.reduce((acc, talent) => {
    const category = talent.category || 'Uncategorized'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const activeVsInactive = {
    active: talents.filter(t => t.status?.toLowerCase().includes('active')).length,
    inactive: talents.filter(t => t.status?.toLowerCase().includes('inactive')).length,
    retired: talents.filter(t => t.status?.toLowerCase().includes('retired')).length,
  }

  const nilVsNonNil = {
    nil: talents.filter(t => t.isNil).length,
    nonNil: talents.filter(t => !t.isNil).length,
  }


  // Brand Analytics
  const brandsByStatus = {
    active: brands.filter(b => b.status === 'ACTIVE').length,
    inactive: brands.filter(b => b.status === 'INACTIVE').length,
    prospect: brands.filter(b => b.status === 'PROSPECT').length,
  }

  const brandsByType = {
    brand: brands.filter(b => b.type === 'BRAND').length,
    agency: brands.filter(b => b.type === 'AGENCY').length,
  }

  // Deal Analytics
  const dealsByStage = deals.reduce((acc, deal) => {
    acc[deal.StageName] = (acc[deal.StageName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dealsByStatus = deals.reduce((acc, deal) => {
    acc[deal.Status__c] = (acc[deal.Status__c] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalDealValue = deals.reduce((acc, deal) => acc + (deal.Amount || 0), 0)
  const avgDealSize = deals.length > 0 ? totalDealValue / deals.length : 0

  // Agent Performance
  const agentPerformance = agents.map(agent => {
    const clientCount = agent.clients?.length || 0
    const dealCount = agent.deals?.length || 0
    const brandCount = agent.ownedBrands?.length || 0
    const totalDealRevenue = agent.deals?.reduce((sum, deal) => {
      const amount = Number(deal.Amount || deal.Contract_Amount__c || 0)
      return sum + amount
    }, 0) || 0


    return {
      ...agent,
      clientCount,
      dealCount,
      brandCount,
      totalDealRevenue
    }
  })
  // No need to filter since hasDeals=true already filters on the backend
  .sort((a, b) => b.totalDealRevenue - a.totalDealRevenue)

  const topPerformingAgents = agentPerformance.slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0'
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into your talent management data
            </p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalDealValue)}</div>
              <p className="text-xs text-muted-foreground">
                Across {deals.length} deals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Deal Size</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgDealSize)}</div>
              <p className="text-xs text-muted-foreground">
                Per deal average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getPercentage(dealsByStage['CLOSED_WON'] || 0, deals.length)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Deals closed won
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dealsByStage['NEGOTIATION'] || 0) + (dealsByStage['PROPOSAL'] || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Deals in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Talent Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Talent by Category</CardTitle>
              <CardDescription>Distribution of talent across categories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(talentsByCategory)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 8)
                .map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {getPercentage(count, talents.length)}%
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          {/* Deal Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Deal Pipeline</CardTitle>
              <CardDescription>Deals by stage breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(dealsByStage)
                .sort(([,a], [,b]) => b - a)
                .map(([stage, count]) => (
                  <div key={stage} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${
                        stage === 'CLOSED_WON' ? 'bg-green-500' :
                        stage === 'CLOSED_LOST' ? 'bg-red-500' :
                        stage === 'NEGOTIATION' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium">{stage.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {getPercentage(count, deals.length)}%
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Talent Status */}
          <Card>
            <CardHeader>
              <CardTitle>Talent Status</CardTitle>
              <CardDescription>Active vs inactive talents</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <Badge variant="default">{activeVsInactive.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <Badge variant="secondary">{activeVsInactive.inactive}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-500 rounded-full" />
                  <span className="text-sm font-medium">Retired</span>
                </div>
                <Badge variant="outline">{activeVsInactive.retired}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* NIL Status */}
          <Card>
            <CardHeader>
              <CardTitle>NIL Status</CardTitle>
              <CardDescription>NIL eligible athletes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-purple-500 rounded-full" />
                  <span className="text-sm font-medium">NIL Eligible</span>
                </div>
                <Badge variant="default">{nilVsNonNil.nil}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-500 rounded-full" />
                  <span className="text-sm font-medium">Non-NIL</span>
                </div>
                <Badge variant="outline">{nilVsNonNil.nonNil}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Brand Status */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Status</CardTitle>
              <CardDescription>Brand partnership status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-medium">Active</span>
                </div>
                <Badge variant="default">{brandsByStatus.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-orange-500 rounded-full" />
                  <span className="text-sm font-medium">Prospect</span>
                </div>
                <Badge variant="outline">{brandsByStatus.prospect}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 bg-gray-500 rounded-full" />
                  <span className="text-sm font-medium">Inactive</span>
                </div>
                <Badge variant="secondary">{brandsByStatus.inactive}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Agents */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Agents</CardTitle>
            <CardDescription>Agents ranked by deal revenue (only agents with deals)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingAgents.map((agent, index) => (
                <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">{agent.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm font-medium">{formatCurrency(agent.totalDealRevenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{agent.dealCount}</p>
                      <p className="text-xs text-muted-foreground">Deals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{agent.clientCount}</p>
                      <p className="text-xs text-muted-foreground">Clients</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}