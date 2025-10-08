'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { DealQuickView, DealQuickViewData } from './deal-quick-view'
import { ExternalLink, Building2, User, Calendar } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface DealTableViewProps {
  deals: Array<{
    id: string
    Name: string
    StageName: string
    Status__c: string
    Amount?: number
    Contract_Amount__c?: number
    Talent_Marketing_Fee_Percentage__c?: number
    closeDate?: string
    division?: string
    Account_Industry__c?: string
    Account_Name__c?: string
    Owner_Workday_Cost_Center__c?: string
    Licence_Holder_Name__c?: string
    brand?: {
      name: string
    }
    owner?: {
      name: string
      email: string
    }
    products?: Array<any>
    _count?: {
      schedules: number
      products?: number
    }
  }>
  getStageVariant: (stage: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  formatCompactCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
}

export function DealTableView({
  deals,
  getStageVariant,
  formatCompactCurrency,
  formatDate,
}: DealTableViewProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [quickViewDeal, setQuickViewDeal] = useState<DealQuickViewData | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleRowClick = (deal: any) => {
    setQuickViewDeal({
      id: deal.id,
      Name: deal.Name,
      Status__c: deal.Status__c,
      StageName: deal.StageName,
      amount: deal.Amount,
      Contract_Amount__c: deal.Contract_Amount__c,
      Talent_Marketing_Fee_Percentage__c: deal.Talent_Marketing_Fee_Percentage__c,
      closeDate: deal.closeDate,
      division: deal.division,
      Account_Industry__c: deal.Account_Industry__c,
      Account_Name__c: deal.Account_Name__c,
      Owner_Workday_Cost_Center__c: deal.Owner_Workday_Cost_Center__c,
      Licence_Holder_Name__c: deal.Licence_Holder_Name__c,
      brand: deal.brand,
      owner: deal.owner,
      products: deal.products,
      _count: deal._count,
    })
    setQuickViewOpen(true)
  }

  const handleViewProfile = (dealId: string) => {
    router.push(`/deals/${dealId}`)
  }

  return (
    <>
      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">{labels.deal} Name</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Brand/Account</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Contract Amount</TableHead>
              <TableHead>Close Date</TableHead>
              <TableHead className="text-right">Products</TableHead>
              <TableHead className="text-right">Schedules</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow
                key={deal.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(deal)}
              >
                <TableCell className="font-medium">
                  {deal.Name}
                </TableCell>
                <TableCell>
                  <Badge variant={getStageVariant(deal.StageName)} className="text-xs">
                    {deal.StageName}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {deal.brand?.name || deal.Account_Name__c ? (
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {deal.brand?.name || deal.Account_Name__c}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {deal.owner?.name ? (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {deal.owner.name}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {deal.division || '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {deal.Owner_Workday_Cost_Center__c || '-'}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {formatCompactCurrency(deal.Amount)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                  {formatCompactCurrency(deal.Contract_Amount__c)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {deal.closeDate ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(deal.closeDate)}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {deal._count?.products || 0}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {deal._count?.schedules || 0}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewProfile(deal.id)
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DealQuickView
        deal={quickViewDeal}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onViewProfile={handleViewProfile}
      />
    </>
  )
}
