'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Briefcase, Building2, DollarSign, Calendar, User, ExternalLink, X, TrendingUp, Calculator } from 'lucide-react'

type ScheduleLike = {
  id?: string
  Wasserman_Invoice_Line_Amount__c?: unknown
}

type ProductLike = {
  id?: string
  schedules?: ScheduleLike[]
}

interface DealDetailsPanelProps {
  deal: {
    id: string
    Name: string
    StageName: string
    Amount?: number
    Contract_Amount__c?: number
    commission?: number
    Talent_Marketing_Fee_Percentage__c?: number
    closeDate?: string
    brand?: {
      name: string
      id?: string
    }
    Account_Name__c?: string
    Account_Industry__c?: string
    division?: string
    Owner_Workday_Cost_Center__c?: string
    owner?: {
      name: string
      email?: string
    }
    Licence_Holder_Name__c?: string
    products?: ProductLike[]
    schedules?: ScheduleLike[]
    _count?: {
      schedules?: number
    }
  } | null
  emptyMessage: string
  formatCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
  getStageVariant: (stage: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  onClose?: () => void
}

export function DealDetailsPanel({
  deal,
  emptyMessage,
  formatCurrency,
  formatDate,
  getStageVariant,
  onClose,
}: DealDetailsPanelProps) {
  const normalizeAmount = (value: unknown): number => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0
    }
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) ? parsed : 0
    }
    if (typeof value === 'object' && value !== null && typeof (value as { toString?: () => string }).toString === 'function') {
      const parsed = Number.parseFloat((value as { toString: () => string }).toString())
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }

  const calculateCommissionAmount = (dealData: NonNullable<DealDetailsPanelProps['deal']>) => {
    if (dealData.commission !== undefined && dealData.commission !== null) {
      const amount = normalizeAmount(dealData.commission)
      if (!Number.isNaN(amount)) {
        return amount
      }
    }

    const seenScheduleIds = new Set<string>()
    let total = 0

    const addScheduleAmount = (schedule: ScheduleLike | undefined) => {
      if (!schedule) return
      const scheduleId = typeof schedule.id === 'string' ? schedule.id : undefined
      if (scheduleId && seenScheduleIds.has(scheduleId)) {
        return
      }
      if (scheduleId) {
        seenScheduleIds.add(scheduleId)
      }
      total += normalizeAmount(schedule?.Wasserman_Invoice_Line_Amount__c)
    }

    ;(dealData.schedules || []).forEach(addScheduleAmount)
    ;(dealData.products || []).forEach((product) => {
      (product?.schedules || []).forEach(addScheduleAmount)
    })

    if (seenScheduleIds.size > 0 || total !== 0) {
      return total
    }

    return undefined
  }

  const commissionAmount = deal ? calculateCommissionAmount(deal) : undefined

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {deal ? (
              <Link
                href={`/deals/${deal.id}`}
                className="hover:text-primary hover:underline flex items-center gap-2"
              >
                <Briefcase className="h-5 w-5" />
                {deal.Name}
              </Link>
            ) : (
              emptyMessage
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {deal && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/deals/${deal.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Details
                  </Link>
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!deal ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Deal Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Deal Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Deal Name</div>
                  <div className="text-sm font-medium">
                    <Link
                      href={`/deals/${deal.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {deal.Name}
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Stage</div>
                  <Badge variant={getStageVariant(deal.StageName)} className="text-xs">
                    {deal.StageName}
                  </Badge>
                </div>
                {(deal.brand?.name || deal.Account_Name__c) && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Brand</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Building2 className="h-3 w-3" />
                      {deal.brand?.id ? (
                        <Link
                          href={`/brands/${deal.brand.id}`}
                          className="hover:text-primary hover:underline"
                        >
                          {deal.brand.name}
                        </Link>
                      ) : (
                        deal.brand?.name || deal.Account_Name__c
                      )}
                    </div>
                  </div>
                )}
                {deal.Account_Industry__c && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Industry</div>
                    <div className="text-sm font-medium">{deal.Account_Industry__c}</div>
                  </div>
                )}
                {deal.division && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Division</div>
                    <Badge variant="outline" className="text-xs">
                      {deal.division}
                    </Badge>
                  </div>
                )}
                {deal.Owner_Workday_Cost_Center__c && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cost Center</div>
                    <div className="text-sm font-medium">{deal.Owner_Workday_Cost_Center__c}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Owner</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <User className="h-3 w-3" />
                    {deal.owner?.name || deal.Licence_Holder_Name__c || 'Unassigned'}
                  </div>
                  {deal.owner?.email && (
                    <div className="text-xs text-muted-foreground mt-1">{deal.owner.email}</div>
                  )}
                </div>
                {deal.closeDate && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Close Date</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Calendar className="h-3 w-3" />
                      {formatDate(deal.closeDate)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Financial Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Financial Details</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {deal.Amount !== undefined && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <DollarSign className="h-4 w-4" />
                      Deal Amount
                    </div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(deal.Amount)}
                    </div>
                  </div>
                )}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calculator className="h-4 w-4" />
                    Commission Amount
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(commissionAmount)}
                  </div>
                </div>
                {deal.Talent_Marketing_Fee_Percentage__c !== undefined && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <TrendingUp className="h-4 w-4" />
                      Comission Fee
                    </div>
                    <div className="text-2xl font-bold">
                      {deal.Talent_Marketing_Fee_Percentage__c}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            {(deal.products?.length || deal._count?.schedules) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Additional Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {deal.products?.length !== undefined && (
                      <div>
                        <div className="text-muted-foreground mb-1">Products</div>
                        <div className="font-medium">{deal.products.length} product{deal.products.length !== 1 ? 's' : ''}</div>
                      </div>
                    )}
                    {deal._count?.schedules !== undefined && (
                      <div>
                        <div className="text-muted-foreground mb-1">Schedules</div>
                        <div className="font-medium">{deal._count.schedules} schedule{deal._count.schedules !== 1 ? 's' : ''}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
