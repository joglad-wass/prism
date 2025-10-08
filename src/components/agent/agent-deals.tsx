'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Separator } from '../ui/separator'
import {
  Briefcase,
  ExternalLink,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ViewToggle } from '../talent/view-toggle'

import { Agent } from '../../types'
import { useLabels } from '../../hooks/useLabels'

interface AgentDealsProps {
  agent: Agent
}

export function AgentDeals({ agent }: AgentDealsProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [selectedDeal, setSelectedDeal] = useState<any>(null)

  // Initialize view from localStorage
  const [view, setView] = useState<'modular' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('agent-deals-view-preference')
      return (savedView === 'table' ? 'table' : 'modular') as 'modular' | 'table'
    }
    return 'modular'
  })

  // Save view preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agent-deals-view-preference', view)
  }, [view])

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

  const getStageColor = (stage: string) => {
    const lowercaseStage = stage?.toLowerCase()
    if (lowercaseStage?.includes('closed') || lowercaseStage?.includes('won')) {
      return 'text-green-600 dark:text-green-400'
    }
    if (lowercaseStage?.includes('negotiation') || lowercaseStage?.includes('proposal')) {
      return 'text-orange-600 dark:text-orange-400'
    }
    if (lowercaseStage?.includes('prospecting') || lowercaseStage?.includes('qualification')) {
      return 'text-blue-600 dark:text-blue-400'
    }
    return 'text-muted-foreground'
  }

  const deals = agent.deals || []

  // Select first deal by default or keep current selection
  const activeDeal = selectedDeal || (deals.length > 0 ? deals[0] : null)

  // Calculate deal commission
  const dealCommission = activeDeal?.schedules?.reduce((sum: number, schedule: any) => {
    const wassermanAmount = schedule.Wasserman_Invoice_Line_Amount__c || 0
    return sum + Number(wassermanAmount)
  }, 0) || 0

  // Calculate total stats
  const totalDeals = deals.length
  const activeDeals = deals.filter((deal: any) => {
    if (deal.Status__c === 'ACTIVE') return true
    if (deal.Status__c === null && (deal.Amount || deal.Contract_Amount__c)) return true
    return false
  }).length
  const totalRevenue = deals.reduce((sum: number, deal: any) => {
    return sum + (deal.Amount ? Number(deal.Amount) : 0)
  }, 0)

  // Table View
  if (view === 'table') {
    return (
      <div className="space-y-6">
        {/* Deals Summary */}
        {deals.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total {labels.deals}</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDeals}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active {labels.deals}</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {activeDeals}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                All {labels.deals} ({deals.length})
              </CardTitle>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No {labels.deals.toLowerCase()} found for this {labels.agent.toLowerCase()}</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{labels.deal} Name</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Clients</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deals.map((deal: any) => (
                      <TableRow
                        key={deal.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/deals/${deal.id}`)}
                      >
                        <TableCell className="font-medium">{deal.Name}</TableCell>
                        <TableCell>{deal.brand?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStageColor(deal.StageName)}>
                            {deal.StageName || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{deal.clients?.length || 0}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(deal.Amount ? Number(deal.Amount) : 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Modular View
  return (
    <div className="space-y-6">
      {/* Deals Summary */}
      {deals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total {labels.deals}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeals}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active {labels.deals}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {activeDeals}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalRevenue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deals List and Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Deals List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                All {labels.deals} ({deals.length})
              </CardTitle>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No {labels.deals.toLowerCase()} found for this {labels.agent.toLowerCase()}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {deals.map((deal: any) => (
                  <div
                    key={deal.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      activeDeal?.id === deal.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{deal.Name}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`${getStageColor(deal.StageName)} text-xs`}>
                            {deal.StageName || 'N/A'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(deal.Amount ? Number(deal.Amount) : 0)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {deal.clients?.length || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Deal Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {activeDeal ? activeDeal.Name : `Select a ${labels.deal.toLowerCase()} to view details`}
              </CardTitle>
              {activeDeal && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/deals/${activeDeal.id}`)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Full Details
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!activeDeal ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a {labels.deal.toLowerCase()} from the list to view its details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      {labels.deal} Amount
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(activeDeal.Amount ? Number(activeDeal.Amount) : 0)}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Commission
                    </div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(dealCommission)}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      Talent Clients
                    </div>
                    <div className="text-2xl font-bold">{activeDeal.clients?.length || 0}</div>
                  </div>
                </div>

                <Separator />

                {/* Deal Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">{labels.deal} Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Stage</div>
                      <Badge variant="outline" className={getStageColor(activeDeal.StageName)}>
                        {activeDeal.StageName || 'N/A'}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Brand</div>
                      <div className="text-sm font-medium">{activeDeal.brand?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Close Date</div>
                      <div className="text-sm font-medium">{formatDate(activeDeal.closeDate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Division</div>
                      <div className="text-sm font-medium">{activeDeal.division || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Associated Talent */}
                {activeDeal.clients && activeDeal.clients.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Associated Talent</h3>
                    <div className="space-y-2">
                      {activeDeal.clients.map((client: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => client.talentClient?.id && router.push(`/talent/${client.talentClient.id}`)}
                        >
                          <div>
                            <div className="font-medium text-sm">{client.talentClient?.Name || 'Unknown'}</div>
                            {client.talentClient?.Client_Category__c && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {client.talentClient.Client_Category__c}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedules */}
                {activeDeal.schedules && activeDeal.schedules.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Payment Schedules ({activeDeal.schedules.length})</h3>
                    <div className="space-y-2">
                      {activeDeal.schedules.map((schedule: any) => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(schedule.ScheduleDate)}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Revenue</div>
                              <div className="font-medium">{formatCurrency(schedule.Revenue ? Number(schedule.Revenue) : 0)}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">Commission</div>
                              <div className="font-medium text-orange-600 dark:text-orange-400">
                                {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c ? Number(schedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
