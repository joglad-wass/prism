'use client'

import { useState } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { DollarSign, Calendar, Receipt, Users, Package, Edit, Trash2 } from 'lucide-react'
import { Product, Schedule } from '../../../types'
import { ScheduleQuickView } from '../schedule-quick-view'

interface MasterDetailViewProps {
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

export function MasterDetailView({
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
}: MasterDetailViewProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() =>
    products.length > 0 ? products[0].id : null
  )
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const selectedProduct = products.find(p => p.id === selectedProductId)

  const handleScheduleClick = (schedule: any) => {
    setSelectedSchedule(schedule)
    setQuickViewOpen(true)
  }

  return (
    <>
      <div className="space-y-4">
        {/* Master Table - Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Products</CardTitle>
            <CardDescription>Select a product to view its schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px]">Product</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Schedules</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const productSchedules = product.schedules || []
                    const totalPrice = getNumericValue(product.TotalPrice ?? product.UnitPrice)
                    const totalCommission = productSchedules.reduce((sum, schedule) => {
                      return sum + getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
                    }, 0)
                    const paidCount = productSchedules.filter(s =>
                      s.WD_Payment_Status__c?.toLowerCase() === 'paid'
                    ).length
                    const isSelected = selectedProductId === product.id

                    return (
                      <TableRow
                        key={product.id}
                        className={`cursor-pointer ${isSelected ? 'bg-muted/50' : 'hover:bg-muted/30'}`}
                        onClick={() => setSelectedProductId(product.id)}
                      >
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
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {productSchedules.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="text-sm text-muted-foreground">
                            {paidCount} / {productSchedules.length}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
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
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail Table - Schedules */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Schedules for {selectedProduct.Project_Deliverables__c || selectedProduct.Product_Name__c || 'Product'}
                  </CardTitle>
                  <CardDescription>
                    {selectedProduct.schedules?.length || 0} payment schedules
                  </CardDescription>
                </div>
                {selectedProduct.ProductCode && (
                  <Badge variant="outline">
                    {selectedProduct.ProductCode}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedProduct.schedules && selectedProduct.schedules.length > 0 ? (
                <div className="relative w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Schedule Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead className="text-right">Split %</TableHead>
                        <TableHead>Payment Status</TableHead>
                        <TableHead className="text-right">Agents</TableHead>
                        <TableHead className="w-[40px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProduct.schedules.map((schedule: any) => {
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
                            onClick={() => handleScheduleClick(schedule)}
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
                                <div>
                                  <div className="font-medium">{formatDate(schedule.ScheduleDate)}</div>
                                  {schedule.Description && (
                                    <div className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                      {schedule.Description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {schedule.Type && (
                                <Badge variant="outline" className="text-xs">
                                  {schedule.Type}
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
                            <TableCell>
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
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No schedules found for this product
                </div>
              )}
            </CardContent>
          </Card>
        )}
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
