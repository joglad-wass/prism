'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  CreditCard,
  Calendar,
  FileText,
  Loader2,
  Building2,
  Hash,
  Banknote,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Deal } from '../../types'

interface DealPaymentsProps {
  deal: Deal
}

interface Payment {
  id: string
  workdayReferenceId: string
  paymentNumber: string
  paymentAmount: string
  paymentDate: string
  paymentCurrency: string
  paymentCurrencyNumericCode: string
  paymentType: string
  paymentStatus: string
  paymentApplicationStatus: string
  paymentMemo?: string
  checkNumber?: string
  companyReferenceId: string
  companyWid: string
  customerReferenceId: string
  customerWid: string
  customerId: string
  invoiceCurrency: string
  invoiceCurrencyNumericCode: string
  customerDepositReferenceId?: string
  customerDepositWid?: string
  lockedInWorkday: boolean
  readyToAutoApply: boolean
  doNotApplyToInvoicesOnHold: boolean
  showOnlyMatchedInvoices: boolean
  currencyRateManualOverride: boolean
  paymentRemittances: PaymentRemittance[]
}

interface PaymentRemittance {
  id: string
  customerInvoiceReferenceId: string
  customerInvoiceWid: string
  amountToPay: string
  amountToPayInInvoiceCurrency: string
  billToCustomerReferenceId: string
  billToCustomerWid: string
  billToCustomerId: string
  schedules: Schedule[]
}

interface Schedule {
  id: string
  name: string
  amount: string
  ScheduleDate: string
  scheduleStatus: string
  paymentStatus: string
  WD_Invoice_Reference_ID__c?: string
}

