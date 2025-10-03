'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import {
  Building,
  Calendar,
  DollarSign,
  ExternalLink,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DealDetailsPanelProps {
  selectedDeal: any | null
  selectedProduct: any | null
  defaultDeal: any | null
  emptyMessage: string
  onBackToDeal: () => void
  formatCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
}

export function DealDetailsPanel({
  selectedDeal,
  selectedProduct,
  defaultDeal,
  emptyMessage,
  onBackToDeal,
  formatCurrency,
  formatDate,
}: DealDetailsPanelProps) {
  const router = useRouter()

  const activeDeal = selectedDeal || defaultDeal

  // Helper function to determine payment status
  const getPaymentStatus = (schedule: any) => {
    if (schedule.WD_Payment_Status__c?.toLowerCase() === 'paid') {
      return { label: 'Paid', variant: 'default', className: 'bg-green-100 text-green-800' }
    }
    if (schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') {
      return { label: 'Invoiced', variant: 'secondary', className: '' }
    }
    return { label: 'Pending', variant: 'outline', className: '' }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {selectedProduct
              ? selectedProduct.Project_Deliverables__c || selectedProduct.Product_Name__c || 'Deliverable Details'
              : activeDeal
                ? activeDeal.name
                : emptyMessage}
          </CardTitle>
          {selectedProduct && (
            <Button variant="outline" size="sm" onClick={onBackToDeal}>
              Back to Deal
            </Button>
          )}
          {!selectedProduct && activeDeal && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/deals/${activeDeal.id}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {selectedProduct ? (
          /* Deliverable Details View */
          <div className="space-y-6">
            {/* Deliverable Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Deliverable Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {selectedProduct.Project_Deliverables__c && (
                  <div className="col-span-2">
                    <div className="text-sm text-muted-foreground mb-1">Project Deliverables</div>
                    <div className="text-sm font-medium">{selectedProduct.Project_Deliverables__c}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Product Name</div>
                  <div className="text-sm font-medium">{selectedProduct.Product_Name__c || 'N/A'}</div>
                </div>
                {selectedProduct.ProductCode && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Product Code</div>
                    <div className="text-sm font-medium">{selectedProduct.ProductCode}</div>
                  </div>
                )}
                {selectedProduct.TotalPrice && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                    <div className="text-sm font-medium">{formatCurrency(Number(selectedProduct.TotalPrice))}</div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Associated Deal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Associated Deal</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Deal Name</div>
                  <div className="text-sm font-medium">{selectedProduct.deal.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Brand</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Building className="h-3 w-3" />
                    {selectedProduct.deal.brandId ? (
                      <Link
                        href={`/brands/${selectedProduct.deal.brandId}`}
                        className="hover:text-primary hover:underline"
                      >
                        {selectedProduct.deal.brand}
                      </Link>
                    ) : (
                      <span>{selectedProduct.deal.brand}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Schedules as Cards */}
            {(() => {
              const deliverableSchedules = selectedProduct.schedules || []

              return deliverableSchedules.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Payment Schedules ({deliverableSchedules.length})</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {deliverableSchedules.map((schedule: any) => {
                      const paymentStatus = getPaymentStatus(schedule)
                      return (
                        <Card key={schedule.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{formatDate(schedule.ScheduleDate)}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Revenue</span>
                                <span className="font-medium">{formatCurrency(schedule.Revenue ? Number(schedule.Revenue) : 0)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Talent</span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                  {formatCurrency(schedule.Talent_Invoice_Line_Amount__c ? Number(schedule.Talent_Invoice_Line_Amount__c) : 0)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Wasserman</span>
                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                  {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c ? Number(schedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={paymentStatus.variant as any} className={`text-xs ${paymentStatus.className}`}>
                                  {paymentStatus.label}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No payment schedules for this deliverable</p>
                </div>
              )
            })()}
          </div>
        ) : !activeDeal ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          /* Deal Details View */
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Deal Amount
                </div>
                <div className="text-2xl font-bold">{formatCurrency(activeDeal.amount)}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Talent Amount
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(activeDeal.talentAmount)}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Wasserman Amount
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(activeDeal.wassermanAmount)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Deal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Deal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Brand</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Building className="h-3 w-3" />
                    {activeDeal.brandId ? (
                      <Link
                        href={`/brands/${activeDeal.brandId}`}
                        className="hover:text-primary hover:underline"
                      >
                        {activeDeal.brand}
                      </Link>
                    ) : (
                      <span>{activeDeal.brand}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Stage</div>
                  <Badge variant="outline">{activeDeal.stage}</Badge>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Close Date</div>
                  <div className="text-sm font-medium">{formatDate(activeDeal.closeDate)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Owner</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <UserIcon className="h-3 w-3" />
                    {activeDeal.owner}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Split Percentage</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    {Number(activeDeal.splitPercent)}%
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Schedules */}
            {activeDeal.schedules && activeDeal.schedules.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Payment Schedules ({activeDeal.schedules.length})</h3>
                <div className="space-y-2">
                  {activeDeal.schedules.map((schedule: any) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(schedule.ScheduleDate)}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Revenue</div>
                          <div className="font-medium">{formatCurrency(schedule.Revenue ? Number(schedule.Revenue) : 0)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Talent</div>
                          <div className="font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(schedule.Talent_Invoice_Line_Amount__c ? Number(schedule.Talent_Invoice_Line_Amount__c) : 0)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Wasserman</div>
                          <div className="font-medium text-orange-600 dark:text-orange-400">
                            {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c ? Number(schedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
