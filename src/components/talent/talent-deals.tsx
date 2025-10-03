'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Separator } from '../ui/separator'
import {
  DollarSign,
  Briefcase,
  Building,
  Percent,
  ExternalLink,
  Save,
  Loader2,
  TrendingUp,
  Calendar,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  Package,
} from 'lucide-react'

import { TalentDetail } from '../../types/talent'
import { TalentService } from '../../services/talent'
import { DealListPanel } from './deal-list-panel'
import { DealDetailsPanel } from './deal-details-panel'
import { BrandListPanel } from './brand-list-panel'
import { BrandDetailsPanel } from './brand-details-panel'

interface TalentDealsProps {
  talent: TalentDetail
}

export function TalentDeals({ talent }: TalentDealsProps) {
  const router = useRouter()
  const [splitPercentage, setSplitPercentage] = useState(talent.marketingFeePercentage || 15)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedDealForView, setSelectedDealForView] = useState<any>(null)
  const [expandedDeals, setExpandedDeals] = useState<Set<string>>(new Set())
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)

  // Update split percentage when talent data changes
  useEffect(() => {
    setSplitPercentage(talent.marketingFeePercentage || 15)
    setHasUnsavedChanges(false)
  }, [talent.marketingFeePercentage])

  // Handle split percentage input changes
  const handleSplitPercentageChange = (value: number) => {
    setSplitPercentage(value)
    setHasUnsavedChanges(value !== (talent.marketingFeePercentage || 15))
  }

  // Save marketing fee percentage to database
  const saveMarketingFeePercentage = async () => {
    if (!hasUnsavedChanges || isUpdating) return

    setIsUpdating(true)
    try {
      await TalentService.updateTalent(talent.id, {
        marketingFeePercentage: splitPercentage
      })

      setHasUnsavedChanges(false)
      // Optionally refresh the page or show a success message
      window.location.reload()
    } catch (error) {
      console.error('Error updating marketing fee percentage:', error)
      // Optionally show error message to user
    } finally {
      setIsUpdating(false)
    }
  }

  // Use real deals data from the talent
  const deals = talent.deals?.map(dc => {
    // Calculate Talent revenue from schedules (sum of Talent_Invoice_Line_Amount__c)
    const talentAmount = dc.deal.schedules?.reduce((sum, schedule) => {
      const amount = typeof schedule.Talent_Invoice_Line_Amount__c === 'string'
        ? parseFloat(schedule.Talent_Invoice_Line_Amount__c)
        : (schedule.Talent_Invoice_Line_Amount__c || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0) || 0

    // Calculate Wasserman commission from schedules (sum of Wasserman_Invoice_Line_Amount__c)
    const wassermanAmount = dc.deal.schedules?.reduce((sum, schedule) => {
      const amount = typeof schedule.Wasserman_Invoice_Line_Amount__c === 'string'
        ? parseFloat(schedule.Wasserman_Invoice_Line_Amount__c)
        : (schedule.Wasserman_Invoice_Line_Amount__c || 0)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0) || 0

    const dealData = dc.deal as any

    return {
      id: dc.deal.id,
      name: dealData.Name || dc.deal.name || '',
      brand: dc.deal.brand?.name || 'Unknown Brand',
      brandId: dc.deal.brand?.id,
      company: dc.deal.brand?.name || 'Unknown Company',
      amount: Number(dealData.Amount || dc.deal.amount) || 0,
      talentAmount: talentAmount,
      wassermanAmount: wassermanAmount,
      splitPercent: dealData.Talent_Marketing_Fee_Percentage__c
        ? Number(dealData.Talent_Marketing_Fee_Percentage__c)
        : (Number(dc.splitPercent) || splitPercentage),
      status: dealData.Status__c || dc.deal.status || '',
      startDate: dc.deal.startDate || new Date().toISOString(),
      closeDate: dc.deal.closeDate || new Date().toISOString(),
      schedules: dc.deal.schedules || [],
      products: dc.deal.products || [],
      owner: talent.agents?.find(ta => ta.isPrimary)?.agent?.name || talent.agents?.[0]?.agent?.name || 'Unknown Owner',
      stage: dealData.StageName || dc.deal.stage || 'Unknown',
      daysInStage: 0,
      commission: wassermanAmount,
      workdayProject: null as string | null
    }
  }) || []

  const toggleDealExpansion = (dealId: string) => {
    setExpandedDeals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dealId)) {
        newSet.delete(dealId)
      } else {
        newSet.add(dealId)
      }
      return newSet
    })
  }

  const handleProductClick = (product: any, deal: any) => {
    setSelectedProduct({ ...product, deal })
    setSelectedDealForView(null)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Clear selections when switching tabs
    setSelectedDealForView(null)
    setSelectedProduct(null)
    setSelectedBrand(null)
  }

  // Calculate average split percentage from actual deals or use marketing fee percentage as default
  const calculateAvgSplitPercentage = () => {
    if (deals.length === 0) {
      return talent.marketingFeePercentage || 15
    }

    const totalSplitPercent = deals.reduce((sum, deal) => sum + deal.splitPercent, 0)
    return Math.round((totalSplitPercent / deals.length) * 100) / 100
  }

  const avgSplitPercentage = calculateAvgSplitPercentage()

  // Mock deals fallback for development
  const mockDeals = [
    {
      id: '1',
      name: 'Nike Basketball Campaign',
      owner: 'Sarah Johnson',
      startDate: '2024-01-15',
      closeDate: '2024-06-30',
      status: 'COMPLETED',
      stage: 'Delivered',
      daysInStage: 30,
      division: 'Sports Marketing',
      company: 'Nike Inc.',
      brand: 'Nike',
      amount: 500000,
      split: 75000,
      dealPercent: 15,
      commission: 11250,
      notes: 'Successful campaign with high engagement',
      workdayProject: 'WD-2024-001',
      schedules: [
        { name: 'Initial Payment', amount: 25000, terms: 'Net 30', status: 'PAID', paymentStatus: 'RECEIVED' },
        { name: 'Milestone 1', amount: 25000, terms: 'Net 30', status: 'SENT', paymentStatus: 'PENDING' },
        { name: 'Final Payment', amount: 25000, terms: 'Net 30', status: 'DRAFT', paymentStatus: 'NOT_SENT' },
      ]
    },
    {
      id: '2',
      name: 'Adidas Partnership',
      owner: 'Mike Chen',
      startDate: '2024-03-01',
      closeDate: '2024-12-31',
      status: 'IN_PROGRESS',
      stage: 'Negotiation',
      daysInStage: 45,
      division: 'Partnerships',
      company: 'Adidas AG',
      brand: 'Adidas',
      amount: 750000,
      split: 112500,
      dealPercent: 15,
      commission: 16875,
      notes: 'Long-term partnership deal',
      workdayProject: null,
      schedules: []
    },
    {
      id: '3',
      name: 'Red Bull Content Series',
      owner: 'Lisa Park',
      startDate: '2024-02-01',
      closeDate: '2024-05-31',
      status: 'COMPLETED',
      stage: 'Delivered',
      daysInStage: 15,
      division: 'Content',
      company: 'Red Bull GmbH',
      brand: 'Red Bull',
      amount: 300000,
      split: 45000,
      dealPercent: 15,
      commission: 6750,
      notes: 'Content creation and social media campaign',
      workdayProject: 'WD-2024-002',
      schedules: [
        { name: 'Upfront Payment', amount: 22500, terms: 'Net 15', status: 'PAID', paymentStatus: 'RECEIVED' },
        { name: 'Final Payment', amount: 22500, terms: 'Net 30', status: 'PAID', paymentStatus: 'RECEIVED' },
      ]
    }
  ]

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default'
      case 'IN_PROGRESS':
        return 'secondary'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleViewDetails = (dealId: string) => {
    router.push(`/deals/${dealId}`)
  }


  const inProgressDeals = deals.filter(deal => deal.status === 'IN_PROGRESS')
  const completedDeals = deals.filter(deal => deal.status === 'COMPLETED')

  // Group deals by brand with full deal information
  const brandGroups = Object.values(
    deals.reduce((acc, deal) => {
      if (!acc[deal.brand]) {
        acc[deal.brand] = {
          brand: deal.brand,
          deals: [],
          totalRevenue: 0,
          talentRevenue: 0,
          wassermanRevenue: 0,
        }
      }
      acc[deal.brand].deals.push(deal)
      acc[deal.brand].totalRevenue += deal.amount
      acc[deal.brand].talentRevenue += deal.talentAmount
      acc[deal.brand].wassermanRevenue += deal.wassermanAmount
      return acc
    }, {} as Record<string, { brand: string; deals: any[]; totalRevenue: number; talentRevenue: number; wassermanRevenue: number }>)
  ).sort((a, b) => b.totalRevenue - a.totalRevenue)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Deals</span>
            </div>
            <div className="text-2xl font-bold">{deals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium">Total Deal Revenue</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.amount, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Talent Revenue</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.talentAmount, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Wasserman Revenue</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.wassermanAmount, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Split Percentage Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Split Percentage Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Default Split Percentage
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={splitPercentage}
                  onChange={(e) => handleSplitPercentageChange(Number(e.target.value))}
                  className="w-32"
                  min="0"
                  max="100"
                  step="0.01"
                />
                <Button
                  onClick={saveMarketingFeePercentage}
                  disabled={!hasUnsavedChanges || isUpdating}
                  size="sm"
                  variant={hasUnsavedChanges ? "default" : "outline"}
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Estimated commission on future deals</div>
              <div className="font-semibold">
                {formatCurrency(1000000 * (splitPercentage / 100))} on $1M deal
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deals Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Deals</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="brands">By Brand</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Deals List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  All Deals ({deals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No deals found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {deals.map((deal) => {
                      const isExpanded = expandedDeals.has(deal.id)
                      const hasProducts = deal.products && deal.products.length > 0

                      return (
                        <div key={deal.id} className="space-y-1">
                          {/* Deal Item */}
                          <div
                            className={`p-3 border rounded-lg transition-colors ${
                              selectedDealForView?.id === deal.id && !selectedProduct
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {/* Chevron for expansion */}
                              {hasProducts && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleDealExpansion(deal.id)
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

                              {/* Deal Content */}
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                  setSelectedDealForView(deal)
                                  setSelectedProduct(null)
                                }}
                              >
                                <div className="font-medium text-sm">{deal.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{deal.brand}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {deal.stage}
                                  </Badge>
                                  {hasProducts && (
                                    <span className="text-xs text-muted-foreground">
                                      {deal.products.length} deliverable{deal.products.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {formatCurrency(deal.amount)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Project Deliverables List (when expanded) */}
                          {isExpanded && hasProducts && (
                            <div className="ml-6 space-y-1">
                              {deal.products.map((product: any) => (
                                <div
                                  key={product.id}
                                  className={`p-2 pl-4 border-l-2 rounded cursor-pointer transition-colors ${
                                    selectedProduct?.id === product.id
                                      ? 'bg-primary/10 border-l-primary'
                                      : 'border-l-muted hover:bg-muted/50'
                                  }`}
                                  onClick={() => handleProductClick(product, deal)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <div className="flex-1">
                                      <div className="font-medium text-xs">{product.Project_Deliverables__c || product.Product_Name__c || 'Unnamed Deliverable'}</div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        {product.ProductCode && (
                                          <span>{product.ProductCode}</span>
                                        )}
                                        {product.TotalPrice && (
                                          <span className="flex items-center gap-0.5">
                                            <DollarSign className="h-2.5 w-2.5" />
                                            {formatCurrency(Number(product.TotalPrice))}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Deal/Product Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedProduct
                      ? selectedProduct.Project_Deliverables__c || selectedProduct.Product_Name__c || 'Deliverable Details'
                      : selectedDealForView
                        ? selectedDealForView.name
                        : deals[0]?.name || 'Select a deal or deliverable to view details'}
                  </CardTitle>
                  {selectedProduct && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(null)}
                    >
                      Back to Deal
                    </Button>
                  )}
                  {!selectedProduct && (selectedDealForView || deals[0]) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/deals/${(selectedDealForView || deals[0]).id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedProduct ? (
                  /* Deliverable Details View */
                  <div className="space-y-6">
                    {/* Deliverable Information */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Deliverable Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.Project_Deliverables__c && (
                          <div className="col-span-2">
                            <div className="text-sm text-muted-foreground mb-1">Project Deliverables</div>
                            <div className="text-sm font-medium">{selectedProduct.Project_Deliverables__c}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Product Name</div>
                          <div className="text-sm font-medium">{selectedProduct.Product_Name__c || 'N/A'}</div>
                        </div>
                        {selectedProduct.ProductCode && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Product Code</div>
                            <div className="text-sm font-medium">{selectedProduct.ProductCode}</div>
                          </div>
                        )}
                        {selectedProduct.TotalPrice && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                            <div className="text-sm font-medium">{formatCurrency(Number(selectedProduct.TotalPrice))}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Associated Deal Info */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Associated Deal</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Deal Name</div>
                          <div className="text-sm font-medium">{selectedProduct.deal.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Brand</div>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Building className="h-3 w-3" />
                            {selectedProduct.deal.brand}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Schedules as Cards - From product's schedules */}
                    {(() => {
                      // Schedules are already associated with the product
                      const deliverableSchedules = selectedProduct.schedules || []

                      // Helper function to determine payment status
                      const getPaymentStatus = (schedule: any) => {
                        if (schedule.WD_Payment_Status__c?.toLowerCase() === 'paid') {
                          return { label: 'Paid', variant: 'default', className: 'bg-green-100 text-green-800' }
                        }
                        if (schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') {
                          return { label: 'Invoiced', variant: 'secondary', className: '' }
                        }
                        return { label: 'Pending', variant: 'outline', className: '' }
                      }

                      return deliverableSchedules.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold">Payment Schedules ({deliverableSchedules.length})</h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {deliverableSchedules.map((schedule: any) => {
                              const paymentStatus = getPaymentStatus(schedule)
                              return (
                                <Card key={schedule.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">{formatDate(schedule.ScheduleDate)}</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Revenue</span>
                                        <span className="font-medium">{formatCurrency(schedule.Revenue ? Number(schedule.Revenue) : 0)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Talent</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                          {formatCurrency(schedule.Talent_Invoice_Line_Amount__c ? Number(schedule.Talent_Invoice_Line_Amount__c) : 0)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Wasserman</span>
                                        <span className="font-medium text-orange-600 dark:text-orange-400">
                                          {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c ? Number(schedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={paymentStatus.variant as any} className={`text-xs ${paymentStatus.className}`}>
                                          {paymentStatus.label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No payment schedules for this deliverable</p>
                        </div>
                      )
                    })()}
                  </div>
                ) : !selectedDealForView && !deals[0] ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No deals available</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const activeDeal = selectedDealForView || deals[0]
                      return (
                        <>
                          {/* Summary Stats */}
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                Deal Amount
                              </div>
                              <div className="text-2xl font-bold">
                                {formatCurrency(activeDeal.amount)}
                              </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                Talent Amount
                              </div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(activeDeal.talentAmount)}
                              </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <TrendingUp className="h-4 w-4" />
                                Wasserman Amount
                              </div>
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(activeDeal.wassermanAmount)}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Deal Information */}
                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Deal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Brand</div>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <Building className="h-3 w-3" />
                                  {activeDeal.brand}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Stage</div>
                                <Badge variant="outline">{activeDeal.stage}</Badge>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Close Date</div>
                                <div className="text-sm font-medium">{formatDate(activeDeal.closeDate)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Owner</div>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <UserIcon className="h-3 w-3" />
                                  {activeDeal.owner}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Split Percentage</div>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  
                                  {Number(activeDeal.splitPercent)}%
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Schedules */}
                          {activeDeal.schedules && activeDeal.schedules.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold">Payment Schedules ({activeDeal.schedules.length})</h3>
                              <div className="space-y-2">
                                {activeDeal.schedules.map((schedule: any) => (
                                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span>{formatDate(schedule.ScheduleDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Revenue</div>
                                        <div className="font-medium">{formatCurrency(schedule.Revenue ? Number(schedule.Revenue) : 0)}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Talent</div>
                                        <div className="font-medium text-green-600 dark:text-green-400">
                                          {formatCurrency(schedule.Talent_Invoice_Line_Amount__c ? Number(schedule.Talent_Invoice_Line_Amount__c) : 0)}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Wasserman</div>
                                        <div className="font-medium text-orange-600 dark:text-orange-400">
                                          {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c ? Number(schedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Deals List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  In Progress ({inProgressDeals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inProgressDeals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No deals in progress</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {inProgressDeals.map((deal) => {
                      const isExpanded = expandedDeals.has(deal.id)
                      const hasProducts = deal.products && deal.products.length > 0

                      return (
                        <div key={deal.id} className="space-y-1">
                          {/* Deal Item */}
                          <div
                            className={`p-3 border rounded-lg transition-colors ${
                              selectedDealForView?.id === deal.id && !selectedProduct
                                ? 'bg-primary/10 border-primary'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {hasProducts && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleDealExpansion(deal.id)
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

                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => {
                                  setSelectedDealForView(deal)
                                  setSelectedProduct(null)
                                }}
                              >
                                <div className="font-medium text-sm">{deal.name}</div>
                                <div className="text-xs text-muted-foreground mt-1">{deal.brand}</div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {deal.stage}
                                  </Badge>
                                  {hasProducts && (
                                    <span className="text-xs text-muted-foreground">
                                      {deal.products.length} deliverable{deal.products.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {formatCurrency(deal.amount)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Project Deliverables List (when expanded) */}
                          {isExpanded && hasProducts && (
                            <div className="ml-6 space-y-1">
                              {deal.products.map((product: any) => (
                                <div
                                  key={product.id}
                                  className={`p-2 pl-4 border-l-2 rounded cursor-pointer transition-colors ${
                                    selectedProduct?.id === product.id
                                      ? 'bg-primary/10 border-l-primary'
                                      : 'border-l-muted hover:bg-muted/50'
                                  }`}
                                  onClick={() => handleProductClick(product, deal)}
                                >
                                  <div className="flex items-center gap-2">
                                    <Package className="h-3 w-3 text-muted-foreground" />
                                    <div className="flex-1">
                                      <div className="font-medium text-xs">{product.Project_Deliverables__c || product.Product_Name__c || 'Unnamed Deliverable'}</div>
                                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        {product.ProductCode && (
                                          <span>{product.ProductCode}</span>
                                        )}
                                        {product.TotalPrice && (
                                          <span className="flex items-center gap-0.5">
                                            <DollarSign className="h-2.5 w-2.5" />
                                            {formatCurrency(Number(product.TotalPrice))}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Deal/Product Details - Reuse same component from All Deals */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedProduct
                      ? selectedProduct.Project_Deliverables__c || selectedProduct.Product_Name__c || 'Deliverable Details'
                      : selectedDealForView
                        ? selectedDealForView.name
                        : inProgressDeals[0]?.name || 'Select a deal or deliverable'}
                  </CardTitle>
                  {selectedProduct && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProduct(null)}
                    >
                      Back to Deal
                    </Button>
                  )}
                  {!selectedProduct && (selectedDealForView || inProgressDeals[0]) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/deals/${(selectedDealForView || inProgressDeals[0]).id}`)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedProduct ? (
                  /* Deliverable Details View - Same as All Deals */
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Deliverable Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.Project_Deliverables__c && (
                          <div className="col-span-2">
                            <div className="text-sm text-muted-foreground mb-1">Project Deliverables</div>
                            <div className="text-sm font-medium">{selectedProduct.Project_Deliverables__c}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Product Name</div>
                          <div className="text-sm font-medium">{selectedProduct.Product_Name__c || 'N/A'}</div>
                        </div>
                        {selectedProduct.ProductCode && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Product Code</div>
                            <div className="text-sm font-medium">{selectedProduct.ProductCode}</div>
                          </div>
                        )}
                        {selectedProduct.TotalPrice && (
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Total Price</div>
                            <div className="text-sm font-medium">{formatCurrency(Number(selectedProduct.TotalPrice))}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold">Associated Deal</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Deal Name</div>
                          <div className="text-sm font-medium">{selectedProduct.deal.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Brand</div>
                          <div className="flex items-center gap-1 text-sm font-medium">
                            <Building className="h-3 w-3" />
                            {selectedProduct.deal.brand}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {(() => {
                      const deliverableSchedules = selectedProduct.schedules || []
                      const getPaymentStatus = (schedule: any) => {
                        if (schedule.WD_Payment_Status__c?.toLowerCase() === 'paid') {
                          return { label: 'Paid', variant: 'default', className: 'bg-green-100 text-green-800' }
                        }
                        if (schedule.WD_Invoice_ID__c && schedule.WD_Invoice_ID__c !== '') {
                          return { label: 'Invoiced', variant: 'secondary', className: '' }
                        }
                        return { label: 'Pending', variant: 'outline', className: '' }
                      }

                      return deliverableSchedules.length > 0 ? (
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold">Payment Schedules ({deliverableSchedules.length})</h3>
                          <div className="grid gap-3 md:grid-cols-2">
                            {deliverableSchedules.map((schedule: any) => {
                              const paymentStatus = getPaymentStatus(schedule)
                              return (
                                <Card key={schedule.id}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium text-sm">{formatDate(schedule.ScheduleDate)}</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Revenue</span>
                                        <span className="font-medium">{formatCurrency(schedule.Revenue ? Number(schedule.Revenue) : 0)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Talent</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                          {formatCurrency(schedule.Talent_Invoice_Line_Amount__c ? Number(schedule.Talent_Invoice_Line_Amount__c) : 0)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Wasserman</span>
                                        <span className="font-medium text-orange-600 dark:text-orange-400">
                                          {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c ? Number(schedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between pt-2 border-t">
                                        <span className="text-muted-foreground">Status</span>
                                        <Badge variant={paymentStatus.variant as any} className={`text-xs ${paymentStatus.className}`}>
                                          {paymentStatus.label}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>No payment schedules for this deliverable</p>
                        </div>
                      )
                    })()}
                  </div>
                ) : !selectedDealForView && !inProgressDeals[0] ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No deals in progress</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {(() => {
                      const activeDeal = selectedDealForView || inProgressDeals[0]
                      return (
                        <>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                Deal Amount
                              </div>
                              <div className="text-2xl font-bold">
                                {formatCurrency(activeDeal.amount)}
                              </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <DollarSign className="h-4 w-4" />
                                Talent Amount
                              </div>
                              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {formatCurrency(activeDeal.talentAmount)}
                              </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                <TrendingUp className="h-4 w-4" />
                                Wasserman Amount
                              </div>
                              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(activeDeal.wassermanAmount)}
                              </div>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h3 className="text-sm font-semibold">Deal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Brand</div>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <Building className="h-3 w-3" />
                                  {activeDeal.brand}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Stage</div>
                                <Badge variant="outline">{activeDeal.stage}</Badge>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Close Date</div>
                                <div className="text-sm font-medium">{formatDate(activeDeal.closeDate)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Owner</div>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  <UserIcon className="h-3 w-3" />
                                  {activeDeal.owner}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Split Percentage</div>
                                <div className="flex items-center gap-1 text-sm font-medium">
                                  {Number(activeDeal.splitPercent)}%
                                </div>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {activeDeal.schedules && activeDeal.schedules.length > 0 && (
                            <div className="space-y-4">
                              <h3 className="text-sm font-semibold">Payment Schedules ({activeDeal.schedules.length})</h3>
                              <div className="space-y-2">
                                {activeDeal.schedules.map((schedule: any) => (
                                  <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-muted-foreground" />
                                      <span>{formatDate(schedule.ScheduleDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Revenue</div>
                                        <div className="font-medium">{formatCurrency(schedule.Revenue ? Number(schedule.Revenue) : 0)}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Talent</div>
                                        <div className="font-medium text-green-600 dark:text-green-400">
                                          {formatCurrency(schedule.Talent_Invoice_Line_Amount__c ? Number(schedule.Talent_Invoice_Line_Amount__c) : 0)}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs text-muted-foreground">Wasserman</div>
                                        <div className="font-medium text-orange-600 dark:text-orange-400">
                                          {formatCurrency(schedule.Wasserman_Invoice_Line_Amount__c ? Number(schedule.Wasserman_Invoice_Line_Amount__c) : 0)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-6 lg:grid-cols-3">
            <DealListPanel
              deals={completedDeals}
              title={`Completed (${completedDeals.length})`}
              selectedDeal={selectedDealForView}
              selectedProduct={selectedProduct}
              expandedDeals={expandedDeals}
              onDealClick={(deal) => {
                setSelectedDealForView(deal)
                setSelectedProduct(null)
              }}
              onProductClick={handleProductClick}
              onToggleExpansion={toggleDealExpansion}
              formatCurrency={formatCurrency}
            />

            <DealDetailsPanel
              selectedDeal={selectedDealForView}
              selectedProduct={selectedProduct}
              defaultDeal={completedDeals[0]}
              emptyMessage="No completed deals"
              onBackToDeal={() => setSelectedProduct(null)}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </div>
        </TabsContent>

        <TabsContent value="brands">
          <div className="grid gap-6 lg:grid-cols-3">
            <BrandListPanel
              brandGroups={brandGroups}
              selectedBrand={selectedBrand}
              onBrandClick={(brand) => setSelectedBrand(brand)}
              formatCurrency={formatCurrency}
            />

            <BrandDetailsPanel
              brandGroup={brandGroups.find(g => g.brand === selectedBrand) || (brandGroups.length > 0 ? brandGroups[0] : null)}
              emptyMessage="Select a brand to view details"
              formatCurrency={formatCurrency}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}