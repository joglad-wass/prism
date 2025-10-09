'use client'

import { useState } from 'react'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardHeader } from '../../ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'
import { DollarSign, Calendar, Receipt, Users, Package, Edit, Trash2 } from 'lucide-react'
import { Product, Schedule } from '../../../types'
import { ScheduleQuickView } from '../schedule-quick-view'

interface CompactRowsViewProps {
  products: Product[]
  formatCurrency: (amount?: number | string) => string
  formatDate: (dateString?: string) => string
  getPaymentStatus: (schedule: any) => { label: string; variant: 'default' | 'secondary' | 'outline'; className: string }
  calculateSplitPercentage: (wassermanAmount?: number, revenue?: number) => number
  onEditSchedule?: (schedule: Schedule) => void
  onDeleteSchedule?: (schedule: Schedule) => void
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (product: Product) => void
  onNavigateToPayment?: (paymentId: string) => void
  getNumericValue: (value?: number | string | null) => number
}

export function CompactRowsView({
  products,
  formatCurrency,
  formatDate,
  getPaymentStatus,
  calculateSplitPercentage,
  onEditSchedule,
  onDeleteSchedule,
  onEditProduct,
  onDeleteProduct,
  onNavigateToPayment,
  getNumericValue,
}: CompactRowsViewProps) {
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
      <div className="space-y-4">
        {products.map((product) => {
          const productSchedules = product.schedules || []
          const totalPrice = getNumericValue(product.TotalPrice ?? product.UnitPrice)
          const totalCommission = productSchedules.reduce((sum, schedule) => {
            return sum + getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
          }, 0)
          const paidCount = productSchedules.filter(s =>
            s.WD_Payment_Status__c?.toLowerCase() === 'paid'
          ).length

          return (
            <Card key={product.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-semibold text-base">
                        {product.Project_Deliverables__c || product.Product_Name__c || 'Untitled Product'}
                      </div>
                      {product.Description && (
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.Description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {product.ProductCode && (
                      <Badge variant="outline">
                        {product.ProductCode}
                      </Badge>
                    )}
                    <div className="text-right">
                      <div className="text-muted-foreground text-xs">Price</div>
                      <div className="font-semibold">{formatCurrency(totalPrice)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-xs">Commission</div>
                      <div className="font-semibold text-orange-600 dark:text-orange-400">
                        {formatCurrency(totalCommission)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground text-xs">Paid</div>
                      <div className="font-semibold">
                        {paidCount} / {productSchedules.length}
                      </div>
                    </div>
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
                    {onDeleteProduct && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteProduct(product)
                        }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {productSchedules.length > 0 ? (
                  <div className="relative w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="h-8 text-xs">Date</TableHead>
                          <TableHead className="h-8 text-xs">Type</TableHead>
                          <TableHead className="h-8 text-xs text-right">Revenue</TableHead>
                          <TableHead className="h-8 text-xs text-right">Commission</TableHead>
                          <TableHead className="h-8 text-xs text-right">Split %</TableHead>
                          <TableHead className="h-8 text-xs">Status</TableHead>
                          <TableHead className="h-8 text-xs text-right">Agents</TableHead>
                          <TableHead className="h-8 text-xs w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
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
                              className="cursor-pointer hover:bg-muted/50 h-10"
                              onClick={() => handleScheduleClick(schedule, product)}
                            >
                              <TableCell className="py-2">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <div className="flex gap-0.5">
                                    {isInvoiced && (
                                      <Receipt className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                    )}
                                    {isPaid && (
                                      <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                                    )}
                                  </div>
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{formatDate(schedule.ScheduleDate)}</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-2">
                                {schedule.Type && (
                                  <Badge variant="outline" className="text-xs h-5">
                                    {schedule.Type}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="py-2 text-right text-xs font-medium">
                                {formatCurrency(scheduleRevenue)}
                              </TableCell>
                              <TableCell className="py-2 text-right text-xs font-medium text-orange-600 dark:text-orange-400">
                                {formatCurrency(commissionAmount)}
                              </TableCell>
                              <TableCell className="py-2 text-right text-xs font-medium">
                                {splitPercentage}%
                              </TableCell>
                              <TableCell className="py-2">
                                <Badge variant={paymentStatus.variant} className={`text-xs h-5 ${paymentStatus.className}`}>
                                  {paymentStatus.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-2 text-right">
                                {schedule.agentSplits && schedule.agentSplits.length > 0 && (
                                  <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    {schedule.agentSplits.length}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex items-center justify-end gap-1">
                                  {onEditSchedule && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onEditSchedule(schedule)
                                      }}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {onDeleteSchedule && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDeleteSchedule(schedule)
                                      }}
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No schedules for this product
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
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
