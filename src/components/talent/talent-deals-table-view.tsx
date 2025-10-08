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
import { DollarSign, Building, Calendar, User as UserIcon, Percent, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TalentDealsTableViewProps {
  deals: Array<{
    id: string
    name: string
    brand: string
    brandId?: string
    company: string
    amount: number
    talentAmount: number
    wassermanAmount: number
    splitPercent: number
    status: string
    startDate: string
    closeDate: string
    owner: string
    stage: string
  }>
  formatCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline'
}

export function TalentDealsTableView({
  deals,
  formatCurrency,
  formatDate,
  getStatusVariant,
}: TalentDealsTableViewProps) {
  const router = useRouter()

  const handleViewDeal = (dealId: string) => {
    router.push(`/deals/${dealId}`)
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Deal Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead className="text-right">Deal Amount</TableHead>
            <TableHead className="text-right">Talent Revenue</TableHead>
            <TableHead className="text-right">Wass Revenue</TableHead>
            <TableHead className="text-right">Split %</TableHead>
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
                {deal.name}
              </TableCell>
              <TableCell className="text-sm">
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3 text-muted-foreground" />
                  {deal.brand}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {deal.stage}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-3 w-3 text-muted-foreground" />
                  {deal.owner}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  {formatCurrency(deal.amount)}
                </div>
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-green-600 dark:text-green-400">
                {formatCurrency(deal.talentAmount)}
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                {formatCurrency(deal.wassermanAmount)}
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-1">
                  <Percent className="h-3 w-3 text-muted-foreground" />
                  {Number(deal.splitPercent)}%
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(deal.closeDate)}
                </div>
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
