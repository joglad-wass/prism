'use client'

import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Building2, DollarSign, Calendar } from 'lucide-react'

interface DealListPanelProps {
  deals: Array<{
    id: string
    Name: string
    StageName: string
    Amount?: number
    Contract_Amount__c?: number
    closeDate?: string
    brand?: {
      name: string
    }
    Account_Name__c?: string
    division?: string
    owner?: {
      name: string
    }
  }>
  selectedDealId: string | null
  onDealClick: (dealId: string) => void
  getStageVariant: (stage: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  formatCompactCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
}

export function DealListPanel({
  deals,
  selectedDealId,
  onDealClick,
  getStageVariant,
  formatCompactCurrency,
  formatDate,
}: DealListPanelProps) {
  return (
    <div className={selectedDealId ? 'lg:col-span-1' : ''}>
      <div className={`space-y-2 ${selectedDealId ? '' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}`}>
        {deals.map((deal) => (
          <div
            key={deal.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedDealId === deal.id
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onDealClick(deal.id)}
          >
            <Link
              href={`/deals/${deal.id}`}
              className="font-medium text-sm mb-2 hover:text-primary hover:underline inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              {deal.Name}
            </Link>
            {deal.division && (
              <div className="text-xs text-muted-foreground mb-2">
                {deal.division}
              </div>
            )}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={getStageVariant(deal.StageName)} className="text-xs">
                {deal.StageName}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              {(deal.brand?.name || deal.Account_Name__c) && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {deal.brand?.name || deal.Account_Name__c}
                </div>
              )}
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCompactCurrency(deal.Amount || deal.Contract_Amount__c)}
              </div>
              {deal.closeDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(deal.closeDate)}
                </div>
              )}
              {deal.owner?.name && (
                <div className="truncate">
                  Owner: {deal.owner.name}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
