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
  Pencil,
  Loader2,
  Edit,
} from 'lucide-react'
import { Deal, Product } from '../../types'
import { useUpdateProduct } from '../../hooks/useProducts'
import { useQueryClient } from '@tanstack/react-query'
import { dealKeys } from '../../hooks/useDeals'

interface DealProductsProps {
  deal: Deal
}

export function DealProducts({ deal }: DealProductsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    Product_Name__c: '',
    ProductCode: '',
    UnitPrice: '',
    Description: '',
    Project_Deliverables__c: '',
  })
  const [newProduct, setNewProduct] = useState({
    Product_Name__c: '',
    ProductCode: '',
    UnitPrice: '',
    Description: '',
  })

  const queryClient = useQueryClient()
  const updateProduct = useUpdateProduct()

  const handleCreateWorkdayProject = () => {
    // Future: Implement Workday project creation
    console.log('Creating Workday project for deal:', deal.id)
  }

  const handleEditClick = (product: Product) => {
    setEditingProduct(product)
    setEditForm({
      Product_Name__c: product.Product_Name__c || '',
      ProductCode: product.ProductCode || '',
      UnitPrice: product.UnitPrice?.toString() || '',
      Description: product.Description || '',
      Project_Deliverables__c: product.Project_Deliverables__c || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        product: {
          Product_Name__c: editForm.Product_Name__c,
          ProductCode: editForm.ProductCode,
          UnitPrice: editForm.UnitPrice ? parseFloat(editForm.UnitPrice) : undefined,
          Description: editForm.Description,
          Project_Deliverables__c: editForm.Project_Deliverables__c,
        },
      })

      // Invalidate the deal query to refresh the products
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(deal.id) })

      setIsEditDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Failed to update product:', error)
    }
  }

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

  // Extract and deduplicate Workday projects from products
  const workdayProjects = products.reduce((acc, product) => {
    if (product.WD_PRJ_ID__c) {
      const existingProject = acc.find(p => p.WD_PRJ_ID__c === product.WD_PRJ_ID__c)
      if (!existingProject) {
        // Extract project name before "PRODUCT NAME:"
        let projectName = product.WD_Project_Name__c || ''
        const productNameIndex = projectName.indexOf('PRODUCT NAME:')
        if (productNameIndex !== -1) {
          projectName = projectName.substring(0, productNameIndex).trim()
        }

        acc.push({
          WD_PRJ_ID__c: product.WD_PRJ_ID__c,
          WD_Project_Name__c: projectName,
          Workday_Project_State__c: product.Workday_Project_State__c,
          Workday_Project_Status__c: product.Workday_Project_Status__c,
        })
      }
    }
    return acc
  }, [] as Array<{
    WD_PRJ_ID__c: string
    WD_Project_Name__c?: string
    Workday_Project_State__c?: string
    Workday_Project_Status__c?: string
  }>)

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
          {/* Edit Product Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Update product details and save changes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editProjectDeliverables">Project Deliverables</Label>
                  <Input
                    id="editProjectDeliverables"
                    placeholder="Project deliverables..."
                    value={editForm.Project_Deliverables__c}
                    onChange={(e) => setEditForm({ ...editForm, Project_Deliverables__c: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editProductName">Product Name</Label>
                  <Input
                    id="editProductName"
                    placeholder="Product name..."
                    value={editForm.Product_Name__c}
                    onChange={(e) => setEditForm({ ...editForm, Product_Name__c: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editProductCode">Cost Center</Label>
                  <Input
                    id="editProductCode"
                    placeholder="Cost center code..."
                    value={editForm.ProductCode}
                    onChange={(e) => setEditForm({ ...editForm, ProductCode: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editUnitPrice">Unit Price</Label>
                  <Input
                    id="editUnitPrice"
                    type="number"
                    placeholder="0.00"
                    value={editForm.UnitPrice}
                    onChange={(e) => setEditForm({ ...editForm, UnitPrice: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    placeholder="Product description..."
                    value={editForm.Description}
                    onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setEditingProduct(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={updateProduct.isPending}
                  >
                    {updateProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workday Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Workday Integration
          </CardTitle>
          <CardDescription>
            {workdayProjects.length > 0
              ? `${workdayProjects.length} Workday ${workdayProjects.length === 1 ? 'project' : 'projects'} linked to this deal`
              : 'Project creation and management in Workday'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {workdayProjects.length === 0 ? (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Workday Project</div>
                <div className="text-sm text-muted-foreground">
                  No project created yet
                </div>
              </div>

              <Button onClick={handleCreateWorkdayProject}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {workdayProjects.map((project) => (
                <div key={project.WD_PRJ_ID__c} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {project.WD_Project_Name__c || 'Untitled Project'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Project ID: {project.WD_PRJ_ID__c}
                    </div>
                    {(project.Workday_Project_State__c || project.Workday_Project_Status__c) && (
                      <div className="flex gap-2 mt-2">
                        {project.Workday_Project_State__c && (
                          <Badge variant="secondary">{project.Workday_Project_State__c}</Badge>
                        )}
                        {project.Workday_Project_Status__c && (
                          <Badge variant="outline">{project.Workday_Project_Status__c}</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Workday
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}