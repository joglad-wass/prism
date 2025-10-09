'use client'

import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Separator } from '../ui/separator'
import {
  Briefcase,
  DollarSign,
  User,
  Building,
  Calendar,
  Package,
  Clock,
  Percent,
  FileText,
  Users,
} from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface Product {
  id: string
  productName: string
  productCode: string
  unitPrice: string
  quantity: string
  totalPrice: string
  deliverables: string
  startDate: string
  endDate: string
  division: string
}

interface Schedule {
  id: string
  productId?: string
  description: string
  scheduleDate: string
  revenue: string
  paymentTerms: string
  type: string
  splitPercent: string
  talentAmount: string
  commissionAmount: string
  billable: boolean
  agentSplits?: Record<string, string>
}

interface DealCreationSummaryProps {
  dealName: string
  stage: string
  amount: string
  contractAmount: string
  splitPercent: string
  selectedBrandName: string
  selectedOwnerName: string
  selectedAdditionalAgents: Array<{ id: string; name: string }>
  products: Product[]
  schedules: Schedule[]
  attachments: Array<{ file: File; description: string }>
  contractStartDate: string
  contractEndDate: string
  closeDate: string
  agentSplits: Record<string, string>
  splitOnScheduleBasis: boolean
}

export function DealCreationSummary({
  dealName,
  stage,
  amount,
  contractAmount,
  splitPercent,
  selectedBrandName,
  selectedOwnerName,
  selectedAdditionalAgents,
  products,
  schedules,
  attachments,
  contractStartDate,
  contractEndDate,
  closeDate,
  agentSplits,
  splitOnScheduleBasis,
}: DealCreationSummaryProps) {
  const { labels } = useLabels()

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

  const formatCurrency = (value?: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (!numValue || isNaN(numValue)) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const totalProductValue = products.reduce(
    (sum, p) => sum + (parseFloat(p.totalPrice) || 0),
    0
  )

  const totalScheduleRevenue = schedules.reduce(
    (sum, s) => sum + (parseFloat(s.revenue) || 0),
    0
  )

  // Calculate commission and talent amounts from actual schedules (more accurate)
  const totalScheduleCommission = schedules.reduce(
    (sum, s) => sum + (parseFloat(s.commissionAmount) || 0),
    0
  )

  const totalScheduleTalent = schedules.reduce(
    (sum, s) => sum + (parseFloat(s.talentAmount) || 0),
    0
  )

  // Use schedule totals if we have schedules, otherwise calculate from deal-level split %
  const commissionAmount = schedules.length > 0
    ? totalScheduleCommission
    : (amount ? parseFloat(amount) * (parseFloat(splitPercent) / 100 || 0) : 0)

  const talentAmount = schedules.length > 0
    ? totalScheduleTalent
    : (amount ? parseFloat(amount) - commissionAmount : 0)

  const allAgents = [
    ...(selectedOwnerName ? [{ id: 'owner', name: selectedOwnerName }] : []),
    ...selectedAdditionalAgents,
  ]

  return (
    <div className="sticky top-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5" />
            {labels.deal} Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Deal Name & Stage */}
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {labels.deal} Name
              </p>
              <p className="text-sm font-semibold truncate">
                {dealName || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Stage</p>
              <Badge variant={getStageVariant(stage)} className="text-xs">
                {stage.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Financial Details
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">{labels.deal} Amount</span>
              </div>
              <span className="text-sm font-semibold">
                {formatCurrency(amount)}
              </span>
            </div>

            {contractAmount && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">Contract Amount</span>
                </div>
                <span className="text-sm font-semibold">
                  {formatCurrency(contractAmount)}
                </span>
              </div>
            )}

            {splitPercent && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">Split %</span>
                  </div>
                  <span className="text-sm font-semibold">{splitPercent}%</span>
                </div>
                {amount && (
                  <>
                    <div className="flex items-center justify-between pl-5">
                      <span className="text-xs text-muted-foreground">
                        Commission
                      </span>
                      <span className="text-xs font-medium text-green-600">
                        {formatCurrency(commissionAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pl-5">
                      <span className="text-xs text-muted-foreground">Talent</span>
                      <span className="text-xs font-medium">
                        {formatCurrency(talentAmount)}
                      </span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <Separator />

          {/* Relationships */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Relationships
            </h4>

            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs">Brand</span>
              </div>
              <span className="text-xs font-medium text-right truncate">
                {selectedBrandName || (
                  <span className="text-muted-foreground italic">Not selected</span>
                )}
              </span>
            </div>

            {selectedOwnerName && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs">Primary {labels.agent}</span>
                </div>
                <span className="text-xs font-medium text-right truncate">
                  {selectedOwnerName}
                </span>
              </div>
            )}

            {selectedAdditionalAgents.length > 0 && (
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs">Additional {labels.agents}</span>
                </div>
                <span className="text-xs font-medium">
                  {selectedAdditionalAgents.length}
                </span>
              </div>
            )}
          </div>

          {/* Agent Splits */}
          {allAgents.length > 1 && Object.keys(agentSplits).length > 0 && !splitOnScheduleBasis && (
            <>
              <Separator />
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {labels.agent} Splits
                </h4>
                {allAgents.map((agent) => {
                  const agentId = agent.id === 'owner' ?
                    Object.keys(agentSplits).find(id => !selectedAdditionalAgents.some(a => a.id === id)) :
                    agent.id
                  const split = agentId ? agentSplits[agentId] : undefined

                  if (!split) return null

                  const splitAmount = commissionAmount * (parseFloat(split) / 100)

                  return (
                    <div key={agent.id} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1 mr-2">{agent.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-medium">{split}%</span>
                        <span className="text-muted-foreground">
                          ({formatCurrency(splitAmount)})
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">Total</span>
                    <span className={`font-bold ${
                      Math.abs(Object.values(agentSplits).reduce((sum, val) =>
                        sum + (parseFloat(val) || 0), 0
                      ) - 100) > 0.01 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {Object.values(agentSplits).reduce((sum, val) =>
                        sum + (parseFloat(val) || 0), 0
                      ).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Products & Schedules */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Products & Schedules
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Products</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{products.length}</span>
                {products.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(totalProductValue)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs">Schedules</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{schedules.length}</span>
                {schedules.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(totalScheduleRevenue)}
                  </p>
                )}
              </div>
            </div>

            {splitOnScheduleBasis && schedules.length > 0 && (
              <div className="pl-5 pt-1">
                <p className="text-xs text-muted-foreground italic">
                  Splits managed per schedule
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Important Dates
            </h4>

            {contractStartDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">Start Date</span>
                </div>
                <span className="text-xs font-medium">
                  {formatDate(contractStartDate)}
                </span>
              </div>
            )}

            {contractEndDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">End Date</span>
                </div>
                <span className="text-xs font-medium">
                  {formatDate(contractEndDate)}
                </span>
              </div>
            )}

            {closeDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs">Close Date</span>
                </div>
                <span className="text-xs font-medium">
                  {formatDate(closeDate)}
                </span>
              </div>
            )}

            {!contractStartDate && !contractEndDate && !closeDate && (
              <p className="text-xs text-muted-foreground italic">No dates set</p>
            )}
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Attachments
                </h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs">Files</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {attachments.length}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
