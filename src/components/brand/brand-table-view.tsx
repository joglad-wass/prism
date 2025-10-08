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
import { BrandQuickView, BrandQuickViewData } from './brand-quick-view'
import { ExternalLink, Building } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface BrandTableViewProps {
  brands: Array<{
    id: string
    name: string
    altName?: string
    status: string
    type: string
    industry?: string
    currency: string
    owner?: {
      name: string
    }
    dealCount?: number
    activeDeals?: number
    totalContracted?: number
    projectedRevenue?: number
    updatedAt?: string
  }>
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  getTypeVariant: (type: string) => 'default' | 'secondary'
  formatCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
}

export function BrandTableView({
  brands,
  getStatusVariant,
  getTypeVariant,
  formatCurrency,
  formatDate,
}: BrandTableViewProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [quickViewBrand, setQuickViewBrand] = useState<BrandQuickViewData | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleRowClick = (brand: any) => {
    setQuickViewBrand({
      id: brand.id,
      name: brand.name,
      altName: brand.altName,
      status: brand.status,
      type: brand.type,
      industry: brand.industry,
      currency: brand.currency,
      owner: brand.owner,
      dealCount: brand.dealCount,
      activeDeals: brand.activeDeals,
      totalContracted: brand.totalContracted,
      projectedRevenue: brand.projectedRevenue,
      lastActivity: brand.updatedAt,
    })
    setQuickViewOpen(true)
  }

  const handleViewProfile = (brandId: string) => {
    router.push(`/brands/${brandId}`)
  }

  return (
    <>
      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead>Alt Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead className="text-right">Total {labels.deals}</TableHead>
              <TableHead className="text-right">Active {labels.deals}</TableHead>
              <TableHead className="text-right">Total Contracted</TableHead>
              <TableHead className="text-right">Projected Revenue</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow
                key={brand.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(brand)}
              >
                <TableCell className="font-medium">
                  {brand.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {brand.altName || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(brand.status)} className="text-xs">
                    {brand.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getTypeVariant(brand.type)} className="text-xs">
                    {brand.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {brand.industry ? (
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {brand.industry}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  {brand.owner?.name || <span className="text-muted-foreground">Unassigned</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {brand.currency}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {brand.dealCount || 0}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {brand.activeDeals || 0}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  {formatCurrency(brand.totalContracted)}
                </TableCell>
                <TableCell className="text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                  {formatCurrency(brand.projectedRevenue)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(brand.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewProfile(brand.id)
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

      <BrandQuickView
        brand={quickViewBrand}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onViewProfile={handleViewProfile}
      />
    </>
  )
}
