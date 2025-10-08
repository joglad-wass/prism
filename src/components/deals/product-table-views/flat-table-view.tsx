'use client'

import React, { useState } from 'react'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'
import { DollarSign, Calendar, Receipt, Users, Package, Edit } from 'lucide-react'
import { Product, Schedule } from '../../../types'
import { ScheduleQuickView } from '../schedule-quick-view'

interface FlatTableViewProps {
  products: Product[]
  formatCurrency: (amount?: number | string) => string
  formatDate: (dateString?: string) => string
  getPaymentStatus: (schedule: any) => { label: string; variant: 'default' | 'secondary' | 'outline'; className: string }
  calculateSplitPercentage: (wassermanAmount?: number, revenue?: number) => number
  onEditSchedule?: (schedule: Schedule) => void
  onEditProduct?: (product: Product) => void
  onNavigateToPayment?: (paymentId: string) => void
  getNumericValue: (value?: number | string | null) => number
}

export function FlatTableView({
  products,
  formatCurrency,
  formatDate,
  getPaymentStatus,
  calculateSplitPercentage,
  onEditSchedule,
  onEditProduct,
  onNavigateToPayment,
  getNumericValue,
}: FlatTableViewProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleScheduleClick = (schedule: any, product: Product) => {
    setSelectedSchedule(schedule)
    setSelectedProduct(product)
    setQuickViewOpen(true)
  }

  return (
    <>
      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[250px]">Schedule Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead className="text-right">Split %</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Agents</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const productSchedules = product.schedules || []
              const totalPrice = getNumericValue(product.TotalPrice ?? product.UnitPrice)
              const totalCommission = productSchedules.reduce((sum, schedule) => {
                return sum + getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
              }, 0)

              return (
                <React.Fragment key={product.id}>
                  {/* Product Header Row (Sticky) */}
                  <TableRow
                    className="bg-muted/50 font-semibold sticky top-0 z-10 border-b-2"
                  >
                    <TableCell colSpan={9}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {product.Project_Deliverables__c || product.Product_Name__c || 'Untitled Product'}
                          </span>
                          {product.ProductCode && (
                            <Badge variant="outline" className="text-xs">
                              {product.ProductCode}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="text-muted-foreground">
                              Price: <span className="text-foreground font-medium">{formatCurrency(totalPrice)}</span>
                            </div>
                            <div className="text-orange-600 dark:text-orange-400">
                              Commission: <span className="font-medium">{formatCurrency(totalCommission)}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {productSchedules.length} schedules
                            </Badge>
                          </div>
                          {onEditProduct && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditProduct(product)
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Schedule Rows */}
                  {productSchedules.map((schedule: any) => {
                    const isPaid = schedule.WD_Payment_Status__c?.toLowerCase() === 'paid'
                    const isInvoiced = schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== ''
                    const paymentStatus = getPaymentStatus(schedule)
                    const scheduleRevenue = getNumericValue(schedule.Revenue)
                    const commissionAmount = getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
                    const splitPercentage = calculateSplitPercentage(commissionAmount, scheduleRevenue)

                    return (
                      <TableRow
                        key={schedule.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleScheduleClick(schedule, product)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {isInvoiced && (
                                <Receipt className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              )}
                              {isPaid && (
                                <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <div className="font-medium">{formatDate(schedule.ScheduleDate)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {schedule.Type && (
                            <Badge variant="outline" className="text-xs">
                              {schedule.Type}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {product.Project_Deliverables__c || product.Product_Name__c || 'Untitled Product'}
                          </div>
                          {schedule.Description && (
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                              {schedule.Description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {product.ProductCode && (
                            <Badge variant="outline" className="text-xs">
                              {product.ProductCode}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(scheduleRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-orange-600 dark:text-orange-400">
                          {formatCurrency(commissionAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm font-medium">
                            {splitPercentage}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentStatus.variant} className={`text-xs ${paymentStatus.className}`}>
                            {paymentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {schedule.agentSplits && schedule.agentSplits.length > 0 && (
                            <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {schedule.agentSplits.length}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <ScheduleQuickView
        schedule={selectedSchedule}
        product={selectedProduct}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onEdit={onEditSchedule}
        onViewPayment={onNavigateToPayment}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getPaymentStatus={getPaymentStatus}
        calculateSplitPercentage={calculateSplitPercentage}
      />
    </>
  )
}
