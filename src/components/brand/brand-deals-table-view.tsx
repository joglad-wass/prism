'use client'

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
import { DollarSign, Calendar, Users, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLabels } from '../../hooks/useLabels'

interface BrandDealsTableViewProps {
  deals: Array<{
    id: string
    Name: string
    StageName: string
    Status__c?: string
    Amount?: number
    Contract_Amount__c?: number
    closeDate?: string
    clients?: any[]
  }>
  formatCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
  getStageColor: (stage: string) => string
}

export function BrandDealsTableView({
  deals,
  formatCurrency,
  formatDate,
  getStageColor,
}: BrandDealsTableViewProps) {
  const { labels } = useLabels()
  const router = useRouter()

  const handleViewDeal = (dealId: string) => {
    router.push(`/deals/${dealId}`)
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">{labels.deal} Name</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Contract Amount</TableHead>
            <TableHead className="text-right">Talent Clients</TableHead>
            <TableHead>Close Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deals.map((deal) => (
            <TableRow
              key={deal.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                {deal.Name}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={`${getStageColor(deal.StageName)} text-xs`}>
                  {deal.StageName || 'N/A'}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  {formatCurrency(deal.Amount ? Number(deal.Amount) : 0)}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                {formatCurrency(deal.Contract_Amount__c ? Number(deal.Contract_Amount__c) : 0)}
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-1">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  {deal.clients?.length || 0}
                </div>
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
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewDeal(deal.id)
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
  )
}
