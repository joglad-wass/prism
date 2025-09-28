'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Plus,
  Package,
  DollarSign,
  Calendar,
  Clock,
  ExternalLink,
  Hash,
} from 'lucide-react'
import { Deal } from '../../types'

interface DealProductsProps {
  deal: Deal
}

export function DealProducts({ deal }: DealProductsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    Product_Name__c: '',
    ProductCode: '',
    UnitPrice: '',
    Description: '',
  })

  const formatCurrency = (amount?: number | string) => {
    if (!amount) return 'N/A'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleCreateProduct = () => {
    // Future: Implement product creation
    console.log('Creating product:', newProduct)
    setIsCreateDialogOpen(false)
    setNewProduct({
      Product_Name__c: '',
      ProductCode: '',
      UnitPrice: '',
      Description: '',
    })
  }

  const products = deal.products || []
  const totalProductValue = products.reduce((sum, product) => {
    const unitPrice = typeof product.UnitPrice === 'string'
      ? parseFloat(product.UnitPrice)
      : (product.UnitPrice || 0)
    return sum + (isNaN(unitPrice) ? 0 : unitPrice)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Products Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              Products in deal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalProductValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total unit prices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedules</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, product) => sum + (product.schedules?.length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Payment schedules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Deal Products</CardTitle>
              <CardDescription>
                Manage products and their associated schedules
              </CardDescription>
            </div>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Add a new product to this deal
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      placeholder="Product name..."
                      value={newProduct.Product_Name__c}
                      onChange={(e) => setNewProduct({ ...newProduct, Product_Name__c: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productCode">Cost Center</Label>
                    <Input
                      id="productCode"
                      placeholder="Cost center code..."
                      value={newProduct.ProductCode}
                      onChange={(e) => setNewProduct({ ...newProduct, ProductCode: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Unit Price</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      placeholder="0.00"
                      value={newProduct.UnitPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, UnitPrice: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Product description..."
                      value={newProduct.Description}
                      onChange={(e) => setNewProduct({ ...newProduct, Description: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProduct}>
                      Add Product
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No products added yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Cost Center</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Schedules</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {product.Project_Deliverables__c || 'Untitled Product'}
                          </div>
                          {product.Product_Name__c && (
                            <div className="text-sm text-muted-foreground">
                              {product.Product_Name__c}
                            </div>
                          )}
                          {/* <div className="text-xs text-muted-foreground">
                            ID: {product.id.slice(0, 8)}...
                          </div> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* <Hash className="h-3 w-3 text-muted-foreground" /> */}
                          <span className=" text-sm">
                            {product.ProductCode || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(product.UnitPrice)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {product.schedules?.length || 0} schedules
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details by Schedule */}
      {products.some(product => product.schedules && product.schedules.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Product Schedule Breakdown</CardTitle>
            <CardDescription>
              Payment schedules organized by product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {products
                .filter(product => product.schedules && product.schedules.length > 0)
                .map((product) => (
                <div key={product.id} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{product.Product_Name__c}</h4>
                    <Badge variant="outline">
                      {product.schedules?.length || 0} schedules
                    </Badge>
                  </div>

                  <div className="ml-6 space-y-2">
                    {product.schedules?.map((schedule) => (
                      <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {schedule.Description || 'Untitled Schedule'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(schedule.ScheduleDate)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(schedule.Revenue)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {schedule.scheduleStatus || 'DRAFT'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}