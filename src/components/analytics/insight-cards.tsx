'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { AnalyticsService, InsightsData } from '../../services/analytics'
import { useFilter } from '../../contexts/filter-context'
import { Loader2, TrendingUp, Users, DollarSign, Calendar, Network, Target } from 'lucide-react'

export function InsightCards() {
  const { filterSelection } = useFilter()

  const filterParams = {
    ...(filterSelection.type === 'individual' && { costCenter: filterSelection.value || undefined }),
    ...(filterSelection.type === 'group' && { costCenterGroup: filterSelection.value || undefined })
  }

  const { data: insights, isLoading } = useQuery({
    queryKey: ['analytics-insights', filterParams],
    queryFn: () => AnalyticsService.getInsights(filterParams)
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Revenue Concentration */}
      {insights?.revenueConcentration && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Concentration Analysis
                </CardTitle>
                <CardDescription>
                  Identify revenue concentration risk across clients and brands
                </CardDescription>
              </div>
              <Badge variant="outline">
                {insights.revenueConcentration.top10ClientsPercentage.toFixed(1)}% from top 10
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top Clients */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Top Revenue Clients</h4>
                {insights.revenueConcentration.topClients.slice(0, 5).map((client, idx) => (
                  <div key={client.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant={idx === 0 ? "default" : "outline"}>#{idx + 1}</Badge>
                      <span className="text-sm font-medium">{client.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(client.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{client.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Brands */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Top Revenue Brands</h4>
                {insights.revenueConcentration.topBrands.slice(0, 5).map((brand, idx) => (
                  <div key={brand.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant={idx === 0 ? "default" : "outline"}>#{idx + 1}</Badge>
                      <span className="text-sm font-medium">{brand.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(brand.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{brand.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engagement Recency */}
      {insights?.engagementRecency && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Client Engagement Recency
            </CardTitle>
            <CardDescription>
              Track client engagement status based on last deal activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5 mb-6">
              <div className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{insights.engagementRecency.hot}</div>
                <p className="text-xs text-muted-foreground">Hot (&lt;90d)</p>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold text-blue-600">{insights.engagementRecency.warm}</div>
                <p className="text-xs text-muted-foreground">Warm (90-180d)</p>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold text-orange-600">{insights.engagementRecency.cooling}</div>
                <p className="text-xs text-muted-foreground">Cooling (180-365d)</p>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold text-red-600">{insights.engagementRecency.cold}</div>
                <p className="text-xs text-muted-foreground">Cold (&gt;365d)</p>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <div className="text-2xl font-bold text-gray-600">{insights.engagementRecency.never}</div>
                <p className="text-xs text-muted-foreground">Never</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm mb-3">Clients Needing Attention (Cooling/Cold)</h4>
              {insights.engagementRecency.clients
                .filter(c => c.status === 'cooling' || c.status === 'cold')
                .slice(0, 10)
                .map(client => (
                  <div key={client.clientId} className="flex items-center justify-between p-2 rounded-lg border">
                    <span className="text-sm font-medium">{client.clientName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={client.status === 'cold' ? 'destructive' : 'secondary'}>
                        {client.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {client.daysSinceEngagement} days ago
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Portfolio Analysis */}
      {insights?.agentPortfolio && insights.agentPortfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Agent Portfolio Diversity
            </CardTitle>
            <CardDescription>
              Agent performance across different talent categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.agentPortfolio
                .sort((a, b) => b.dealCount - a.dealCount)
                .slice(0, 10)
                .map((agent, idx) => (
                  <div key={agent.agentId} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Badge variant={idx < 3 ? "default" : "outline"}>#{idx + 1}</Badge>
                      <div>
                        <p className="font-medium">{agent.agentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {agent.categoryCount} {agent.categoryCount === 1 ? 'category' : 'categories'}: {agent.categories.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm font-bold">{agent.clientCount}</p>
                        <p className="text-xs text-muted-foreground">Clients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">{agent.dealCount}</p>
                        <p className="text-xs text-muted-foreground">Deals</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold">{agent.brandCount}</p>
                        <p className="text-xs text-muted-foreground">Brands</p>
                      </div>
                      <div className="text-center">
                        <Badge variant="secondary">
                          {(agent.diversityScore * 100).toFixed(0)}% diversity
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Performance */}
      {insights?.categoryPerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Category Performance Comparison
            </CardTitle>
            <CardDescription>
              Revenue and engagement metrics by talent category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(insights.categoryPerformance)
                .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
                .slice(0, 10)
                .map(([category, stats]) => (
                  <div key={category} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{category}</h4>
                      <Badge variant="outline">{stats.clientCount} clients</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Revenue</p>
                        <p className="font-bold">{formatCurrency(stats.totalRevenue)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg per Client</p>
                        <p className="font-bold">{formatCurrency(stats.avgRevenuePerClient)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg per Deal</p>
                        <p className="font-bold">{formatCurrency(stats.avgRevenuePerDeal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deal Velocity */}
      {insights?.dealVelocity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Deal Velocity Analysis
            </CardTitle>
            <CardDescription>
              Average time to close deals by agent and brand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* By Agent */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Fastest Agents (Avg Days to Close)</h4>
                {insights.dealVelocity.byAgent.slice(0, 5).map((agent, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant={idx === 0 ? "default" : "outline"}>#{idx + 1}</Badge>
                      <span className="text-sm font-medium">{agent.agentName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{Math.round(agent.avgDaysToClose)} days</p>
                      <p className="text-xs text-muted-foreground">
                        {agent.dealCount} deals • {formatCurrency(agent.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* By Brand */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Fastest Brands (Avg Days to Close)</h4>
                {insights.dealVelocity.byBrand.slice(0, 5).map((brand, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant={idx === 0 ? "default" : "outline"}>#{idx + 1}</Badge>
                      <span className="text-sm font-medium">{brand.brandName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{Math.round(brand.avgDaysToClose)} days</p>
                      <p className="text-xs text-muted-foreground">
                        {brand.dealCount} deals • {formatCurrency(brand.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Brand Co-occurrence */}
      {insights?.brandCooccurrence && Object.keys(insights.brandCooccurrence).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Brand Co-Occurrence Matrix
            </CardTitle>
            <CardDescription>
              Brands that frequently share clients (cross-sell opportunities)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(insights.brandCooccurrence)
                .slice(0, 5)
                .map(([brand1, connections]) => {
                  const topConnections = Object.entries(connections)
                    .sort(([, a], [, b]) => b.count - a.count)
                    .slice(0, 3)

                  return (
                    <div key={brand1} className="p-3 rounded-lg border">
                      <h4 className="font-semibold mb-2">{brand1}</h4>
                      <div className="flex flex-wrap gap-2">
                        {topConnections.map(([brand2, data]) => (
                          <Badge key={brand2} variant="secondary">
                            {brand2} ({data.count} shared clients)
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
