'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  DollarSign,
  Briefcase,
  Building,
  Percent,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle,
  Save,
  Loader2,
} from 'lucide-react'

import { TalentDetail } from '../../types/talent'
import { TalentService } from '../../services/talent'

interface TalentDealsProps {
  talent: TalentDetail
}

export function TalentDeals({ talent }: TalentDealsProps) {
  const [splitPercentage, setSplitPercentage] = useState(talent.marketingFeePercentage || 15)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

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
  const deals = talent.deals?.map(dc => ({
    id: dc.deal.id,
    name: dc.deal.Name,
    brand: dc.deal.brand?.name || 'Unknown Brand',
    company: dc.deal.brand?.name || 'Unknown Company',
    amount: Number(dc.deal.Amount) || 0,
    split: (Number(dc.deal.Amount) * (Number(dc.splitPercent) || splitPercentage)) / 100 || 0,
    splitPercent: Number(dc.splitPercent) || splitPercentage,
    status: dc.deal.Status__c,
    startDate: dc.deal.startDate || new Date().toISOString(),
    closeDate: dc.deal.closeDate || new Date().toISOString(),
    schedules: dc.deal.schedules || [],
    owner: talent.agents?.find(ta => ta.isPrimary)?.agent?.name || talent.agents?.[0]?.agent?.name || 'Unknown Owner',
    stage: 'Active',
    daysInStage: 0,
    commission: (Number(dc.deal.Amount) * (Number(dc.splitPercent) || splitPercentage)) / 100 * 0.15,
    workdayProject: null as string | null
  })) || []

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
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


  const inProgressDeals = deals.filter(deal => deal.status === 'IN_PROGRESS')
  const completedDeals = deals.filter(deal => deal.status === 'COMPLETED')
  const dealsByBrand = deals.reduce((acc, deal) => {
    if (!acc[deal.brand]) {
      acc[deal.brand] = { revenue: 0, deals: 0, agents: new Set() }
    }
    acc[deal.brand].revenue += deal.split
    acc[deal.brand].deals += 1
    acc[deal.brand].agents.add(deal.owner)
    return acc
  }, {} as Record<string, { revenue: number; deals: number; agents: Set<string> }>)

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
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(deals.reduce((sum, deal) => sum + deal.split, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Avg Split %</span>
            </div>
            <div className="text-2xl font-bold">{avgSplitPercentage}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
            <div className="text-2xl font-bold">{inProgressDeals.length}</div>
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
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Deals</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="brands">By Brand</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Deals</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Deal
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Split</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <div className="font-medium">{deal.name}</div>
                          <div className="text-sm text-muted-foreground">{deal.company}</div>
                        </div>
                      </TableCell>
                      <TableCell>{deal.brand}</TableCell>
                      <TableCell>{deal.owner}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(deal.status)}>
                          {deal.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(deal.amount)}</TableCell>
                      <TableCell>{formatCurrency(deal.split)}</TableCell>
                      <TableCell>{formatDate(deal.closeDate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>In Progress Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {inProgressDeals.length > 0 ? (
                <div className="space-y-4">
                  {inProgressDeals.map((deal) => (
                    <div key={deal.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{deal.name}</h3>
                          <p className="text-sm text-muted-foreground">{deal.company}</p>
                        </div>
                        <Badge>{deal.stage}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Amount:</span>
                          <div className="font-medium">{formatCurrency(deal.amount)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Split:</span>
                          <div className="font-medium">{formatCurrency(deal.split)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Days in Stage:</span>
                          <div className="font-medium">{deal.daysInStage}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Close Date:</span>
                          <div className="font-medium">{formatDate(deal.closeDate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No deals in progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedDeals.map((deal) => (
                  <div key={deal.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{deal.name}</h3>
                        <p className="text-sm text-muted-foreground">{deal.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Badge variant="default">Completed</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <div className="font-medium">{formatCurrency(deal.split)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission:</span>
                        <div className="font-medium">{formatCurrency(deal.commission)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Workday:</span>
                        <div className="font-medium">
                          {deal.workdayProject ? (
                            <Button variant="ghost" size="sm" className="h-auto p-0 font-medium">
                              {deal.workdayProject}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          ) : (
                            'Not created'
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed:</span>
                        <div className="font-medium">{formatDate(deal.closeDate)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>Deals by Brand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(dealsByBrand).map(([brand, data]) => (
                  <div key={brand} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{brand}</h3>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="font-medium">{formatCurrency(data.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deals:</span>
                        <span className="font-medium">{data.deals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agents:</span>
                        <span className="font-medium">{data.agents.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}