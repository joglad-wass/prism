'use client'

import { useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { ExternalLink, Calendar, Hash, Receipt } from 'lucide-react'
import { Payment } from '../../types'

interface DealPaymentsTableViewProps {
  payments: Payment[]
  onPaymentClick: (payment: Payment) => void
  formatCurrency: (amount: string | number) => string
  formatDate: (dateString: string) => string
  getPaymentStatusBadge: (status?: string) => JSX.Element
}

export function DealPaymentsTableView({
  payments,
  onPaymentClick,
  formatCurrency,
  formatDate,
  getPaymentStatusBadge,
}: DealPaymentsTableViewProps) {
  return (
    <div className="relative w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[150px]">Payment Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>Check Number</TableHead>
            <TableHead>Application Status</TableHead>
            <TableHead className="text-right">Remittances</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => {
            const remittanceCount = payment.paymentRemittances?.length || 0

            return (
              <TableRow
                key={payment.id}
                className="cursor-pointer"
                onClick={() => onPaymentClick(payment)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-1">
                    <Receipt className="h-3 w-3 text-muted-foreground" />
                    #{payment.paymentNumber || payment.id.slice(0, 8)}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    {formatDate(payment.paymentDate)}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payment.paymentType || '-'}
                </TableCell>
                <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(payment.paymentAmount)}
                </TableCell>
                <TableCell>
                  {getPaymentStatusBadge(payment.paymentStatus)}
                </TableCell>
                <TableCell className="text-sm">
                  {payment.paymentCurrency}
                </TableCell>
                <TableCell className="text-sm">
                  {payment.checkNumber ? (
                    <div className="flex items-center gap-1">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      {payment.checkNumber}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {payment.paymentApplicationStatus || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {remittanceCount > 0 ? (
                    <Badge variant="outline" className="text-xs">
                      {remittanceCount}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPaymentClick(payment)
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
