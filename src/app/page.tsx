'use client'

import { AppLayout } from '../components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Users, Building2, Briefcase, DollarSign, TrendingUp, Plus } from 'lucide-react'
import { useTalentStats } from '../hooks/useTalents'
import { useBrandStats } from '../hooks/useBrands'
import { useDeals } from '../hooks/useDeals'
import { useAgents } from '../hooks/useAgents'
import { useFilter } from '../contexts/filter-context'

export default function Home() {
  const { filterSelection } = useFilter()

  const filterParams = {
    ...(filterSelection.type === 'individual' && { costCenter: filterSelection.value || undefined }),
    ...(filterSelection.type === 'group' && { costCenterGroup: filterSelection.value || undefined })
  }

  const { data: talentStats } = useTalentStats(filterParams)
  const { data: brandStats } = useBrandStats()

  // Fetch recent deals (limit to 3 for the card)
  const { data: recentDeals } = useDeals({
    limit: 3,
    page: 1,
    ...filterParams
  })

  // Fetch all deals for stats (first page with higher limit)
  const { data: allDeals } = useDeals({
    limit: 100,
    page: 1,
    ...filterParams
  })

  // Fetch top performing agents (only agents with deals)
  const { data: topAgents } = useAgents({
    hasDeals: true,
    limit: 10,
    page: 1,
    ...filterParams
  })

  // Calculate deal stats
  const activeDealsCount = allDeals?.data?.filter(deal =>
    deal.Status__c !== 'Closed Lost' && deal.Status__c !== 'Closed Won' &&
    !deal.StageName?.includes('Closed')
  ).length || 0

  const totalRevenue = allDeals?.data?.reduce((sum, deal) => {
    return sum + (deal.Amount || deal.Contract_Amount__c || 0)
  }, 0) || 0
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to Wasserman Prism. Here's an overview of your talent management data.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Talent Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{talentStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandStats?.totalActive || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeDealsCount}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue > 0 ? `$${(totalRevenue / 1000000).toFixed(1)}M` : '$0'}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+20%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deals</CardTitle>
              <CardDescription>Latest deal activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentDeals?.data?.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{deal.Name}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.brand?.name || deal.Account_Name__c || 'Unknown Brand'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {deal.Amount || deal.Contract_Amount__c
                        ? `$${((deal.Amount || deal.Contract_Amount__c)! / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`
                        : 'N/A'
                      }
                    </p>
                    <Badge variant={
                      deal.Status__c === 'Won' || deal.StageName?.includes('Closed') ? 'default' :
                      deal.Status__c === 'Negotiating' || deal.StageName?.includes('Negotiat') ? 'secondary' :
                      'outline'
                    }>
                      {deal.StageName || deal.Status__c}
                    </Badge>
                  </div>
                </div>
              )) || (
                <div className="text-center text-muted-foreground py-4">
                  Loading recent deals...
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Agents</CardTitle>
              <CardDescription>Agent performance this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {topAgents?.data
                ?.map((agent) => {
                  const clientCount = agent.clients?.length || 0
                  const totalDeals = agent.deals?.reduce((sum, deal) => {
                    const amount = Number(deal.Amount || deal.Contract_Amount__c || 0)
                    return sum + amount
                  }, 0) || 0
                  const dealCount = agent.deals?.length || 0


                  return { ...agent, clientCount, totalDeals, dealCount }
                })
                // No need to filter since hasDeals=true already filters on the backend
                .sort((a, b) => b.totalDeals - a.totalDeals)
                .slice(0, 3)
                .map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {agent.clientCount} clients • {agent.dealCount} deals
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {agent.totalDeals > 0 ? `$${(agent.totalDeals / 1000000).toFixed(1)}M` : '$0'}
                      </p>
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        {agent.division || 'N/A'}
                      </div>
                    </div>
                  </div>
                )) || (
                <div className="text-center text-muted-foreground py-4">
                  Loading top agents...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
