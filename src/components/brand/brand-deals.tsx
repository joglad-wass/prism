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
import { Separator } from '../ui/separator'
import {
  Briefcase,
  ExternalLink,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Building2,
  User as UserIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Brand } from '../../types'

interface BrandDealsProps {
  brand: Brand
}

export function BrandDeals({ brand }: BrandDealsProps) {
  const router = useRouter()
  const [selectedDeal, setSelectedDeal] = useState<any>(null)

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

  const getStatusVariant = (status: string) => {
    const lowercaseStatus = status?.toLowerCase()
    if (lowercaseStatus?.includes('active')) return 'default'
    if (lowercaseStatus?.includes('completed')) return 'secondary'
    if (lowercaseStatus?.includes('negotiating')) return 'outline'
    return 'secondary'
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

  // Select first deal by default or keep current selection
  const activeDeal = selectedDeal || (brand.deals && brand.deals.length > 0 ? brand.deals[0] : null)

  // Calculate deal metrics
  const dealCommission = activeDeal?.schedules?.reduce((sum, schedule) => {
    const wassermanAmount = schedule.Wasserman_Invoice_Line_Amount__c || 0
    return sum + Number(wassermanAmount)
  }, 0) || 0

  return (
    <div className="space-y-6">
      {/* Deals Summary */}
      {brand.deals && brand.deals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brand.deals.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {brand.deals.filter(deal => {
                  if (deal.Status__c === 'ACTIVE') return true
                  // If status is null, consider it active if it has an amount or schedules
                  if (deal.Status__c === null && (deal.Amount || deal.Contract_Amount__c || deal.schedules?.length > 0)) return true
                  return false
                }).length}
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
                {formatCurrency(brand.deals.reduce((sum, deal) => sum + (deal.Amount || 0), 0))}
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
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            All Deals ({brand.deals?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!brand.deals || brand.deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No deals found for this brand</p>
            </div>
          ) : (
            <div className="space-y-2">
              {brand.deals.map((deal) => (
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
              {activeDeal ? activeDeal.Name : 'Select a deal to view details'}
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
              <p>Select a deal from the list to view its details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Deal Amount
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
                <h3 className="text-sm font-semibold">Deal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Stage</div>
                    <Badge variant="outline" className={getStageColor(activeDeal.StageName)}>
                      {activeDeal.StageName || 'N/A'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Close Date</div>
                    <div className="text-sm font-medium">{formatDate(activeDeal.CloseDate)}</div>
                  </div>
                  {activeDeal.owner && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Owner</div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <UserIcon className="h-3 w-3" />
                        {activeDeal.owner.name}
                      </div>
                    </div>
                  )}
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
                        onClick={() => client.talentClient?.id && router.push(`/talents/${client.talentClient.id}`)}
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