export function DealPayments({ deal }: DealPaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPayments, setExpandedPayments] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true)

        // First, fetch schedules for this deal to get their invoice reference IDs
        const schedulesResponse = await fetch(`http://localhost:3001/api/schedules/by-deal/${deal.id}`)
        const schedulesData = await schedulesResponse.json()
        const schedules = schedulesData.data || []

        // Get all invoice reference IDs from schedules
        const invoiceRefIds = schedules
          .filter(s => s.WD_Invoice_Reference_ID__c)
          .map(s => s.WD_Invoice_Reference_ID__c)

        if (invoiceRefIds.length === 0) {
          setPayments([])
          return
        }

        // Fetch all payments and filter those with matching remittances
        const paymentsResponse = await fetch(`http://localhost:3001/api/payments`)
        const paymentsData = await paymentsResponse.json()
        const allPayments = paymentsData.data || []

        // Filter payments that have remittances matching our deal's schedule invoice references
        const relatedPayments = allPayments.filter(payment =>
          payment.paymentRemittances.some(remittance =>
            invoiceRefIds.includes(remittance.customerInvoiceReferenceId)
          )
        )

        setPayments(relatedPayments)
      } catch (error) {
        console.error('Error fetching payment data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [deal.id])

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

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'complete':
        return <Badge variant="default" className="bg-green-100 text-green-800">Complete</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getScheduleStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>
      case 'sent_to_workday':
        return <Badge variant="outline">Sent to Workday</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const togglePaymentExpanded = (paymentId: string) => {
    setExpandedPayments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(paymentId)) {
        newSet.delete(paymentId)
      } else {
        newSet.add(paymentId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading payment data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {payments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No Payments Found</h3>
              <p className="text-muted-foreground">
                No payments have been linked to this deal yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {payments.map((payment) => {
            const isExpanded = expandedPayments.has(payment.id)
            return (
              <Card key={payment.id} className="hover:shadow-md transition-shadow">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => togglePaymentExpanded(payment.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment #{payment.paymentNumber}
                      </CardTitle>
                      <CardDescription>
                        {payment.paymentType} • {formatDate(payment.paymentDate)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(payment.paymentAmount)}
                        </div>
                        {getPaymentStatusBadge(payment.paymentStatus)}
                      </div>
                      <Button variant="ghost" size="sm">
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="space-y-6">
                {/* Payment Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Banknote className="h-3 w-3" />
                      Currency
                    </p>
                    <p className="font-medium">{payment.paymentCurrency} ({payment.paymentCurrencyNumericCode})</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Application Status</p>
                    <p className="font-medium">{payment.paymentApplicationStatus}</p>
                  </div>
                  {payment.checkNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Check Number
                      </p>
                      <p className="font-medium">{payment.checkNumber}</p>
                    </div>
                  )}
                  {payment.paymentMemo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Memo</p>
                      <p className="font-medium">{payment.paymentMemo}</p>
                    </div>
                  )}
                </div>

                {/* Workday References */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Workday Reference
                    </p>
                    <p className="font-medium text-xs">{payment.workdayReferenceId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company Reference</p>
                    <p className="font-medium text-xs">{payment.companyReferenceId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-medium">{payment.customerId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Reference</p>
                    <p className="font-medium text-xs">{payment.customerReferenceId}</p>
                  </div>
                  {payment.customerDepositReferenceId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Deposit Reference</p>
                      <p className="font-medium text-xs">{payment.customerDepositReferenceId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Invoice Currency</p>
                    <p className="font-medium">{payment.invoiceCurrency} ({payment.invoiceCurrencyNumericCode})</p>
                  </div>
                </div>

                {/* Payment Flags */}
                <div className="flex flex-wrap gap-2">
                  {payment.lockedInWorkday && (
                    <Badge variant="outline" className="text-xs">
                      Locked in Workday
                    </Badge>
                  )}
                  {payment.readyToAutoApply && (
                    <Badge variant="outline" className="text-xs">
                      Ready to Auto Apply
                    </Badge>
                  )}
                  {payment.doNotApplyToInvoicesOnHold && (
                    <Badge variant="outline" className="text-xs">
                      Skip Invoices on Hold
                    </Badge>
                  )}
                  {payment.showOnlyMatchedInvoices && (
                    <Badge variant="outline" className="text-xs">
                      Matched Invoices Only
                    </Badge>
                  )}
                  {payment.currencyRateManualOverride && (
                    <Badge variant="outline" className="text-xs">
                      Manual Currency Rate
                    </Badge>
                  )}
                </div>

                {/* Payment Remittances */}
                {payment.paymentRemittances.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Payment Remittances ({payment.paymentRemittances.length})
                    </h4>
                    <div className="space-y-4">
                      {payment.paymentRemittances.map((remittance) => (
                        <div key={remittance.id} className="border rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Invoice Reference</p>
                              <p className="font-medium text-sm">{remittance.customerInvoiceReferenceId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Amount to Pay</p>
                              <p className="font-semibold text-green-600">
                                {formatCurrency(remittance.amountToPay)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Bill To Customer</p>
                              <p className="font-medium">{remittance.billToCustomerId}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Invoice WID</p>
                              <p className="font-medium text-xs">{remittance.customerInvoiceWid}</p>
                            </div>
                          </div>

                          {/* Linked Schedules */}
                          {remittance.schedules.length > 0 && (
                            <div className="mt-4 pt-4 border-t">
                              <h5 className="font-medium mb-2 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Linked Schedules ({remittance.schedules.length})
                              </h5>
                              <div className="space-y-2">
                                {remittance.schedules.map((schedule) => (
                                  <div key={schedule.id} className="bg-muted p-3 rounded">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="font-medium text-sm">{schedule.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Due: {formatDate(schedule.ScheduleDate)}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-sm">
                                          {formatCurrency(schedule.amount)}
                                        </p>
                                        <div className="flex gap-1 mt-1">
                                          {getScheduleStatusBadge(schedule.scheduleStatus)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <span className="text-muted-foreground">Payment Status:</span>
                                        <span className="ml-1 font-medium">{schedule.paymentStatus}</span>
                                      </div>
                                      {schedule.WD_Invoice_Reference_ID__c && (
                                        <div>
                                          <span className="text-muted-foreground">Invoice Ref:</span>
                                          <span className="ml-1 font-medium text-xs">
                                            {schedule.WD_Invoice_Reference_ID__c}
                                          </span>
                                        </div>
                                      )}
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
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}