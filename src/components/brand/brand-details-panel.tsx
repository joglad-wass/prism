'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Building2, User, Building, DollarSign, TrendingUp, Activity, ExternalLink, X } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import Image from 'next/image'
import { useLabels } from '../../hooks/useLabels'

interface BrandDetailsPanelProps {
  brand: {
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
    lastActivity?: string
  } | null
  emptyMessage: string
  formatCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  getTypeVariant: (type: string) => 'default' | 'secondary'
  onClose?: () => void
}

export function BrandDetailsPanel({
  brand,
  emptyMessage,
  formatCurrency,
  formatDate,
  getStatusVariant,
  getTypeVariant,
  onClose,
}: BrandDetailsPanelProps) {
  const { labels } = useLabels()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {brand ? (
              <Link
                href={`/brands/${brand.id}`}
                className="hover:text-primary hover:underline flex items-center gap-2"
              >
                <Building2 className="h-5 w-5" />
                {brand.name}
              </Link>
            ) : (
              emptyMessage
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {brand && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/brands/${brand.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Link>
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!brand ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Brand Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Brand Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Brand Name</div>
                  <div className="text-sm font-medium">
                    <Link
                      href={`/brands/${brand.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {brand.name}
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge variant={getStatusVariant(brand.status)} className="text-xs">
                    {brand.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Type</div>
                  <Badge variant={getTypeVariant(brand.type)} className="text-xs">
                    {brand.type}
                  </Badge>
                </div>
                {brand.altName && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Also Known As</div>
                    <div className="text-sm font-medium">{brand.altName}</div>
                  </div>
                )}
                {brand.industry && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Industry</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Building className="h-3 w-3" />
                      {brand.industry}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Currency</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <DollarSign className="h-3 w-3" />
                    {brand.currency}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Owner</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <User className="h-3 w-3" />
                    {brand.owner?.name || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Business Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Business Metrics</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Building2 className="h-4 w-4" />
                    Total {labels.deals}
                  </div>
                  <div className="text-2xl font-bold">{brand.dealCount || 0}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Active {labels.deals}
                  </div>
                  <div className="text-2xl font-bold">{brand.activeDeals || 0}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Total Contracted
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(brand.totalContracted)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Image
                      src={isDark ? "/logo_dark.png" : "/logo.png"}
                      alt="Wasserman Logo"
                      width={32}
                      height={32}
                      className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                      priority
                    />
                    Projected Revenue
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(brand.projectedRevenue)}
                  </div>
                </div>
              </div>
            </div>

            {brand.lastActivity && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Activity</h3>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      Last Activity
                    </div>
                    <div className="text-sm font-medium">{formatDate(brand.lastActivity)}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
