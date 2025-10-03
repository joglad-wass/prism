'use client'

import Link from 'next/link'
import { Badge } from '../ui/badge'
import { Building, DollarSign } from 'lucide-react'

interface BrandListPanelProps {
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
  }>
  selectedBrandId: string | null
  onBrandClick: (brandId: string) => void
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  getTypeVariant: (type: string) => 'default' | 'secondary'
}

export function BrandListPanel({
  brands,
  selectedBrandId,
  onBrandClick,
  getStatusVariant,
  getTypeVariant,
}: BrandListPanelProps) {
  return (
    <div className={selectedBrandId ? 'lg:col-span-1' : ''}>
      <div className={`space-y-2 ${selectedBrandId ? '' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}`}>
        {brands.map((brand) => (
          <div
            key={brand.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedBrandId === brand.id
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onBrandClick(brand.id)}
          >
            <Link
              href={`/brands/${brand.id}`}
              className="font-medium text-sm mb-2 hover:text-primary hover:underline inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              {brand.name}
            </Link>
            {brand.altName && (
              <div className="text-xs text-muted-foreground mb-2">
                {brand.altName}
              </div>
            )}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant={getStatusVariant(brand.status)} className="text-xs">
                {brand.status}
              </Badge>
              <Badge variant={getTypeVariant(brand.type)} className="text-xs">
                {brand.type}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              {brand.industry && (
                <div className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {brand.industry}
                </div>
              )}
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {brand.currency}
              </div>
              <div>
                Owner: {brand.owner?.name || 'Unassigned'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
