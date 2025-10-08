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
import { ChevronDown, ChevronRight, DollarSign, Calendar, Receipt, Users, Package, Edit } from 'lucide-react'
import { Product, Schedule } from '../../../types'
import { ScheduleQuickView } from '../schedule-quick-view'

interface GroupedTableViewProps {
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

export function GroupedTableView({
  products,
  formatCurrency,
  formatDate,
  getPaymentStatus,
  calculateSplitPercentage,
  onEditSchedule,
  onEditProduct,
  onNavigateToPayment,
  getNumericValue,
}: GroupedTableViewProps) {
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(() => {
    // Auto-expand all products on load
    return new Set(products.map(p => p.id))
  })
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

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
              <TableHead className="w-[40px]"></TableHead>
              <TableHead className="min-w-[250px]">Product / Schedule</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead className="text-right">Price / Revenue</TableHead>
              <TableHead className="text-right">Commission</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead className="text-right">Schedules</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const isExpanded = expandedProducts.has(product.id)
              const productSchedules = product.schedules || []
              const totalPrice = getNumericValue(product.TotalPrice ?? product.UnitPrice)
              const totalCommission = productSchedules.reduce((sum, schedule) => {
                return sum + getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
              }, 0)

              return (
                <React.Fragment key={product.id}>
                  {/* Product Row */}
                  <TableRow
                    className="font-medium bg-muted/30 hover:bg-muted/50"
                  >
                    <TableCell>
                      {productSchedules.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProductExpansion(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {product.Project_Deliverables__c || product.Product_Name__c || 'Untitled Product'}
                          </div>
                          {product.Description && (
                            <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                              {product.Description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.ProductCode && (
                        <Badge variant="outline" className="text-xs">
                          {product.ProductCode}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(totalPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-orange-600 dark:text-orange-400">
                      {formatCurrency(totalCommission)}
                    </TableCell>
                    <TableCell>
                      {productSchedules.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {productSchedules.filter(s => s.WD_Payment_Status__c?.toLowerCase() === 'paid').length} paid
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {productSchedules.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {onEditProduct && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditProduct(product)
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Schedule Rows (when expanded) */}
                  {isExpanded && productSchedules.map((schedule: any) => {
                    const isPaid = schedule.WD_Payment_Status__c?.toLowerCase() === 'paid'
                    const isInvoiced = schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== ''
                    const paymentStatus = getPaymentStatus(schedule)
                    const scheduleRevenue = getNumericValue(schedule.Revenue)
                    const commissionAmount = getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)

                    return (
                      <TableRow
                        key={schedule.id}
                        className="cursor-pointer hover:bg-muted/50 bg-background"
                        onClick={() => handleScheduleClick(schedule, product)}
                      >
                        <TableCell></TableCell>
                        <TableCell className="pl-12">
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
                            <div className="text-sm">
                              <div className="font-medium">{formatDate(schedule.ScheduleDate)}</div>
                              {schedule.Type && (
                                <div className="text-xs text-muted-foreground">{schedule.Type}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {schedule.Description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {schedule.Description}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          <div className="font-medium">{formatCurrency(scheduleRevenue)}</div>
                          <div className="text-xs text-muted-foreground">
                            {calculateSplitPercentage(commissionAmount, scheduleRevenue)}% split
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-orange-600 dark:text-orange-400">
                          {formatCurrency(commissionAmount)}
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
                        <TableCell></TableCell>
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
