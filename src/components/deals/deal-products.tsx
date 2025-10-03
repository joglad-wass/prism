'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
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
  CircleDollarSign,
  ExternalLink,
  Loader2,
  Edit,
  ChevronDown,
  ChevronRight,
  Receipt,
  Users,
  X,
  Check,
  Trash2,
} from 'lucide-react'
import { Deal, Product, Schedule } from '../../types'
import { useUpdateProduct } from '../../hooks/useProducts'
import { useUpdateSchedule, useBatchUpdateScheduleSplits } from '../../hooks/useSchedules'
import { useAgentSearch } from '../../hooks/useAgents'
import { useFilter } from '../../contexts/filter-context'
import { useQueryClient } from '@tanstack/react-query'
import { dealKeys } from '../../hooks/useDeals'
import { scheduleKeys } from '../../hooks/useSchedules'

interface DealProductsProps {
  deal: Deal
}

export function DealProducts({ deal }: DealProductsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null)
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [isEditScheduleDialogOpen, setIsEditScheduleDialogOpen] = useState(false)
  const [isLinkProjectDialogOpen, setIsLinkProjectDialogOpen] = useState(false)
  const [linkProjectId, setLinkProjectId] = useState('')
  const [linkingProduct, setLinkingProduct] = useState<Product | null>(null)
  const [scheduleAgentSplits, setScheduleAgentSplits] = useState<Map<string, Array<{
    id?: string
    agentName: string
    agentId?: string | null
    splitPercent: number
    splitAmount: number
  }>>>(new Map())
  const [editingSplitId, setEditingSplitId] = useState<string | null>(null)
  const [agentSearchTerm, setAgentSearchTerm] = useState('')
  const [showAgentDropdown, setShowAgentDropdown] = useState<string | null>(null)
  const [editingSplitBackup, setEditingSplitBackup] = useState<{
    agentName: string
    agentId?: string | null
    splitPercent: number
    splitAmount: number
  } | null>(null)
  const [editForm, setEditForm] = useState({
    Product_Name__c: '',
    ProductCode: '',
    UnitPrice: '',
    Description: '',
    Project_Deliverables__c: '',
  })
  const [scheduleEditForm, setScheduleEditForm] = useState({
    Revenue: '',
    ScheduleDate: '',
    Description: '',
    Type: '',
    ScheduleSplitPercent: '',
    Billable: false,
    Talent_Invoice_Line_Amount__c: '',
    Wasserman_Invoice_Line_Amount__c: '',
    WD_Payment_Term__c: '',
  })
  const [newProduct, setNewProduct] = useState({
    Product_Name__c: '',
    ProductCode: '',
    UnitPrice: '',
    Description: '',
  })

  const queryClient = useQueryClient()
  const updateProduct = useUpdateProduct()
  const updateSchedule = useUpdateSchedule()
  const batchUpdateSplits = useBatchUpdateScheduleSplits()
  const { filterSelection } = useFilter()

  // Get cost center from deal for agent filtering
  const dealCostCenter = deal.Owner_Workday_Cost_Center__c

  // Agent search with cost center filtering
  const { data: agentSearchResults } = useAgentSearch(
    agentSearchTerm,
    filterSelection.type === 'individual' ? filterSelection.value || undefined : dealCostCenter,
    filterSelection.type === 'group' ? filterSelection.value || undefined : undefined,
    4 // Show 3-4 agents as requested
  )

  const handleCreateWorkdayProject = () => {
    // Future: Implement Workday project creation
    console.log('Creating Workday project for deal:', deal.id)
  }

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

  const handleProductClick = (product: Product) => {
    setSelectedProductForView(product)
    setSelectedSchedule(null)
  }

  const handleScheduleClick = (schedule: any, product: Product) => {
    setSelectedSchedule({ ...schedule, product })
    setSelectedProductForView(null)
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

  const handleEditScheduleClick = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    const calculatedSplit = calculateSplitPercentage(
      schedule.Wasserman_Invoice_Line_Amount__c,
      schedule.Revenue
    )
    setScheduleEditForm({
      Revenue: schedule.Revenue?.toString() || '',
      ScheduleDate: schedule.ScheduleDate ? schedule.ScheduleDate.split('T')[0] : '',
      Description: schedule.Description || '',
      Type: schedule.Type || '',
      ScheduleSplitPercent: calculatedSplit.toString(),
      Billable: schedule.Active__c || false,
      Talent_Invoice_Line_Amount__c: schedule.Talent_Invoice_Line_Amount__c?.toString() || '',
      Wasserman_Invoice_Line_Amount__c: schedule.Wasserman_Invoice_Line_Amount__c?.toString() || '',
      WD_Payment_Term__c: schedule.WD_Payment_Term__c || '',
    })
    setIsEditScheduleDialogOpen(true)
  }

  const handleSaveScheduleEdit = async () => {
    if (!editingSchedule) return

    try {
      await updateSchedule.mutateAsync({
        id: editingSchedule.id,
        schedule: {
          Revenue: scheduleEditForm.Revenue ? parseFloat(scheduleEditForm.Revenue) : undefined,
          ScheduleDate: scheduleEditForm.ScheduleDate || undefined,
          Description: scheduleEditForm.Description || undefined,
          Type: scheduleEditForm.Type || undefined,
          ScheduleSplitPercent: scheduleEditForm.ScheduleSplitPercent ? parseFloat(scheduleEditForm.ScheduleSplitPercent) : undefined,
          Active__c: scheduleEditForm.Billable,
          Talent_Invoice_Line_Amount__c: scheduleEditForm.Talent_Invoice_Line_Amount__c ? parseFloat(scheduleEditForm.Talent_Invoice_Line_Amount__c) : undefined,
          Wasserman_Invoice_Line_Amount__c: scheduleEditForm.Wasserman_Invoice_Line_Amount__c ? parseFloat(scheduleEditForm.Wasserman_Invoice_Line_Amount__c) : undefined,
          WD_Payment_Term__c: scheduleEditForm.WD_Payment_Term__c || undefined,
        },
      })

      // Invalidate the deal query to refresh the schedules
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(deal.id) })
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })

      setIsEditScheduleDialogOpen(false)
      setEditingSchedule(null)

      // Update the selected schedule if it's the one being edited
      if (selectedSchedule && selectedSchedule.id === editingSchedule.id) {
        setSelectedSchedule(null)
      }
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  }

  const formatCurrency = (amount?: number | string) => {
    if (amount === undefined || amount === null || amount === '') return 'N/A'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const getNumericValue = (value?: number | string | null) => {
    if (value === undefined || value === null || value === '') return 0
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? 0 : parsed
    }
    return value
  }

  const getScheduleCommissionAmount = (schedule: { Wasserman_Invoice_Line_Amount__c?: number | string | null }) => {
    return getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
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
    return sum + getNumericValue(product.TotalPrice ?? product.UnitPrice)
  }, 0)

  const { totalUnpaidScheduleValue, totalUnpaidCommissionValue } = products.reduce((acc, product) => {
    const schedules = product.schedules || []

    schedules.forEach((schedule) => {
      if (schedule.WD_Payment_Status__c?.toLowerCase() === 'paid') {
        return
      }

      acc.totalUnpaidScheduleValue += getNumericValue(schedule.Revenue)
      acc.totalUnpaidCommissionValue += getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
    })

    return acc
  }, { totalUnpaidScheduleValue: 0, totalUnpaidCommissionValue: 0 })

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getPaymentStatus = (schedule: any) => {
    // If schedule is not active, payment is not applicable
    if (!schedule.Active__c) {
      return { label: 'Not Applicable', variant: 'outline' as const, className: 'text-muted-foreground' }
    }
    if (schedule.WD_Payment_Status__c?.toLowerCase() === 'paid') {
      return { label: 'Paid', variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' }
    }
    if (schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') {
      return { label: 'Invoiced', variant: 'secondary' as const, className: '' }
    }
    return { label: 'Pending', variant: 'outline' as const, className: '' }
  }

  const trimProjectName = (projectName?: string) => {
    if (!projectName) return ''
    // Find where "PRODUCT NAME" appears in all caps and take everything before it
    const productNameIndex = projectName.indexOf('PRODUCT NAME')
    if (productNameIndex !== -1) {
      return projectName.substring(0, productNameIndex).trim()
    }
    return projectName
  }

  const calculateSplitPercentage = (wassermanAmount?: number, revenue?: number) => {
    if (!revenue || revenue === 0) return 0
    return Math.round((wassermanAmount || 0) / revenue * 100 * 100) / 100 // Round to 2 decimals
  }

  // Helper functions for agent splits
  const getScheduleSplits = (scheduleId: string) => {
    return scheduleAgentSplits.get(scheduleId) || []
  }

  const initializeScheduleSplits = (scheduleId: string, commissionAmount: number) => {
    // Initialize with agents from the deal's talent clients
    const talentClientAgents = deal.clients
      ?.flatMap(dc => dc.talentClient?.agents || [])
      .filter(Boolean) || []

    // Get unique agents by ID
    const uniqueAgents = Array.from(
      new Map(talentClientAgents.map(ta => [ta.agentId, ta])).values()
    )

    const defaultSplits = uniqueAgents.length > 0
      ? uniqueAgents.map((talentAgent) => {
          const defaultPercent = 100 / uniqueAgents.length
          return {
            agentName: talentAgent.agent?.name || 'Unknown Agent',
            splitPercent: Math.round(defaultPercent * 100) / 100,
            splitAmount: Math.round((commissionAmount * defaultPercent / 100) * 100) / 100,
          }
        })
      : [
          // If no agents, try deal owner
          {
            agentName: deal.owner?.name || '',
            splitPercent: 100,
            splitAmount: commissionAmount,
          }
        ]

    setScheduleAgentSplits(prev => new Map(prev).set(scheduleId, defaultSplits))
  }

  const updateAgentSplit = (
    scheduleId: string,
    splitIndex: number,
    field: 'agentName' | 'splitPercent' | 'splitAmount',
    value: string | number,
    commissionAmount: number
  ) => {
    const splits = getScheduleSplits(scheduleId)
    const newSplits = [...splits]

    if (field === 'agentName') {
      newSplits[splitIndex] = { ...newSplits[splitIndex], agentName: value as string }
    } else if (field === 'splitPercent') {
      const percent = parseFloat(value as string) || 0
      const amount = Math.round((commissionAmount * percent / 100) * 100) / 100
      newSplits[splitIndex] = {
        ...newSplits[splitIndex],
        splitPercent: percent,
        splitAmount: amount
      }
    } else if (field === 'splitAmount') {
      const amount = parseFloat(value as string) || 0
      const percent = commissionAmount > 0 ? Math.round((amount / commissionAmount * 100) * 100) / 100 : 0
      newSplits[splitIndex] = {
        ...newSplits[splitIndex],
        splitAmount: amount,
        splitPercent: percent
      }
    }

    setScheduleAgentSplits(prev => new Map(prev).set(scheduleId, newSplits))
  }

  const addAgentSplit = (scheduleId: string) => {
    const splits = getScheduleSplits(scheduleId)
    const newSplits = [...splits, {
      agentName: '',
      splitPercent: 0,
      splitAmount: 0,
    }]
    setScheduleAgentSplits(prev => new Map(prev).set(scheduleId, newSplits))
  }

  const removeAgentSplit = (scheduleId: string, splitIndex: number) => {
    const splits = getScheduleSplits(scheduleId)
    const newSplits = splits.filter((_, idx) => idx !== splitIndex)
    setScheduleAgentSplits(prev => new Map(prev).set(scheduleId, newSplits))
  }

  const getSplitTotal = (scheduleId: string) => {
    const splits = getScheduleSplits(scheduleId)
    return splits.reduce((sum, split) => sum + split.splitPercent, 0)
  }

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

  // Auto-expand all products on load
  useEffect(() => {
    if (products.length > 0) {
      const allProductIds = new Set(products.map(p => p.id))
      setExpandedProducts(allProductIds)
    }
  }, [products.length]) // Only run when products are first loaded

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
            <CardTitle className="text-sm font-medium">Unpaid Schedule Value</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex flex-wrap items-baseline gap-2">
              <span>{formatCurrency(totalUnpaidScheduleValue)}</span>
              <span className="text-sm font-medium text-muted-foreground">
                ({formatCurrency(totalUnpaidCommissionValue)} commission)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
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

          {/* Edit Schedule Dialog */}
          <Dialog open={isEditScheduleDialogOpen} onOpenChange={setIsEditScheduleDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Schedule</DialogTitle>
                <DialogDescription>
                  Update schedule details and save changes
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editScheduleDate">Schedule Date</Label>
                    <Input
                      id="editScheduleDate"
                      type="date"
                      value={scheduleEditForm.ScheduleDate}
                      onChange={(e) => setScheduleEditForm({ ...scheduleEditForm, ScheduleDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editRevenue">Revenue</Label>
                    <Input
                      id="editRevenue"
                      type="number"
                      placeholder="0.00"
                      value={scheduleEditForm.Revenue}
                      onChange={(e) => {
                        const revenue = parseFloat(e.target.value) || 0
                        const splitPercent = parseFloat(scheduleEditForm.ScheduleSplitPercent) || 0
                        const wassermanAmount = (revenue * splitPercent) / 100
                        const talentAmount = revenue - wassermanAmount
                        setScheduleEditForm({
                          ...scheduleEditForm,
                          Revenue: e.target.value,
                          Wasserman_Invoice_Line_Amount__c: wassermanAmount.toFixed(2),
                          Talent_Invoice_Line_Amount__c: talentAmount.toFixed(2),
                        })
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editTalentAmount">Talent Amount</Label>
                    <Input
                      id="editTalentAmount"
                      type="number"
                      placeholder="0.00"
                      value={scheduleEditForm.Talent_Invoice_Line_Amount__c}
                      onChange={(e) => {
                        const talentAmount = parseFloat(e.target.value) || 0
                        const revenue = parseFloat(scheduleEditForm.Revenue) || 0
                        const wassermanAmount = revenue - talentAmount
                        const splitPercent = calculateSplitPercentage(wassermanAmount, revenue)
                        setScheduleEditForm({
                          ...scheduleEditForm,
                          Talent_Invoice_Line_Amount__c: e.target.value,
                          Wasserman_Invoice_Line_Amount__c: wassermanAmount.toFixed(2),
                          ScheduleSplitPercent: splitPercent.toString(),
                        })
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editWassermanAmount">Commission Amount</Label>
                    <Input
                      id="editWassermanAmount"
                      type="number"
                      placeholder="0.00"
                      value={scheduleEditForm.Wasserman_Invoice_Line_Amount__c}
                      onChange={(e) => {
                        const wassermanAmount = parseFloat(e.target.value) || 0
                        const revenue = parseFloat(scheduleEditForm.Revenue) || 0
                        const talentAmount = revenue - wassermanAmount
                        const splitPercent = calculateSplitPercentage(wassermanAmount, revenue)
                        setScheduleEditForm({
                          ...scheduleEditForm,
                          Wasserman_Invoice_Line_Amount__c: e.target.value,
                          Talent_Invoice_Line_Amount__c: talentAmount.toFixed(2),
                          ScheduleSplitPercent: splitPercent.toString(),
                        })
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editType">Type</Label>
                    <Input
                      id="editType"
                      placeholder="Schedule type..."
                      value={scheduleEditForm.Type}
                      onChange={(e) => setScheduleEditForm({ ...scheduleEditForm, Type: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editSplitPercent">Split % (Commission)</Label>
                    <Input
                      id="editSplitPercent"
                      type="number"
                      placeholder="0"
                      value={scheduleEditForm.ScheduleSplitPercent}
                      onChange={(e) => {
                        const splitPercent = parseFloat(e.target.value) || 0
                        const revenue = parseFloat(scheduleEditForm.Revenue) || 0
                        const wassermanAmount = (revenue * splitPercent) / 100
                        const talentAmount = revenue - wassermanAmount
                        setScheduleEditForm({
                          ...scheduleEditForm,
                          ScheduleSplitPercent: e.target.value,
                          Wasserman_Invoice_Line_Amount__c: wassermanAmount.toFixed(2),
                          Talent_Invoice_Line_Amount__c: talentAmount.toFixed(2),
                        })
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editPaymentTerms">Payment Terms</Label>
                  <Input
                    id="editPaymentTerms"
                    placeholder="e.g., Net 15, Net 30..."
                    value={scheduleEditForm.WD_Payment_Term__c}
                    onChange={(e) => setScheduleEditForm({ ...scheduleEditForm, WD_Payment_Term__c: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="editActive"
                    checked={scheduleEditForm.Billable}
                    onChange={(e) => setScheduleEditForm({ ...scheduleEditForm, Billable: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="editActive" className="text-sm font-medium">
                    Billable
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editScheduleDescription">Description</Label>
                  <Textarea
                    id="editScheduleDescription"
                    placeholder="Schedule description..."
                    value={scheduleEditForm.Description}
                    onChange={(e) => setScheduleEditForm({ ...scheduleEditForm, Description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditScheduleDialogOpen(false)
                      setEditingSchedule(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveScheduleEdit}
                    disabled={updateSchedule.isPending}
                  >
                    {updateSchedule.isPending ? (
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

          {/* Link Existing Workday Project Dialog */}
          <Dialog open={isLinkProjectDialogOpen} onOpenChange={setIsLinkProjectDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Link Existing Workday Project</DialogTitle>
                <DialogDescription>
                  Enter the Workday Project ID to link to this product
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Workday Project ID</Label>
                  <Input
                    id="projectId"
                    placeholder="Enter project ID..."
                    value={linkProjectId}
                    onChange={(e) => setLinkProjectId(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsLinkProjectDialogOpen(false)
                      setLinkProjectId('')
                      setLinkingProduct(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!linkingProduct) return

                      try {
                        await updateProduct.mutateAsync({
                          id: linkingProduct.id,
                          product: {
                            WD_PRJ_ID__c: linkProjectId,
                          },
                        })

                        // Invalidate the deal query to refresh the product
                        queryClient.invalidateQueries({ queryKey: dealKeys.detail(deal.id) })

                        setIsLinkProjectDialogOpen(false)
                        setLinkProjectId('')
                        setLinkingProduct(null)
                      } catch (error) {
                        console.error('Failed to link Workday project:', error)
                      }
                    }}
                    disabled={!linkProjectId || updateProduct.isPending}
                  >
                    {updateProduct.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      'Link Project'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No products added yet</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left: Products List */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products ({products.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {products.map((product) => {
                      const productSchedules = product.schedules || []
                      const isExpanded = expandedProducts.has(product.id)
                      const hasSchedules = productSchedules.length > 0

                      return (
                        <div key={product.id} className="space-y-1">
                          {/* Product Item */}
                          <div
                            className={`p-3 border rounded-lg transition-colors ${
                              selectedProductForView?.id === product.id && !selectedSchedule
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {/* Chevron for expansion */}
                              {hasSchedules && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleProductExpansion(product.id)
                                  }}
                                  className="mt-1 hover:bg-muted/50 rounded p-0.5"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              )}

                              {/* Product Content */}
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => handleProductClick(product)}
                              >
                                <div className="font-medium text-sm">
                                  {product.Project_Deliverables__c || 'Untitled Product'}
                                </div>
                                {product.Product_Name__c && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {product.Product_Name__c}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {product.ProductCode && (
                                    <Badge variant="outline" className="text-xs">
                                      {product.ProductCode}
                                    </Badge>
                                  )}
                                  {hasSchedules && (
                                    <span className="text-xs text-muted-foreground">
                                      {productSchedules.length} schedule{productSchedules.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {formatCurrency(product.UnitPrice)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Schedules List (when expanded) */}
                          {isExpanded && hasSchedules && (
                            <div className="ml-6 space-y-1">
                              {productSchedules.map((schedule: any) => {
                                const isPaid = schedule.WD_Payment_Status__c?.toLowerCase() === 'paid'
                                const isInvoiced = schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== ''

                                return (
                                  <div
                                    key={schedule.id}
                                    className={`p-2 pl-4 border-l-2 rounded cursor-pointer transition-colors ${
                                      selectedSchedule?.id === schedule.id
                                        ? 'bg-primary/10 border-l-primary'
                                        : 'border-l-muted hover:bg-muted/50'
                                    }`}
                                    onClick={() => handleScheduleClick(schedule, product)}
                                  >
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
                                      <div className="flex-1">
                                        <div className="font-medium text-xs">{formatDate(schedule.ScheduleDate)}</div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                          <span>{formatCurrency(getNumericValue(schedule.Revenue))}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Right: Product/Schedule Details */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {selectedSchedule
                        ? `Schedule: ${formatDate(selectedSchedule.ScheduleDate)}`
                        : selectedProductForView
                          ? selectedProductForView.Project_Deliverables__c || selectedProductForView.Product_Name__c || 'Product Details'
                          : products[0]?.Project_Deliverables__c || products[0]?.Product_Name__c || 'Select a product to view details'}
                    </CardTitle>
                    {selectedSchedule && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSchedule(null)}
                      >
                        Back to Product
                      </Button>
                    )}
                    {!selectedSchedule && selectedProductForView && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(selectedProductForView)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Product
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedSchedule ? (
                    /* Schedule Details View */
                    <div className="space-y-6">
                      {/* Schedule Information Card */}
                      <div className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium text-lg">{formatDate(selectedSchedule.ScheduleDate)}</span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-medium text-sm">{formatCurrency(selectedSchedule.Revenue ? Number(selectedSchedule.Revenue) : 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Split %</span>
                            <span className="font-medium text-sm">
                              {calculateSplitPercentage(
                                selectedSchedule.Wasserman_Invoice_Line_Amount__c ? Number(selectedSchedule.Wasserman_Invoice_Line_Amount__c) : 0,
                                selectedSchedule.Revenue ? Number(selectedSchedule.Revenue) : 0
                              )}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Talent</span>
                            <span className="font-medium text-sm text-green-600 dark:text-green-400">
                              {formatCurrency(selectedSchedule.Talent_Invoice_Line_Amount__c ? Number(selectedSchedule.Talent_Invoice_Line_Amount__c) : 0)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Commission</span>
                            <span className="font-medium text-sm text-orange-600 dark:text-orange-400">
                              {formatCurrency(selectedSchedule.Wasserman_Invoice_Line_Amount__c ? Number(selectedSchedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Schedule Details Grid */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Schedule Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Type</div>
                            <div className="text-sm font-medium">{selectedSchedule.Type || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Billable</div>
                            <Badge variant={selectedSchedule.Active__c ? 'default' : 'secondary'} className="text-xs">
                              {selectedSchedule.Active__c ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Payment Terms</div>
                            <div className="text-sm font-medium">{selectedSchedule.WD_Payment_Term__c || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Payment Status</div>
                            <Badge variant={getPaymentStatus(selectedSchedule).variant} className={`text-xs ${getPaymentStatus(selectedSchedule).className}`}>
                              {getPaymentStatus(selectedSchedule).label}
                            </Badge>
                          </div>
                          {selectedSchedule.WD_Invoice_ID__c && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Invoice ID</div>
                              <div className="text-xs font-mono">{selectedSchedule.WD_Invoice_ID__c}</div>
                            </div>
                          )}
                          {selectedSchedule.WD_PO_Number__c && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">PO Number</div>
                              <div className="text-xs font-mono">{selectedSchedule.WD_PO_Number__c}</div>
                            </div>
                          )}
                        </div>
                        {selectedSchedule.Description && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Description</div>
                            <div className="text-sm">{selectedSchedule.Description}</div>
                          </div>
                        )}
                      </div>

                      <Separator />

                      {/* Schedule Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={selectedSchedule.Active__c ? "flex-1" : "w-full"}
                          onClick={() => handleEditScheduleClick(selectedSchedule)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Schedule
                        </Button>
                        {selectedSchedule.Active__c && (
                          <Button variant="outline" size="sm" className="flex-1">
                            <Receipt className="h-4 w-4 mr-2" />
                            Create Invoice
                          </Button>
                        )}
                      </div>

                      <Separator />

                      {/* Associated Product Info */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold">Associated Product</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Deliverables</div>
                            <div className="text-sm font-medium">{selectedSchedule.product.Project_Deliverables__c || 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Product Name</div>
                            <div className="text-sm font-medium">{selectedSchedule.product.Product_Name__c || 'N/A'}</div>
                          </div>
                          {selectedSchedule.product.ProductCode && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Cost Center</div>
                              <Badge variant="outline" className="text-xs">
                                {selectedSchedule.product.ProductCode}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : !selectedProductForView && !products[0] ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No products available</p>
                    </div>
                  ) : (
                    /* Product Details View */
                    <div className="space-y-6">
                      {(() => {
                        const activeProduct = selectedProductForView || products[0]
                        const productSchedules = activeProduct.schedules || []
                        const totalPrice = getNumericValue(activeProduct.TotalPrice ?? activeProduct.UnitPrice)
                        const totalCommission = productSchedules.reduce((sum, schedule) => {
                          return sum + getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
                        }, 0)
                        const paidCommission = productSchedules.reduce((sum, schedule) => {
                          return schedule.WD_Payment_Status__c?.toLowerCase() === 'paid'
                            ? sum + getNumericValue(schedule.Wasserman_Invoice_Line_Amount__c)
                            : sum
                        }, 0)
                        const unpaidCommission = Math.max(totalCommission - paidCommission, 0)
                        return (
                          <>
                            {/* Product Information */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Product Details
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                  <div className="text-sm text-muted-foreground mb-1">Deliverables</div>
                                  <div className="text-sm font-medium">
                                    {activeProduct.Project_Deliverables__c || 'No deliverables specified'}
                                  </div>
                                </div>
                                {activeProduct.Product_Name__c && (
                                  <div className="col-span-2">
                                    <div className="text-sm text-muted-foreground mb-1">Product Name</div>
                                    <div className="text-sm font-medium">{activeProduct.Product_Name__c}</div>
                                  </div>
                                )}
                                {activeProduct.ProductCode && (
                                  <div>
                                    <div className="text-sm text-muted-foreground mb-1">Cost Center</div>
                                    <Badge variant="outline" className="text-xs">
                                      {activeProduct.ProductCode}
                                    </Badge>
                                  </div>
                                )}
                                <div className="col-span-2 space-y-2">
                                  <div>
                                    <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                                    <div className="text-sm font-medium">{formatCurrency(totalPrice)}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-muted-foreground mb-1">Commission</div>
                                    <div className="text-sm font-medium">{formatCurrency(totalCommission)}</div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <span>Paid</span>
                                      <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(paidCommission)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span>Unpaid</span>
                                      <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(unpaidCommission)}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Workday Information */}
                            <Separator />
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold">Workday</h3>
                              {(activeProduct.WD_PRJ_ID__c || activeProduct.WD_Project_Name__c) ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 gap-4">
                                    {activeProduct.WD_PRJ_ID__c && (
                                      <div>
                                        <div className="text-sm text-muted-foreground mb-1">Project ID</div>
                                        <div className="text-sm font-medium">{activeProduct.WD_PRJ_ID__c}</div>
                                      </div>
                                    )}
                                    {activeProduct.WD_Project_Name__c && (
                                      <div>
                                        <div className="text-sm text-muted-foreground mb-1">Project Name</div>
                                        <div className="text-sm font-medium">{trimProjectName(activeProduct.WD_Project_Name__c)}</div>
                                      </div>
                                    )}
                                  </div>
                                  {activeProduct.Workday_Project_State__c && (
                                    <div>
                                      <div className="text-sm text-muted-foreground mb-1">Project State</div>
                                      <Badge variant="secondary" className="text-xs">
                                        {activeProduct.Workday_Project_State__c}
                                      </Badge>
                                    </div>
                                  )}
                                  {activeProduct.Workday_Project_Status__c && (
                                    <div>
                                      <div className="text-sm text-muted-foreground mb-1">Project Status</div>
                                      <Badge variant="outline" className="text-xs">
                                        {activeProduct.Workday_Project_Status__c}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-sm text-muted-foreground">No Workday project linked</p>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={handleCreateWorkdayProject}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Create Workday Project
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex-1"
                                      onClick={() => {
                                        setLinkingProduct(activeProduct)
                                        setIsLinkProjectDialogOpen(true)
                                      }}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Link Existing Project
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <Separator />

                            {/* Payment Schedules */}
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold">Payment Schedules</h3>
                              {!activeProduct.schedules || activeProduct.schedules.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                  <p className="text-sm">No schedules configured</p>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {activeProduct.schedules.map((schedule: any) => {
                                    const status = getPaymentStatus(schedule)
                                    const isPaid = schedule.WD_Payment_Status__c?.toLowerCase() === 'paid'
                                    const isInvoiced = schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== ''
                                    const scheduleRevenue = getNumericValue(schedule.Revenue)
                                    const commissionAmount = getScheduleCommissionAmount(schedule)
                                    const splits = getScheduleSplits(schedule.id)
                                    const splitTotal = getSplitTotal(schedule.id)
                                    const hasSplitWarning = splits.length > 0 && Math.abs(splitTotal - 100) > 0.01
                                    const canEditSplits = !isPaid

                                    // Initialize splits if not yet done
                                    if (!scheduleAgentSplits.has(schedule.id)) {
                                      initializeScheduleSplits(schedule.id, commissionAmount)
                                    }

                                    return (
                                      <div key={schedule.id} className="border rounded-lg">
                                        {/* Schedule Header */}
                                        <div
                                          className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                                          onClick={() => handleScheduleClick(schedule, activeProduct)}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className="flex gap-1">
                                                {isInvoiced && (
                                                  <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                )}
                                                {isPaid && (
                                                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                )}
                                              </div>
                                              <div>
                                                <div className="text-sm font-medium">{formatDate(schedule.ScheduleDate)}</div>
                                                <div className="text-xs text-muted-foreground">
                                                  {formatCurrency(scheduleRevenue)} revenue • {formatCurrency(commissionAmount)} commission
                                                </div>
                                              </div>
                                            </div>
                                            <Badge variant={status.variant} className={`text-xs ${status.className}`}>
                                              {status.label}
                                            </Badge>
                                          </div>
                                        </div>

                                        {/* Agent Splits (Always Visible) */}
                                        <div className="px-3 pb-3 border-t bg-muted/20">
                                          <div className="pt-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                              <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                                <Users className="h-3 w-3" />
                                                Commission Splits
                                              </h4>
                                              {hasSplitWarning && (
                                                <span className="text-xs text-orange-600 dark:text-orange-400">
                                                  Total: {splitTotal.toFixed(2)}% (should be 100%)
                                                </span>
                                              )}
                                            </div>

                                            {/* Split Rows */}
                                            <div className="space-y-2">
                                              {splits.map((split, idx) => {
                                                const splitKey = `${schedule.id}-${idx}`
                                                const isEditing = editingSplitId === splitKey

                                                return isEditing ? (
                                                  // Edit Mode
                                                  <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg bg-background">
                                                    <div className="col-span-3 relative">
                                                      <Input
                                                        placeholder="Agent/Agency..."
                                                        value={split.agentName}
                                                        onChange={(e) => {
                                                          e.stopPropagation()
                                                          setAgentSearchTerm(e.target.value)
                                                          updateAgentSplit(
                                                            schedule.id,
                                                            idx,
                                                            'agentName',
                                                            e.target.value,
                                                            commissionAmount
                                                          )
                                                        }}
                                                        onFocus={(e) => {
                                                          e.stopPropagation()
                                                          setShowAgentDropdown(splitKey)
                                                          setAgentSearchTerm('')
                                                        }}
                                                        onBlur={() => {
                                                          // Delay to allow clicking dropdown items
                                                          setTimeout(() => setShowAgentDropdown(null), 200)
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-8 text-xs"
                                                      />
                                                      {showAgentDropdown === splitKey && agentSearchResults?.data && agentSearchResults.data.length > 0 && (
                                                        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-auto">
                                                          {agentSearchResults.data.map((agent) => (
                                                            <div
                                                              key={agent.id}
                                                              className="px-3 py-2 text-xs hover:bg-muted cursor-pointer"
                                                              onMouseDown={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                updateAgentSplit(
                                                                  schedule.id,
                                                                  idx,
                                                                  'agentName',
                                                                  agent.name,
                                                                  commissionAmount
                                                                )
                                                                setShowAgentDropdown(null)
                                                                setAgentSearchTerm('')
                                                              }}
                                                            >
                                                              <div className="font-medium">{agent.name}</div>
                                                              {agent.costCenter && (
                                                                <div className="text-[10px] text-muted-foreground">
                                                                  {agent.costCenter}
                                                                </div>
                                                              )}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      )}
                                                    </div>
                                                    <div className="col-span-2">
                                                      <div className="relative">
                                                        <Input
                                                          type="number"
                                                          placeholder="0"
                                                          value={split.splitPercent || ''}
                                                          onChange={(e) => {
                                                            e.stopPropagation()
                                                            updateAgentSplit(
                                                              schedule.id,
                                                              idx,
                                                              'splitPercent',
                                                              e.target.value,
                                                              commissionAmount
                                                            )
                                                          }}
                                                          onClick={(e) => e.stopPropagation()}
                                                          className="h-8 text-xs pr-6"
                                                        />
                                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                                          %
                                                        </span>
                                                      </div>
                                                    </div>
                                                    <div className="col-span-4">
                                                      <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                                                          $
                                                        </span>
                                                        <Input
                                                          type="number"
                                                          placeholder="0"
                                                          value={split.splitAmount || ''}
                                                          onChange={(e) => {
                                                            e.stopPropagation()
                                                            updateAgentSplit(
                                                              schedule.id,
                                                              idx,
                                                              'splitAmount',
                                                              e.target.value,
                                                              commissionAmount
                                                            )
                                                          }}
                                                          onClick={(e) => e.stopPropagation()}
                                                          className="h-8 text-xs pl-5"
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="col-span-2 flex gap-1 justify-end">
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={async (e) => {
                                                          e.stopPropagation()

                                                          // Save all splits for this schedule, filter out empty agent names
                                                          let currentSplits = getScheduleSplits(schedule.id)
                                                            .filter(s => s.agentName && s.agentName.trim() !== '')

                                                          // Calculate total percentage
                                                          const totalPercent = currentSplits.reduce((sum, s) => sum + s.splitPercent, 0)

                                                          // If total is less than 100%, add an "Unassigned" split for the remainder
                                                          if (totalPercent < 100) {
                                                            const remainingPercent = Math.round((100 - totalPercent) * 100) / 100
                                                            const remainingAmount = Math.round((commissionAmount * remainingPercent / 100) * 100) / 100

                                                            currentSplits = [
                                                              ...currentSplits,
                                                              {
                                                                agentName: 'Unassigned',
                                                                agentId: null,
                                                                splitPercent: remainingPercent,
                                                                splitAmount: remainingAmount
                                                              }
                                                            ]
                                                          }

                                                          try {
                                                            await batchUpdateSplits.mutateAsync({
                                                              scheduleId: schedule.id,
                                                              splits: currentSplits.map(s => ({
                                                                agentName: s.agentName,
                                                                agentId: s.agentId || null,
                                                                splitPercent: s.splitPercent,
                                                                splitAmount: s.splitAmount
                                                              }))
                                                            })
                                                          } catch (error) {
                                                            console.error('Failed to save splits:', error)
                                                          }

                                                          setEditingSplitId(null)
                                                          setEditingSplitBackup(null)
                                                        }}
                                                        disabled={batchUpdateSplits.isPending}
                                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900"
                                                      >
                                                        {batchUpdateSplits.isPending ? (
                                                          <Loader2 className="h-3 w-3 animate-spin" />
                                                        ) : (
                                                          <Check className="h-3 w-3" />
                                                        )}
                                                      </Button>
                                                      <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                          e.stopPropagation()
                                                          // Restore backup if exists
                                                          if (editingSplitBackup) {
                                                            updateAgentSplit(
                                                              schedule.id,
                                                              idx,
                                                              'agentName',
                                                              editingSplitBackup.agentName,
                                                              commissionAmount
                                                            )
                                                            // Also restore percent and amount
                                                            const splits = getScheduleSplits(schedule.id)
                                                            const newSplits = [...splits]
                                                            newSplits[idx] = editingSplitBackup
                                                            setScheduleAgentSplits(prev => new Map(prev).set(schedule.id, newSplits))
                                                          }
                                                          setEditingSplitId(null)
                                                          setEditingSplitBackup(null)
                                                        }}
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                                      >
                                                        <X className="h-3 w-3" />
                                                      </Button>
                                                      {splits.length > 1 && (
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={async (e) => {
                                                            e.stopPropagation()
                                                            // Remove split and save to database
                                                            removeAgentSplit(schedule.id, idx)

                                                            // Get updated splits after removal, filter out empty agent names
                                                            const updatedSplits = getScheduleSplits(schedule.id)
                                                              .filter((_, i) => i !== idx)
                                                              .filter(s => s.agentName && s.agentName.trim() !== '')

                                                            try {
                                                              await batchUpdateSplits.mutateAsync({
                                                                scheduleId: schedule.id,
                                                                splits: updatedSplits.map(s => ({
                                                                  agentName: s.agentName,
                                                                  agentId: s.agentId || null,
                                                                  splitPercent: s.splitPercent,
                                                                  splitAmount: s.splitAmount
                                                                }))
                                                              })
                                                            } catch (error) {
                                                              console.error('Failed to delete split:', error)
                                                            }

                                                            setEditingSplitId(null)
                                                            setEditingSplitBackup(null)
                                                          }}
                                                          disabled={batchUpdateSplits.isPending}
                                                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                                                        >
                                                          <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </div>
                                                ) : (
                                                  // Read-Only Mode
                                                  <div key={idx} className={`grid grid-cols-12 gap-2 items-center p-2 border rounded-lg transition-colors ${canEditSplits ? 'hover:bg-muted/50' : 'opacity-60'}`}>
                                                    <div className="col-span-3">
                                                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Split Recipient</div>
                                                      <div className="text-xs font-medium">{split.agentName || 'Not set'}</div>
                                                    </div>
                                                    <div className="col-span-2">
                                                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Split %</div>
                                                      <div className="text-xs font-medium">{split.splitPercent}%</div>
                                                    </div>
                                                    <div className="col-span-4">
                                                      <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Split Amount</div>
                                                      <div className="text-xs font-medium">{formatCurrency(split.splitAmount)}</div>
                                                    </div>
                                                    <div className="col-span-3 flex gap-1 justify-end">
                                                      {canEditSplits && (
                                                        <>
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                              e.stopPropagation()
                                                              // Backup current values before editing
                                                              setEditingSplitBackup({
                                                                agentName: split.agentName,
                                                                splitPercent: split.splitPercent,
                                                                splitAmount: split.splitAmount,
                                                              })
                                                              setEditingSplitId(splitKey)
                                                            }}
                                                            className="h-8 w-8 p-0"
                                                          >
                                                            <Edit className="h-3 w-3" />
                                                          </Button>
                                                          {splits.length > 1 && (
                                                            <Button
                                                              variant="ghost"
                                                              size="sm"
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                removeAgentSplit(schedule.id, idx)
                                                              }}
                                                              className="h-8 w-8 p-0"
                                                            >
                                                              <X className="h-3 w-3" />
                                                            </Button>
                                                          )}
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                )
                                              })}
                                            </div>

                                            {/* Add Split Button */}
                                            {canEditSplits ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  addAgentSplit(schedule.id)
                                                }}
                                                className="w-full h-8 text-xs"
                                              >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Add Split
                                              </Button>
                                            ) : (
                                              <div className="w-full p-2 text-center text-xs text-muted-foreground border border-dashed rounded-lg">
                                                Cannot modify splits once paid
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
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
