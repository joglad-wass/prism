'use client'

import { useState } from 'react'
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
import { Users, DollarSign, Briefcase, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Brand } from '../../types'

interface BrandTalentProps {
  brand: Brand & {
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

export function BrandTalent({ brand }: BrandTalentProps) {
  const router = useRouter()
  const [selectedTalent, setSelectedTalent] = useState<any>(null)

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get all talent clients associated with this brand through deals
  const talentClients = brand.popularClients || []

  // Select first talent by default or keep current selection
  const activeTalent = selectedTalent || talentClients[0]

  // Get deals for the selected talent
  const talentDeals = brand.deals?.filter(deal =>
    deal.clients?.some(dc => dc.talentClient?.id === activeTalent?.client?.id)
  ) || []

  // Calculate Wasserman revenue (commission) from schedules
  const wassermanRevenue = talentDeals.reduce((sum, deal) => {
    const dealCommission = deal.schedules?.reduce((scheduleSum, schedule) => {
      const wassermanAmount = schedule.Wasserman_Invoice_Line_Amount__c || 0
      return scheduleSum + Number(wassermanAmount)
    }, 0) || 0
    return sum + dealCommission
  }, 0)

  // Total talent revenue is the total deal amounts
  const talentRevenue = talentDeals.reduce((sum, deal) => {
    return sum + (deal.Amount ? Number(deal.Amount) : 0)
  }, 0)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Talent List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Associated Talent
          </CardTitle>
        </CardHeader>
        <CardContent>
          {talentClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No talent associated with this brand</p>
            </div>
          ) : (
            <div className="space-y-2">
              {talentClients.map((talentClient) => (
                <div
                  key={talentClient.client.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeTalent?.client?.id === talentClient.client.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedTalent(talentClient)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{talentClient.client.Name}</div>
                      {talentClient.client.Client_Category__c && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {talentClient.client.Client_Category__c}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {talentClient.dealCount} deals
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(talentClient.totalRevenue)}
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

      {/* Right: Talent Details & Deals */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {activeTalent ? `${activeTalent.client.Name}'s Deals with ${brand.name}` : 'Select a talent to view details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activeTalent ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Select a talent from the list to view their deals</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Briefcase className="h-4 w-4" />
                    Total Deals
                  </div>
                  <div className="text-2xl font-bold">{activeTalent.dealCount}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Talent Revenue
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(talentRevenue)}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Wasserman Revenue
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(wassermanRevenue)}
                  </div>
                </div>
              </div>

              {/* Deals Table */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Deal History</h3>
                {talentDeals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No deals found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Deal Name</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Close Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {talentDeals.map((deal) => (
                          <TableRow
                            key={deal.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/deals/${deal.id}`)}
                          >
                            <TableCell className="font-medium">{deal.Name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{deal.StageName || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(deal.Amount ? Number(deal.Amount) : 0)}
                            </TableCell>
                            <TableCell>
                              {deal.CloseDate
                                ? new Date(deal.CloseDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
