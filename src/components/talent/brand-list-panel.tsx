'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Building, DollarSign, Briefcase } from 'lucide-react'

interface BrandListPanelProps {
  brandGroups: Array<{
    brand: string
    brandId?: string
    deals: any[]
    totalRevenue: number
    wassermanRevenue: number
  }>
  selectedBrand: string | null
  onBrandClick: (brand: string) => void
  formatCurrency: (amount?: number) => string
}

export function BrandListPanel({
  brandGroups,
  selectedBrand,
  onBrandClick,
  formatCurrency,
}: BrandListPanelProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Brands ({brandGroups.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {brandGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No brands found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {brandGroups.map((group) => (
              <div
                key={group.brand}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedBrand === group.brand
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onBrandClick(group.brand)}
              >
                {group.brandId ? (
                  <Link
                    href={`/brands/${group.brandId}`}
                    className="font-medium text-sm mb-2 hover:text-primary hover:underline inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {group.brand}
                  </Link>
                ) : (
                  <div className="font-medium text-sm mb-2">{group.brand}</div>
                )}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    <span>{group.deals.length} deal{group.deals.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>{formatCurrency(group.totalRevenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
