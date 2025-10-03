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
  Receipt
} from 'lucide-react'
import { Deal, Payment, PaymentRemittance } from '../../types'
import { usePaymentsByDeal } from '../../hooks/usePayments'

interface DealPaymentsProps {
  deal: Deal
  highlightedPaymentId?: string
  onNavigateToSchedule?: (scheduleId: string) => void
}

export function DealPayments({ deal, highlightedPaymentId, onNavigateToSchedule }: DealPaymentsProps) {
  const { data: payments, isLoading } = usePaymentsByDeal(deal.id)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const router = useRouter()

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

  return (
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
                {activePayment.paymentRemittances.map((remittance: PaymentRemittance) => (
                  <div key={remittance.id} className="border rounded-lg p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {remittance.amountToPay !== undefined && (
                        <div>
                          <p className="text-sm text-muted-foreground">Amount to Pay</p>
                          <p className="font-semibold text-green-600 dark:text-green-400">
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

                    {/* Linked Schedules */}
                    {remittance.schedules && remittance.schedules.length > 0 && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Linked Schedules ({remittance.schedules.length})
                        </h4>
                        <div className="space-y-2">
                          {remittance.schedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="bg-muted p-3 rounded flex items-center justify-between hover:bg-muted/70 cursor-pointer transition-colors"
                              onClick={() => {
                                if (onNavigateToSchedule) {
                                  onNavigateToSchedule(schedule.id)
                                }
                              }}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {schedule.WD_Invoice_ID__c && (
                                    <Receipt className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                  )}
                                  {schedule.WD_Payment_Status__c?.toLowerCase() === 'paid' && (
                                    <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                                  )}
                                  <p className="font-medium text-sm">{formatDate(schedule.ScheduleDate || '')}</p>
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
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
