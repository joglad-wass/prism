'use client'

import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useTalents } from '../../hooks/useTalents'
import { useBrands } from '../../hooks/useBrands'
import { useAgents } from '../../hooks/useAgents'
import { useDeals } from '../../hooks/useDeals'
import { useFilter } from '../../contexts/filter-context'
import { useLabels } from '../../hooks/useLabels'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Briefcase,
  Target,
  Download,
  Lightbulb,
  Network
} from 'lucide-react'
import { InsightCards } from '../../components/analytics/insight-cards'
import { NetworkGraph } from '../../components/analytics/network-graph'
import { VisualQueryBuilder } from '../../components/analytics/visual-query-builder'
import { exportToCSV, flattenForExport } from '../../utils/export'

export default function AnalyticsPage() {
  const { labels } = useLabels()
  const { filterSelection } = useFilter()
  const [activeTab, setActiveTab] = useState('insights')

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

  const totalDealValue = deals.reduce((acc, deal) => acc + (deal.Amount || 0), 0)
  const avgDealSize = deals.length > 0 ? totalDealValue / deals.length : 0

  const dealsByStage = deals.reduce((acc, deal) => {
    acc[deal.StageName] = (acc[deal.StageName] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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

  const handleExport = () => {
    const exportData = {
      overview: {
        totalRevenue: totalDealValue,
        avgDealSize,
        totalDeals: deals.length,
        totalClients: talents.length,
        totalBrands: brands.length,
        totalAgents: agents.length
      },
      dealsByStage,
      timestamp: new Date().toISOString()
    }

    // Export summary as JSON
    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    // Also export deals as CSV
    if (deals.length > 0) {
      const dealsForExport = flattenForExport(deals.map(d => ({
        name: d.Name,
        stage: d.StageName,
        status: d.Status__c,
        amount: d.Amount,
        brand: d.brand?.name || '',
        division: d.division
      })))
      exportToCSV(dealsForExport, `deals-${new Date().toISOString().split('T')[0]}`)
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Advanced insights and relationship analysis
            </p>
            {filterSelection.value && (
              <Badge variant="secondary" className="mt-2">
                Filtered by: {filterSelection.value}
              </Badge>
            )}
          </div>
          <Button onClick={handleExport}>
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
                Across {deals.length} {deals.length === 1 ? labels.deal.toLowerCase() : labels.deals.toLowerCase()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg {labels.deal} Size</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(avgDealSize)}</div>
              <p className="text-xs text-muted-foreground">
                Per {labels.deal.toLowerCase()} average
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
                {labels.deals} closed won
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
                {labels.deals} in progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different analytics views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Insights & Query
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network Graph
            </TabsTrigger>
          </TabsList>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            {/* Visual Query Builder */}
            <VisualQueryBuilder />

            {/* Insight Cards */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Pre-Built Insights</h2>
              <InsightCards />
            </div>
          </TabsContent>

          {/* Network Tab */}
          <TabsContent value="network" className="space-y-6">
            <NetworkGraph />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
