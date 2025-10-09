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
import { DollarSign, Calendar, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLabels } from '../../hooks/useLabels'

interface BrandTalentTableViewProps {
  talentClients: Array<{
    client: {
      id: string
      Name: string
      Client_Category__c?: string
    }
    dealCount: number
    totalRevenue: number
  }>
  formatCurrency: (amount?: number) => string
}

export function BrandTalentTableView({
  talentClients,
  formatCurrency,
}: BrandTalentTableViewProps) {
  const { labels } = useLabels()
  const router = useRouter()

  const handleViewTalent = (talentId: string) => {
    router.push(`/talent/${talentId}`)
  }

  return (
    <div className="relative w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Talent Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right"># of {labels.deals}</TableHead>
            <TableHead className="text-right">Total Revenue</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {talentClients.map((talentClient) => (
            <TableRow
              key={talentClient.client.id}
              className="cursor-pointer hover:bg-muted/50"
            >
              <TableCell className="font-medium">
                {talentClient.client.Name}
              </TableCell>
              <TableCell>
                {talentClient.client.Client_Category__c ? (
                  <Badge variant="outline" className="text-xs">
                    {talentClient.client.Client_Category__c}
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                {talentClient.dealCount}
              </TableCell>
              <TableCell className="text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-1">
                  <DollarSign className="h-3 w-3 text-muted-foreground" />
                  {formatCurrency(talentClient.totalRevenue)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewTalent(talentClient.client.id)
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
