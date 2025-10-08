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
import { TalentQuickView, TalentQuickViewData } from './talent-quick-view'
import { ExternalLink, MapPin } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface TalentTableViewProps {
  talents: Array<{
    id: string
    Name: string
    category?: string
    status: string
    isNil?: boolean
    location?: string
    sport?: string
    team?: string
    costCenter?: string
    dealCount?: number
    totalRevenue?: number
    wassRevenue?: number
    lastDealDate?: string
    LastActivityDate?: string
    agents?: {
      isPrimary: boolean
      agent: {
        name: string
      }
    }[]
  }>
  formatDate: (dateString?: string) => string
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  formatCurrency: (amount?: number) => string
}

export function TalentTableView({
  talents,
  formatDate,
  getStatusVariant,
  formatCurrency,
}: TalentTableViewProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [quickViewTalent, setQuickViewTalent] = useState<TalentQuickViewData | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleRowClick = (talent: any) => {
    setQuickViewTalent({
      id: talent.id,
      name: talent.Name,
      agents: talent.agents,
      costCenter: talent.costCenter,
      sport: talent.sport,
      team: talent.team,
      category: talent.category,
      status: talent.status,
      dealCount: talent.dealCount,
      totalRevenue: talent.totalRevenue,
      wassRevenue: talent.wassRevenue,
      lastActivity: talent.lastDealDate || talent.LastActivityDate,
      location: talent.location,
      isNil: talent.isNil,
    })
    setQuickViewOpen(true)
  }

  const handleViewProfile = (talentId: string) => {
    router.push(`/talent/${talentId}`)
  }

  return (
    <>
      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>{labels.agent}</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead>Sport</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">{labels.deals}</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {talents.map((talent) => (
              <TableRow
                key={talent.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(talent)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {talent.Name}
                    {talent.isNil && (
                      <Badge variant="secondary" className="text-xs">
                        NIL
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(talent.status)} className="text-xs">
                    {talent.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {talent.category && (
                    <Badge variant="outline" className="text-xs">
                      {talent.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {talent.agents?.find(ta => ta.isPrimary)?.agent?.name ||
                   talent.agents?.[0]?.agent?.name ||
                   <span className="text-muted-foreground">No agent</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {talent.costCenter || '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {talent.sport || '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {talent.team || '-'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {talent.location ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {talent.location}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {talent.dealCount || 0}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {formatCurrency(talent.totalRevenue)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                  {formatCurrency(talent.wassRevenue)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(talent.lastDealDate || talent.LastActivityDate)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewProfile(talent.id)
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

      <TalentQuickView
        talent={quickViewTalent}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onViewProfile={handleViewProfile}
      />
    </>
  )
}
