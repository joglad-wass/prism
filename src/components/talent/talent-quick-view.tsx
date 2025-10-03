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
import { User, Building, Target, Trophy, DollarSign, Activity, SquareMenu, MapPin } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import Image from 'next/image'
import { useLabels } from '../../hooks/useLabels'

export interface TalentQuickViewData {
  id: string
  name: string
  agents?: {
    isPrimary: boolean
    agent: {
      name: string
    }
  }[] | null
  costCenter?: string
  sport?: string
  team?: string
  category?: string
  status: string
  dealCount?: number
  totalRevenue?: number
  wassRevenue?: number
  lastActivity?: string
  location?: string
  isNil?: boolean
}

interface TalentQuickViewProps {
  talent: TalentQuickViewData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewProfile?: (talentId: string) => void
}

export function TalentQuickView({ talent, open, onOpenChange, onViewProfile }: TalentQuickViewProps) {
  if (!talent) return null

  const { labels } = useLabels()
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && (theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches))


  const getStatusVariant = (status: string) => {
    const lowercaseStatus = status?.toLowerCase()
    if (lowercaseStatus?.includes('active') || lowercaseStatus?.includes('current')) {
      return 'default'
    }
    if (lowercaseStatus?.includes('retired') || lowercaseStatus?.includes('ended')) {
      return 'outline'
    }
    return 'secondary'
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
            <User className="h-5 w-5" />
            {talent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {/* <span className="text-sm font-medium">Status</span> */}
              <Badge variant={getStatusVariant(talent.status)}>
                {talent.status}
              </Badge>
            </div>

            {talent.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{talent.location}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Professional Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{labels.agent}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {talent.agents?.find(ta => ta.isPrimary)?.agent?.name || talent.agents?.[0]?.agent?.name || 'No agent assigned'}
              </span>
            </div>

            {talent.costCenter && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Cost Center</span>
                </div>
                <span className="text-sm text-muted-foreground">{talent.costCenter}</span>
              </div>
            )}

            {talent.team && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sport</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {talent.team}
                </span>
              </div>
            )}

            {talent.category && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SquareMenu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <span className="text-sm text-muted-foreground">{talent.category}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Business Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{labels.deal} Count</span>
              <span className="text-sm font-semibold">{talent.dealCount || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(talent.totalRevenue)}</span>
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
                <span className="text-sm font-medium">Wass Revenue</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(talent.wassRevenue)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Activity</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatDate(talent.lastActivity)}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                onViewProfile?.(talent.id)
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