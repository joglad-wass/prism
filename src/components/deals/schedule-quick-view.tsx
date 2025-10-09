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
import { Calendar, DollarSign, Users, Receipt, Edit, CreditCard, ExternalLink } from 'lucide-react'

interface ScheduleQuickViewProps {
  schedule: any | null
  product: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (schedule: any) => void
  onViewPayment?: (paymentId: string) => void
  formatCurrency: (amount?: number | string) => string
  formatDate: (dateString?: string) => string
  getPaymentStatus: (schedule: any) => { label: string; variant: 'default' | 'secondary' | 'outline'; className: string }
  calculateSplitPercentage: (wassermanAmount?: number, revenue?: number) => number
}

export function ScheduleQuickView({
  schedule,
  product,
  open,
  onOpenChange,
  onEdit,
  onViewPayment,
  formatCurrency,
  formatDate,
  getPaymentStatus,
  calculateSplitPercentage,
}: ScheduleQuickViewProps) {
  if (!schedule) return null

  const paymentStatus = getPaymentStatus(schedule)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule: {formatDate(schedule.ScheduleDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          {product && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Product</div>
              <div className="font-medium">{product.Project_Deliverables__c || product.Product_Name__c || 'Untitled Product'}</div>
            </div>
          )}

          {/* Schedule Financial Summary */}
          <div className="p-4 border rounded-lg space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-lg">{formatDate(schedule.ScheduleDate)}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue</span>
                <span className="font-medium text-sm">{formatCurrency(schedule.Revenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Split %</span>
                <span className="font-medium text-sm">
                  {calculateSplitPercentage(Number(schedule.Wasserman_Invoice_Line_Amount__c || 0), Number(schedule.Revenue || 0))}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Talent</span>
                <span className="font-medium text-sm text-green-600 dark:text-green-400">
                  {formatCurrency(schedule.Talent_Invoice_Line_Amount__c)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Commission</span>
                <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                  {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Schedule Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Type</div>
                <div className="text-sm font-medium">{schedule.Type || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Billable</div>
                <Badge variant={schedule.Active__c ? 'default' : 'secondary'} className="text-xs">
                  {schedule.Active__c ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Payment Terms</div>
                <div className="text-sm font-medium">{schedule.WD_Payment_Term__c || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Payment Status</div>
                <Badge variant={paymentStatus.variant} className={`text-xs ${paymentStatus.className}`}>
                  {paymentStatus.label}
                </Badge>
              </div>
              {schedule.WD_Invoice_ID__c && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Invoice ID</div>
                  <div className="text-xs font-mono">{schedule.WD_Invoice_ID__c}</div>
                </div>
              )}
              {schedule.WD_PO_Number__c && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">PO Number</div>
                  <div className="text-xs font-mono">{schedule.WD_PO_Number__c}</div>
                </div>
              )}
            </div>
            {schedule.Description && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Description</div>
                <div className="text-sm">{schedule.Description}</div>
              </div>
            )}
          </div>

          <Separator />

          {/* Agent Splits */}
          {schedule.agentSplits && schedule.agentSplits.length > 0 && (
            <>
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Commission Splits ({schedule.agentSplits.length})
                </h3>
                <div className="space-y-2">
                  {schedule.agentSplits.map((split: any, idx: number) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Agent/Agency</div>
                          <div className="font-medium">{split.agentName || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Split %</div>
                          <div className="font-medium">{split.splitPercent}%</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Amount</div>
                          <div className="font-medium">{formatCurrency(split.splitAmount)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Payment Details */}
          {schedule.paymentRemittance?.payment && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Details
                  </h3>
                  {onViewPayment && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => onViewPayment(schedule.paymentRemittance.payment.id)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Payment Number</div>
                    <div className="text-sm font-medium">
                      {schedule.paymentRemittance.payment.paymentNumber || schedule.paymentRemittance.payment.id.slice(0, 8)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Payment Amount</div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(schedule.paymentRemittance.payment.paymentAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Payment Date</div>
                    <div className="text-sm font-medium">
                      {formatDate(schedule.paymentRemittance.payment.paymentDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Payment Status</div>
                    <Badge variant="outline" className="text-xs">
                      {schedule.paymentRemittance.payment.paymentStatus || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  onEdit(schedule)
                  onOpenChange(false)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Schedule
              </Button>
            )}
            {schedule.Active__c && (
              <Button variant="outline" size="sm" className="flex-1">
                <Receipt className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
