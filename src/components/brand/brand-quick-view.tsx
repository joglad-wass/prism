'use client'

import { useEffect, useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Separator } from '../ui/separator'
import { Building2, User, Building, DollarSign, TrendingUp, Activity } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import Image from 'next/image'

export interface BrandQuickViewData {
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
}

interface BrandQuickViewProps {
  brand: BrandQuickViewData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewProfile?: (brandId: string) => void
}

export function BrandQuickView({ brand, open, onOpenChange, onViewProfile }: BrandQuickViewProps) {
  if (!brand) return null

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
        return 'secondary'
      case 'PROSPECT':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getTypeVariant = (type: string) => {
    return type === 'AGENCY' ? 'secondary' : 'default'
  }

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {brand.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(brand.status)}>
                {brand.status}
              </Badge>
              <Badge variant={getTypeVariant(brand.type)}>
                {brand.type}
              </Badge>
            </div>

            {brand.altName && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Also known as: {brand.altName}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Brand Details */}
          <div className="space-y-3">
            {brand.industry && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Industry</span>
                </div>
                <span className="text-sm text-muted-foreground">{brand.industry}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Owner</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {brand.owner?.name || 'Unassigned'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Currency</span>
              </div>
              <span className="text-sm text-muted-foreground">{brand.currency}</span>
            </div>
          </div>

          <Separator />

          {/* Business Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Deals</span>
              <span className="text-sm font-semibold">{brand.dealCount || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Deals</span>
              </div>
              <span className="text-sm font-semibold">{brand.activeDeals || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Contracted</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(brand.totalContracted)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={isDark ? "/logo_dark.png" : "/logo.png"}
                  alt="Wasserman Logo"
                  width={32}
                  height={32}
                  className="h-4 w-4 object-contain dark:brightness-0 dark:invert"
                  priority
                />
                <span className="text-sm font-medium">Projected Revenue</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(brand.projectedRevenue)}</span>
            </div>

            {brand.lastActivity && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last Activity</span>
                </div>
                <span className="text-sm text-muted-foreground">{formatDate(brand.lastActivity)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                onViewProfile?.(brand.id)
                onOpenChange(false)
              }}
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
