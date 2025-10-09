'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  CreditCard,
  Calendar,
  FileText,
  Loader2,
  Hash,
  Banknote,
  DollarSign,
  Receipt,
  Package
} from 'lucide-react'
import { Deal, Payment, PaymentRemittance } from '../../types'
import { usePaymentsByDeal } from '../../hooks/usePayments'
import { DealPaymentsTableView } from './deal-payments-table-view'
import { ViewToggle } from '../talent/view-toggle'

interface DealPaymentsProps {
  deal: Deal
  highlightedPaymentId?: string
  onNavigateToSchedule?: (scheduleId: string) => void
  onNavigateToProduct?: (productId: string) => void
}

export function DealPayments({ deal, highlightedPaymentId, onNavigateToSchedule, onNavigateToProduct }: DealPaymentsProps) {
  const { data: payments, isLoading } = usePaymentsByDeal(deal.id)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const router = useRouter()

  // Initialize view from localStorage
  const [view, setView] = useState<'modular' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('deal-payments-view-preference')
      return (savedView === 'table' ? 'table' : 'modular') as 'modular' | 'table'
    }
    return 'modular'
  })

  // Save view preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('deal-payments-view-preference', view)
  }, [view])

  // Handle highlighted payment from external navigation (e.g., from products tab)
  useEffect(() => {
    if (highlightedPaymentId && payments) {
      const payment = payments.find(p => p.id === highlightedPaymentId)
      if (payment) {
        setSelectedPayment(payment)
      }
    }
  }, [highlightedPaymentId, payments])

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPaymentStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>

    switch (status.toLowerCase()) {
      case 'complete':
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Complete</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScheduleStatusBadge = (schedule: any) => {
    const status = schedule.WD_Payment_Status__c?.toLowerCase()

    if (status === 'paid') {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Paid</Badge>
    }
    if (schedule.WD_Invoice_ID__c) {
      return <Badge variant="secondary">Invoiced</Badge>
    }
    return <Badge variant="outline">Pending</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payment data...</span>
        </div>
      </div>
    )
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No Payments Found</h3>
            <p className="text-muted-foreground">
              No payments have been linked to this deal's schedules yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Auto-select first payment if none selected
  const activePayment = selectedPayment || payments[0]

  const handlePaymentClick = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  // Table view
  if (view === 'table') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payments ({payments.length})</h2>
            <p className="text-sm text-muted-foreground">All payments linked to this deal</p>
          </div>
          <ViewToggle view={view} onViewChange={setView} />
        </div>
        <Card>
          <CardContent className="pt-6">
            <DealPaymentsTableView
              payments={payments}
              onPaymentClick={handlePaymentClick}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              getPaymentStatusBadge={getPaymentStatusBadge}
            />
          </CardContent>
        </Card>
        {/* Payment Details Panel - shown when a payment is clicked in table view */}
        {selectedPayment && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment #{selectedPayment.paymentNumber || selectedPayment.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {selectedPayment.paymentType} • {formatDate(selectedPayment.paymentDate)}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(selectedPayment.paymentAmount)}
                  </div>
                  {getPaymentStatusBadge(selectedPayment.paymentStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Details Grid */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Payment Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Banknote className="h-3 w-3" />
                      Currency
                    </p>
                    <p className="font-medium text-sm">{selectedPayment.paymentCurrency}</p>
                  </div>
                  {selectedPayment.paymentApplicationStatus && (
                    <div>
                      <p className="text-sm text-muted-foreground">Application Status</p>
                      <p className="font-medium text-sm">{selectedPayment.paymentApplicationStatus}</p>
                    </div>
                  )}
                  {selectedPayment.checkNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Check Number
                      </p>
                      <p className="font-medium text-sm">{selectedPayment.checkNumber}</p>
                    </div>
                  )}
                  {selectedPayment.companyReferenceId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Company Reference</p>
                      <p className="font-medium text-xs break-all">{selectedPayment.companyReferenceId}</p>
                    </div>
                  )}
                  {selectedPayment.customerId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Customer ID</p>
                      <p className="font-medium text-sm">{selectedPayment.customerId}</p>
                    </div>
                  )}
                  {selectedPayment.paymentMemo && (
                    <div className="col-span-2 md:col-span-3">
                      <p className="text-sm text-muted-foreground">Memo</p>
                      <p className="font-medium text-sm">{selectedPayment.paymentMemo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Flags */}
              {(selectedPayment.lockedInWorkday || selectedPayment.doNotApplyToInvoicesOnHold || selectedPayment.showOnlyMatchedInvoices || selectedPayment.currencyRateManualOverride) && (
                <div className="flex flex-wrap gap-2">
                  {selectedPayment.lockedInWorkday && (
                    <Badge variant="outline" className="text-xs">
                      Locked in Workday
                    </Badge>
                  )}
                  {selectedPayment.doNotApplyToInvoicesOnHold && (
                    <Badge variant="outline" className="text-xs">
                      Skip Invoices on Hold
                    </Badge>
                  )}
                  {selectedPayment.showOnlyMatchedInvoices && (
                    <Badge variant="outline" className="text-xs">
                      Matched Invoices Only
                    </Badge>
                  )}
                  {selectedPayment.currencyRateManualOverride && (
                    <Badge variant="outline" className="text-xs">
                      Manual Currency Rate
                    </Badge>
                  )}
                </div>
              )}

              {/* Payment Remittances */}
              {selectedPayment.paymentRemittances && selectedPayment.paymentRemittances.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Payment Remittances ({selectedPayment.paymentRemittances.length})
                  </h3>
                  <div className="space-y-4">
                    {selectedPayment.paymentRemittances.map((remittance: PaymentRemittance) => {
                      // Get the first schedule's invoice ID if available
                      const invoiceId = remittance.schedules?.[0]?.WD_Invoice_ID__c

                      // Group schedules by product and use all product schedules
                      const productMap = new Map<string, { product: any; schedules: any[]; paidScheduleIds: Set<string> }>()

                      remittance.schedules?.forEach((schedule) => {
                        if (schedule.product && schedule.allProductSchedules) {
                          const productId = schedule.product.id
                          if (!productMap.has(productId)) {
                            productMap.set(productId, {
                              product: schedule.product,
                              schedules: schedule.allProductSchedules, // Use all schedules for this product
                              paidScheduleIds: new Set()
                            })
                          }
                          // Track which schedule has the payment applied to it
                          productMap.get(productId)!.paidScheduleIds.add(schedule.id)
                        }
                      })

                      const linkedProducts = Array.from(productMap.values())

                      return (
                        <div key={remittance.id} className="border rounded-lg p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {invoiceId && (
                              <div>
                                <p className="text-sm text-muted-foreground">Invoice ID</p>
                                <p className="font-medium text-sm font-mono">{invoiceId}</p>
                              </div>
                            )}
                            {remittance.amountToPay !== undefined && (
                              <div>
                                <p className="text-sm text-muted-foreground">Invoice Amount Remaining to Pay</p>
                                <p className="font-semibold text-orange-600 dark:text-orange-400">
                                  {formatCurrency(remittance.amountToPay)}
                                </p>
                              </div>
                            )}
                            {remittance.billToCustomerId && (
                              <div>
                                <p className="text-sm text-muted-foreground">Bill To Customer</p>
                                <p className="font-medium text-sm">{remittance.billToCustomerId}</p>
                              </div>
                            )}
                          </div>

                        {/* Linked Products */}
                        {linkedProducts.length > 0 && (
                          <div className="pt-4 border-t">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Linked Products ({linkedProducts.length})
                            </h4>
                            <div className="space-y-4">
                              {linkedProducts.map(({ product, schedules, paidScheduleIds }) => {
                                // Calculate total product amount from all schedules
                                const totalAmount = schedules.reduce((sum, s) => sum + (parseFloat(s.Revenue || '0')), 0)
                                const totalCommission = schedules.reduce((sum, s) => sum + (parseFloat(s.Wasserman_Invoice_Line_Amount__c || '0')), 0)

                                return (
                                  <div key={product.id} className="border rounded-lg overflow-hidden">
                                    {/* Product Card Header - Clickable */}
                                    <div
                                      className="bg-muted/50 p-4 hover:bg-muted/70 cursor-pointer transition-colors"
                                      onClick={() => {
                                        if (onNavigateToProduct) {
                                          onNavigateToProduct(product.id)
                                        }
                                      }}
                                    >
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                            <h5 className="font-semibold text-sm truncate">{product.Product_Name__c}</h5>
                                          </div>
                                          {product.ProductCode && (
                                            <p className="text-xs text-muted-foreground mt-1">Code: {product.ProductCode}</p>
                                          )}
                                          <div className="flex items-center gap-4 mt-2 text-xs">
                                            <div>
                                              <span className="text-muted-foreground">Total Revenue: </span>
                                              <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(totalAmount)}</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">Total Commission: </span>
                                              <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(totalCommission)}</span>
                                            </div>
                                          </div>
                                        </div>
                                        {product.UnitPrice && (
                                          <div className="text-right flex-shrink-0">
                                            <div className="text-xs text-muted-foreground">Unit Price</div>
                                            <div className="text-sm font-medium">{formatCurrency(product.UnitPrice)}</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Schedules Sub-items */}
                                    <div className="p-3 bg-background space-y-2">
                                      <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Schedules ({schedules.length})
                                      </div>
                                      {schedules.map((schedule) => {
                                        const isPaidSchedule = paidScheduleIds.has(schedule.id)

                                        return (
                                          <div
                                            key={schedule.id}
                                            className={`p-3 rounded flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors ${
                                              isPaidSchedule ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' : 'bg-muted/30'
                                            }`}
                                            onClick={() => {
                                              if (onNavigateToSchedule) {
                                                onNavigateToSchedule(schedule.id)
                                              }
                                            }}
                                          >
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2">
                                                {isPaidSchedule && (
                                                  <CreditCard className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                )}
                                                {schedule.WD_Invoice_ID__c && (
                                                  <Receipt className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                                )}
                                                {schedule.WD_Payment_Status__c?.toLowerCase() === 'paid' && (
                                                  <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                                                )}
                                                <p className="font-medium text-sm">{formatDate(schedule.ScheduleDate || '')}</p>
                                                {isPaidSchedule && (
                                                  <Badge variant="outline" className="text-xs ml-2">Payment Applied</Badge>
                                                )}
                                              </div>
                                            {schedule.Description && (
                                              <p className="text-xs text-muted-foreground mt-1">{schedule.Description}</p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs">
                                              <div>
                                                <span className="text-muted-foreground">Revenue: </span>
                                                <span className="font-medium">{formatCurrency(schedule.Revenue || 0)}</span>
                                              </div>
                                              {schedule.Wasserman_Invoice_Line_Amount__c !== undefined && (
                                                <div>
                                                  <span className="text-muted-foreground">Commission: </span>
                                                  <span className="font-medium">{formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c)}</span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="ml-4">
                                            {getScheduleStatusBadge(schedule)}
                                          </div>
                                        </div>
                                      )
                                    })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Modular view (default)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Payments ({payments.length})</h2>
          <p className="text-sm text-muted-foreground">All payments linked to this deal</p>
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Payments List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payments ({payments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`p-3 border rounded-lg transition-colors cursor-pointer ${
                  activePayment?.id === payment.id
                    ? 'bg-primary/10 border-primary'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedPayment(payment)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      Payment #{payment.paymentNumber || payment.id.slice(0, 8)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(payment.paymentDate)}
                    </div>
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                      {formatCurrency(payment.paymentAmount)}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getPaymentStatusBadge(payment.paymentStatus)}
                  </div>
                </div>
                {payment.paymentType && (
                  <div className="text-xs text-muted-foreground mt-2">
                    {payment.paymentType}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right: Payment Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment #{activePayment.paymentNumber || activePayment.id.slice(0, 8)}
              </CardTitle>
              <CardDescription className="mt-1">
                {activePayment.paymentType} • {formatDate(activePayment.paymentDate)}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(activePayment.paymentAmount)}
              </div>
              {getPaymentStatusBadge(activePayment.paymentStatus)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Details Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Payment Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Banknote className="h-3 w-3" />
                  Currency
                </p>
                <p className="font-medium text-sm">{activePayment.paymentCurrency}</p>
              </div>
              {activePayment.paymentApplicationStatus && (
                <div>
                  <p className="text-sm text-muted-foreground">Application Status</p>
                  <p className="font-medium text-sm">{activePayment.paymentApplicationStatus}</p>
                </div>
              )}
              {activePayment.checkNumber && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    Check Number
                  </p>
                  <p className="font-medium text-sm">{activePayment.checkNumber}</p>
                </div>
              )}
              {activePayment.companyReferenceId && (
                <div>
                  <p className="text-sm text-muted-foreground">Company Reference</p>
                  <p className="font-medium text-xs break-all">{activePayment.companyReferenceId}</p>
                </div>
              )}
              {activePayment.customerId && (
                <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-medium text-sm">{activePayment.customerId}</p>
                </div>
              )}
              {activePayment.paymentMemo && (
                <div className="col-span-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">Memo</p>
                  <p className="font-medium text-sm">{activePayment.paymentMemo}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Flags */}
          {(activePayment.lockedInWorkday || activePayment.doNotApplyToInvoicesOnHold || activePayment.showOnlyMatchedInvoices || activePayment.currencyRateManualOverride) && (
            <div className="flex flex-wrap gap-2">
              {activePayment.lockedInWorkday && (
                <Badge variant="outline" className="text-xs">
                  Locked in Workday
                </Badge>
              )}
              {activePayment.doNotApplyToInvoicesOnHold && (
                <Badge variant="outline" className="text-xs">
                  Skip Invoices on Hold
                </Badge>
              )}
              {activePayment.showOnlyMatchedInvoices && (
                <Badge variant="outline" className="text-xs">
                  Matched Invoices Only
                </Badge>
              )}
              {activePayment.currencyRateManualOverride && (
                <Badge variant="outline" className="text-xs">
                  Manual Currency Rate
                </Badge>
              )}
            </div>
          )}

          {/* Payment Remittances */}
          {activePayment.paymentRemittances && activePayment.paymentRemittances.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payment Remittances ({activePayment.paymentRemittances.length})
              </h3>
              <div className="space-y-4">
                {activePayment.paymentRemittances.map((remittance: PaymentRemittance) => {
                  // Get the first schedule's invoice ID if available
                  const invoiceId = remittance.schedules?.[0]?.WD_Invoice_ID__c

                  // Group schedules by product and use all product schedules
                  const productMap = new Map<string, { product: any; schedules: any[]; paidScheduleIds: Set<string> }>()

                  remittance.schedules?.forEach((schedule) => {
                    if (schedule.product && schedule.allProductSchedules) {
                      const productId = schedule.product.id
                      if (!productMap.has(productId)) {
                        productMap.set(productId, {
                          product: schedule.product,
                          schedules: schedule.allProductSchedules, // Use all schedules for this product
                          paidScheduleIds: new Set()
                        })
                      }
                      // Track which schedule has the payment applied to it
                      productMap.get(productId)!.paidScheduleIds.add(schedule.id)
                    }
                  })

                  const linkedProducts = Array.from(productMap.values())

                  return (
                    <div key={remittance.id} className="border rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {invoiceId && (
                          <div>
                            <p className="text-sm text-muted-foreground">Invoice ID</p>
                            <p className="font-medium text-sm font-mono">{invoiceId}</p>
                          </div>
                        )}
                        {remittance.amountToPay !== undefined && (
                          <div>
                            <p className="text-sm text-muted-foreground">Invoice Amount Remaining to Pay</p>
                            <p className="font-semibold text-orange-600 dark:text-orange-400">
                              {formatCurrency(remittance.amountToPay)}
                            </p>
                          </div>
                        )}
                        {remittance.billToCustomerId && (
                          <div>
                            <p className="text-sm text-muted-foreground">Bill To Customer</p>
                            <p className="font-medium text-sm">{remittance.billToCustomerId}</p>
                          </div>
                        )}
                      </div>

                    {/* Linked Products */}
                    {linkedProducts.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Linked Products ({linkedProducts.length})
                        </h4>
                        <div className="space-y-4">
                          {linkedProducts.map(({ product, schedules, paidScheduleIds }) => {
                            // Calculate total product amount from all schedules
                            const totalAmount = schedules.reduce((sum, s) => sum + (parseFloat(s.Revenue || '0')), 0)
                            const totalCommission = schedules.reduce((sum, s) => sum + (parseFloat(s.Wasserman_Invoice_Line_Amount__c || '0')), 0)

                            return (
                              <div key={product.id} className="border rounded-lg overflow-hidden">
                                {/* Product Card Header - Clickable */}
                                <div
                                  className="bg-muted/50 p-4 hover:bg-muted/70 cursor-pointer transition-colors"
                                  onClick={() => {
                                    if (onNavigateToProduct) {
                                      onNavigateToProduct(product.id)
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                        <h5 className="font-semibold text-sm truncate">{product.Product_Name__c}</h5>
                                      </div>
                                      {product.ProductCode && (
                                        <p className="text-xs text-muted-foreground mt-1">Code: {product.ProductCode}</p>
                                      )}
                                      <div className="flex items-center gap-4 mt-2 text-xs">
                                        <div>
                                          <span className="text-muted-foreground">Total Revenue: </span>
                                          <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(totalAmount)}</span>
                                        </div>
                                        <div>
                                          <span className="text-muted-foreground">Total Commission: </span>
                                          <span className="font-semibold text-blue-600 dark:text-blue-400">{formatCurrency(totalCommission)}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {product.UnitPrice && (
                                      <div className="text-right flex-shrink-0">
                                        <div className="text-xs text-muted-foreground">Unit Price</div>
                                        <div className="text-sm font-medium">{formatCurrency(product.UnitPrice)}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Schedules Sub-items */}
                                <div className="p-3 bg-background space-y-2">
                                  <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Schedules ({schedules.length})
                                  </div>
                                  {schedules.map((schedule) => {
                                    const isPaidSchedule = paidScheduleIds.has(schedule.id)

                                    return (
                                      <div
                                        key={schedule.id}
                                        className={`p-3 rounded flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors ${
                                          isPaidSchedule ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' : 'bg-muted/30'
                                        }`}
                                        onClick={() => {
                                          if (onNavigateToSchedule) {
                                            onNavigateToSchedule(schedule.id)
                                          }
                                        }}
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            {isPaidSchedule && (
                                              <CreditCard className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                            )}
                                            {schedule.WD_Invoice_ID__c && (
                                              <Receipt className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                            )}
                                            {schedule.WD_Payment_Status__c?.toLowerCase() === 'paid' && (
                                              <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                                            )}
                                            <p className="font-medium text-sm">{formatDate(schedule.ScheduleDate || '')}</p>
                                            {isPaidSchedule && (
                                              <Badge variant="outline" className="text-xs ml-2">Payment Applied</Badge>
                                            )}
                                          </div>
                                        {schedule.Description && (
                                          <p className="text-xs text-muted-foreground mt-1">{schedule.Description}</p>
                                        )}
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                          <div>
                                            <span className="text-muted-foreground">Revenue: </span>
                                            <span className="font-medium">{formatCurrency(schedule.Revenue || 0)}</span>
                                          </div>
                                          {schedule.Wasserman_Invoice_Line_Amount__c !== undefined && (
                                            <div>
                                              <span className="text-muted-foreground">Commission: </span>
                                              <span className="font-medium">{formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c)}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        {getScheduleStatusBadge(schedule)}
                                      </div>
                                    </div>
                                  )
                                })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
