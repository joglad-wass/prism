'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Building, DollarSign, TrendingUp, Briefcase, Mail } from 'lucide-react'

interface BrandDetailsPanelProps {
  brandGroup: {
    brand: string
    brandId?: string
    type?: string
    status?: string
    industry?: string
    ownerEmail?: string
    ownerName?: string
    deals: any[]
    totalRevenue: number
    talentRevenue: number
    wassermanRevenue: number
  } | null
  emptyMessage: string
  formatCurrency: (amount?: number) => string
}

export function BrandDetailsPanel({
  brandGroup,
  emptyMessage,
  formatCurrency,
}: BrandDetailsPanelProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>
          {brandGroup ? (
            brandGroup.brandId ? (
              <>
                <Link
                  href={`/brands/${brandGroup.brandId}`}
                  className="hover:text-primary hover:underline"
                >
                  {brandGroup.brand}
                </Link>
                {' - Deal Summary'}
              </>
            ) : (
              `${brandGroup.brand} - Deal Summary`
            )
          ) : (
            emptyMessage
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!brandGroup ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brand Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Building className="h-4 w-4" />
                Brand Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Brand Name</div>
                  <div className="text-sm font-medium">
                    {brandGroup.brandId ? (
                      <Link
                        href={`/brands/${brandGroup.brandId}`}
                        className="hover:text-primary hover:underline"
                      >
                        {brandGroup.brand}
                      </Link>
                    ) : (
                      brandGroup.brand
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Deals</div>
                  <div className="text-sm font-medium flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {brandGroup.deals.length}
                  </div>
                </div>
                {brandGroup.status && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Status</div>
                    <Badge variant={brandGroup.status.toLowerCase() === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {brandGroup.status}
                    </Badge>
                  </div>
                )}
                {brandGroup.type && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Type</div>
                    <div className="text-sm font-medium">{brandGroup.type}</div>
                  </div>
                )}
                {brandGroup.industry && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Industry</div>
                    <div className="text-sm font-medium">{brandGroup.industry}</div>
                  </div>
                )}
                {brandGroup.ownerEmail && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Owner</div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{brandGroup.ownerName || brandGroup.ownerEmail}</span>
                      {brandGroup.ownerName && (
                        <span className="text-muted-foreground">({brandGroup.ownerEmail})</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Revenue Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Revenue Details</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(brandGroup.totalRevenue)}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Talent Revenue
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(brandGroup.talentRevenue)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Wasserman Revenue
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(brandGroup.wassermanRevenue)}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Deals List */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Associated Deals</h3>
              <div className="space-y-2">
                {brandGroup.deals.map((deal) => (
                  <div key={deal.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-sm">{deal.name}</div>
                      <div className="text-sm font-semibold">{formatCurrency(deal.amount)}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                      <div>
                        <div className="text-muted-foreground">Stage</div>
                        <div className="font-medium text-foreground">{deal.stage}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Talent</div>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(deal.talentAmount)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Wasserman</div>
                        <div className="font-medium text-orange-600 dark:text-orange-400">
                          {formatCurrency(deal.wassermanAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
