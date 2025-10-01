'use client'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Separator } from '../ui/separator'
import {
  Briefcase,
  DollarSign,
  User,
  Building,
  Calendar,
  Target,
  Package,
  Clock,
  Percent
} from 'lucide-react'

export interface DealQuickViewData {
  id: string
  Name: string
  Status__c: string
  StageName: string
  amount?: number
  Contract_Amount__c?: number
  Talent_Marketing_Fee_Percentage__c?: number
  closeDate?: string
  division?: string
  Account_Industry__c?: string
  Account_Name__c?: string
  Owner_Workday_Cost_Center__c?: string
  Licence_Holder_Name__c?: string
  brand?: {
    name: string
  }
  owner?: {
    name: string
    email: string
  }
  products?: Array<any>
  _count?: {
    schedules: number
  }
}

interface DealQuickViewProps {
  deal: DealQuickViewData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewDetails?: (dealId: string) => void
}

export function DealQuickView({ deal, open, onOpenChange, onViewDetails }: DealQuickViewProps) {
  if (!deal) return null

  const getStageVariant = (stage: string) => {
    switch (stage) {
      case 'CLOSED_WON':
        return 'default'
      case 'CLOSED_LOST':
        return 'destructive'
      case 'NEGOTIATION':
        return 'secondary'
      case 'PROPOSAL':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
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
            <Briefcase className="h-5 w-5" />
            {deal.Name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status and Stage */}
          <div className="flex items-center justify-between">
            <Badge variant={getStageVariant(deal.StageName)}>
              {deal.StageName}
            </Badge>
            {deal.Account_Industry__c && (
              <span className="text-xs text-muted-foreground">
                {deal.Account_Industry__c}
              </span>
            )}
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Financial Details</h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Deal Amount</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(deal.Amount)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Contract Amount</span>
              </div>
              <span className="text-sm font-semibold">{formatCurrency(deal.Contract_Amount__c)}</span>
            </div>

            {deal.Talent_Marketing_Fee_Percentage__c && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Marketing Fee</span>
                </div>
                <span className="text-sm font-semibold">{deal.Talent_Marketing_Fee_Percentage__c}%</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Account & Owner Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Account & Owner</h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Brand/Account</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {deal.brand?.name || deal.Account_Name__c || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Owner</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {deal.owner?.name || deal.Licence_Holder_Name__c || 'Unassigned'}
              </span>
            </div>

            {deal.Owner_Workday_Cost_Center__c && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Cost Center</span>
                </div>
                <span className="text-sm text-muted-foreground">{deal.Owner_Workday_Cost_Center__c}</span>
              </div>
            )}

            {deal.division && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Division</span>
                </div>
                <span className="text-sm text-muted-foreground">{deal.division}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Products & Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Products & Timeline</h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Products</span>
              </div>
              <span className="text-sm font-semibold">{deal.products?.length || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Schedules</span>
              </div>
              <span className="text-sm font-semibold">{deal._count?.schedules || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Close Date</span>
              </div>
              <span className="text-sm text-muted-foreground">{formatDate(deal.CloseDate)}</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                onViewDetails?.(deal.id)
                onOpenChange(false)
              }}
            >
              View Deal Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}