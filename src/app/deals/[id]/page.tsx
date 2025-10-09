'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '../../../components/layout/app-layout'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Separator } from '../../../components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { DealOverview } from '../../../components/deals/deal-overview'
import { DealTimeline } from '../../../components/deals/deal-timeline'
import { DealProducts } from '../../../components/deals/deal-products'
import { DealSchedules } from '../../../components/deals/deal-schedules'
import { DealNotes } from '../../../components/deals/deal-notes'
import { DealPayments } from '../../../components/deals/deal-payments'
import { DealAttachments } from '../../../components/deals/deal-attachments'
import { DealExportDialog } from '../../../components/deals/deal-export-dialog'
import Image from 'next/image'
import {
  ArrowLeft,
  Signature,
  ExternalLink,
  Loader2,
  Briefcase,
  CalendarDays,
  Building,
  User,
  DollarSign,
  Target,
  Calculator,
  Percent,
  ArrowUpRight,
  Trash2,
  Pencil,
  Share2,
} from 'lucide-react'
import { useDeal, dealKeys } from '../../../hooks/useDeals'
import { useSchedulesByDeal } from '../../../hooks/useSchedules'
import { Deal } from '../../../types'
import { useLabels } from '../../../hooks/useLabels'
import { useUser } from '../../../contexts/user-context'

interface DealDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { labels } = useLabels()
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')
  const [highlightedScheduleId, setHighlightedScheduleId] = useState<string | undefined>(undefined)
  const [highlightedPaymentId, setHighlightedPaymentId] = useState<string | undefined>(undefined)
  const [highlightedProductId, setHighlightedProductId] = useState<string | undefined>(undefined)
  const [isDeleting, setIsDeleting] = useState(false)
  const { id } = use(params)

  const { data: deal, isLoading, error } = useDeal(id)
  const { data: schedulesResponse } = useSchedulesByDeal(id)

  // Edit dialog states
  const [isEditingDealInfo, setIsEditingDealInfo] = useState(false)
  const [isEditingOwnerInfo, setIsEditingOwnerInfo] = useState(false)
  const [isEditingContractInfo, setIsEditingContractInfo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Export dialog state
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

  // Form states for Deal Information
  const [editStage, setEditStage] = useState('')
  const [editIndustry, setEditIndustry] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editCloseDate, setEditCloseDate] = useState('')

  // Form states for Owner Information
  const [editOwner, setEditOwner] = useState('')
  const [editCostCenter, setEditCostCenter] = useState('')
  const [editCompanyReference, setEditCompanyReference] = useState('')

  // Form states for Contract Management
  const [editClmContractNumber, setEditClmContractNumber] = useState('')

  const getStageVariant = (stage: string) => {
    switch (stage) {
      case 'Closed Won':
      case 'CLOSED_WON':
        return 'default'
      case 'Closed Lost':
      case 'CLOSED_LOST':
        return 'destructive'
      case 'Negotiation':
      case 'NEGOTIATION':
        return 'secondary'
      case 'Proposal':
      case 'PROPOSAL':
        return 'outline'
      default:
        return 'secondary'
    }
  }

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

  const calculateCommission = () => {
    const schedules = schedulesResponse?.data || []
    const totalWassermanAmount = schedules.reduce((sum, schedule) => {
      const wassermanAmount = typeof schedule.Wasserman_Invoice_Line_Amount__c === 'string'
        ? parseFloat(schedule.Wasserman_Invoice_Line_Amount__c)
        : (schedule.Wasserman_Invoice_Line_Amount__c || 0)
      return sum + (isNaN(wassermanAmount) ? 0 : wassermanAmount)
    }, 0)
    return totalWassermanAmount
  }

  const calculateRecognizedCommissionFee = () => {
    if (!deal || !deal.Amount) return 0
    const commission = calculateCommission()
    return deal.Amount > 0 ? (commission / deal.Amount) * 100 : 0
  }

  const handleExternalLink = (type: 'salesforce' | 'workday') => {
    const dealId = type === 'salesforce' ? deal?.salesforceId : deal?.workdayProjectId
    if (dealId) {
      // In a real app, these would be proper external URLs
      if (type === 'salesforce') {
        window.open(`https://teamwass--uat072825.sandbox.lightning.force.com/lightning/r/Opportunity/${deal?.OpportunityId__c}/view`, '_blank')
      } else {
        window.open(`https://wd5.myworkday.com/teamwass/d/inst/1$1732/${deal?.Workday_Project_WID__c}.htmld`, '_blank')
      }
      console.log(`Opening ${type} with ID: ${dealId}`)
    }
  }

  const handleDelete = async () => {
    if (!deal) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${deal.Name}"?\n\nThis action cannot be undone and will permanently delete the ${labels.deal.toLowerCase()}, along with all associated products, schedules, notes, and attachments.`
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/api/deals/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete deal')
      }

      // Redirect to deals list
      router.push('/deals')
    } catch (error) {
      console.error('Error deleting deal:', error)
      alert(`Failed to delete ${labels.deal.toLowerCase()}. Please try again.`)
      setIsDeleting(false)
    }
  }

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const handleEditDealInfo = () => {
    if (!deal) return

    // Use current stage value or default to Initial Outreach
    let stageValue = deal.StageName || 'Initial Outreach'
    const validStages = ['Initial Outreach', 'Negotiation', 'Terms Agreed Upon', 'Closed Won']

    // If the current stage is not in the valid list, default to Initial Outreach
    if (!validStages.includes(stageValue)) {
      console.warn(`Stage "${stageValue}" is not valid. Defaulting to Initial Outreach`)
      stageValue = 'Initial Outreach'
    }

    setEditStage(stageValue)
    setEditIndustry(deal.Account_Industry__c || '')
    setEditStartDate(formatDateForInput(deal.Contract_Start_Date__c))
    setEditCloseDate(formatDateForInput(deal.Contract_End_Date__c))
    setIsEditingDealInfo(true)
  }

  const handleEditOwnerInfo = () => {
    if (!deal) return
    setEditOwner(deal.owner?.name || '')
    setEditCostCenter(deal.Owner_Workday_Cost_Center__c || '')
    setEditCompanyReference(deal.CompanyReference__c || '')
    setIsEditingOwnerInfo(true)
  }

  const handleEditContractInfo = () => {
    if (!deal) return
    setEditClmContractNumber(deal.clmContractNumber || '')
    setIsEditingContractInfo(true)
  }

  const handleSaveDealInfo = async () => {
    if (!deal) return

    setIsSaving(true)
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:3001'

      // Convert date strings to ISO DateTime format if they exist
      const formatDateTimeForAPI = (dateString: string) => {
        if (!dateString) return undefined
        try {
          const date = new Date(dateString)
          return date.toISOString()
        } catch {
          return undefined
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/deals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          StageName: editStage || undefined,
          Account_Industry__c: editIndustry || undefined,
          Contract_Start_Date__c: formatDateTimeForAPI(editStartDate),
          Contract_End_Date__c: formatDateTimeForAPI(editCloseDate),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update deal')
      }

      // Refresh deal data
      await queryClient.invalidateQueries({ queryKey: dealKeys.detail(id) })
      setIsEditingDealInfo(false)
    } catch (error) {
      console.error('Error updating deal:', error)
      alert('Failed to update deal information. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveOwnerInfo = async () => {
    if (!deal) return

    setIsSaving(true)
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/api/deals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Owner_Workday_Cost_Center__c: editCostCenter,
          CompanyReference__c: editCompanyReference,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update deal')
      }

      // Refresh deal data
      await queryClient.invalidateQueries({ queryKey: dealKeys.detail(id) })
      setIsEditingOwnerInfo(false)
    } catch (error) {
      console.error('Error updating deal:', error)
      alert('Failed to update owner information. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveContractInfo = async () => {
    if (!deal) return

    setIsSaving(true)
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/api/deals/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clmContractNumber: editClmContractNumber,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update deal')
      }

      // Refresh deal data
      await queryClient.invalidateQueries({ queryKey: dealKeys.detail(id) })
      setIsEditingContractInfo(false)
    } catch (error) {
      console.error('Error updating deal:', error)
      alert('Failed to update contract information. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading deal details...</span>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading {labels.deal}</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : `Failed to load ${labels.deal.toLowerCase()} details`}
            </p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!deal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold">{labels.deal} Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2">
              The {labels.deal.toLowerCase()} you're looking for doesn't exist.
            </p>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExportDialogOpen(true)}
              className="h-9 px-3 hover:bg-accent transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            {deal.salesforceId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExternalLink('salesforce')}
                className="h-9 px-3 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
              >
                <Image src="/salesforce.png" alt="Salesforce" width={20} height={20} className="opacity-80 hover:opacity-100 transition-opacity" />
              </Button>
            )}
            {deal.workdayProjectId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExternalLink('workday')}
                className="h-9 px-3 hover:bg-orange-50 dark:hover:bg-orange-950 transition-colors"
              >
                <Image src="/workday.png" alt="Workday" width={20} height={20} className="opacity-80 hover:opacity-100 transition-opacity" />
              </Button>
            )}
            {user?.userType === 'ADMINISTRATOR' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-9 px-3 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Deal Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {deal.Name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {/* <Badge variant={getStageVariant(deal.StageName)}>
              {deal.StageName}
            </Badge> */}
            {deal.division && (
              <span className="text-sm text-muted-foreground">
                {deal.division}
              </span>
            )}
          </div>
        </div>

        {/* Deal Information Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Deal Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {labels.deal} Information
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditDealInfo}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant="outline">{deal.Status__c}</Badge>
                </div> */}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Stage</span>
                  <Badge variant="secondary">{deal.StageName || 'N/A'}</Badge>
                </div>

                {deal.division && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Division</span>
                    <span className="text-sm text-muted-foreground">{deal.division}</span>
                  </div>
                )}

                {deal.company && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Company</span>
                    <span className="text-sm text-muted-foreground">{deal.company}</span>
                  </div>
                )}

                {deal.Account_Industry__c && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Industry</span>
                    <span className="text-sm text-muted-foreground">{deal.Account_Industry__c}</span>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Brand/Account</span>
                  {deal.brand?.id ? (
                    <button
                      onClick={() => router.push(`/brands/${deal.brand?.id}`)}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {deal.brand?.name || deal.Account_Name__c || 'Unknown'}
                      <ArrowUpRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {deal.Account_Name__c || 'Unknown'}
                    </span>
                  )}
                </div>

                {deal.clients && deal.clients.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Talent Client</span>
                    {deal.clients[0].talentClient?.id ? (
                      <button
                        onClick={() => router.push(`/talents/${deal.clients?.[0].talentClient?.id}`)}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {deal.clients[0].talentClient?.Name || 'Unknown'}
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {deal.clients[0].talentClient?.Name || 'Unknown'}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Start Date</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(deal.Contract_Start_Date__c)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Close Date</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(deal.Contract_End_Date__c)}
                  </span>
                </div>

                {deal.Stage_Last_Updated__c && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stage Updated</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(deal.Stage_Last_Updated__c)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Owner Information
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditOwnerInfo}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Owner</span>
                    <span className="text-sm text-muted-foreground">
                      {deal.owner?.name || deal.Licence_Holder_Name__c || 'Unassigned'}
                    </span>
                  </div>

                  {deal.owner?.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Owner Email</span>
                      <span className="text-sm text-muted-foreground">{deal.owner.email}</span>
                    </div>
                  )}

                  {deal.Owner_Workday_Cost_Center__c && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cost Center</span>
                      <span className="text-sm text-muted-foreground">
                        {deal.Owner_Workday_Cost_Center__c}
                      </span>
                    </div>
                  )}

                  {deal.CompanyReference__c && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Company Reference</span>
                      <span className="text-sm text-muted-foreground">
                        {deal.CompanyReference__c}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CLM Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Signature className="h-5 w-5" />
                    Contract Management
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditContractInfo}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">CLM Contract Number</span>
                  <span className="text-sm text-muted-foreground">{deal.clmContractNumber || '--'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financial Details
            </CardTitle>
            <CardDescription>
              {labels.deal} amounts, percentages, and commission calculations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Deal Amount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{labels.deal} Amount</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(deal.Amount)}
                </div>
                {deal.splitPercent && (
                  <div className="text-xs text-muted-foreground">
                    Split: {deal.splitPercent}%
                  </div>
                )}
              </div>

              {/* Contract Amount */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contract Amount</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(deal.Contract_Amount__c)}
                </div>
              </div>

              {/* Commission */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Commission</span>
                </div>
                <div className="text-2xl font-bold">
                  {formatCurrency(calculateCommission())}
                </div>
                {deal.dealPercent && (
                  <div className="text-xs text-muted-foreground">
                    Rate: {deal.dealPercent}%
                  </div>
                )}
              </div>
            </div>

            {/* Deal Percentages */}
            {(deal.dealPercent || deal.splitPercent || deal.Talent_Marketing_Fee_Percentage__c) && (
              <>
                <Separator className="my-6" />
                <div className="grid gap-4 md:grid-cols-2">
                  {deal.dealPercent && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{labels.deal} Percentage</span>
                      </div>
                      <span className="text-sm font-semibold">{deal.dealPercent}%</span>
                    </div>
                  )}

                  {deal.splitPercent && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Split Percentage</span>
                      </div>
                      <span className="text-sm font-semibold">{deal.splitPercent}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {deal.Talent_Marketing_Fee_Percentage__c && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Default Commission Fee</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {deal.Talent_Marketing_Fee_Percentage__c}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Recognized Commission Fee</span>
                    </div>
                    <span className="text-sm font-semibold">
                      {calculateRecognizedCommissionFee().toFixed(2)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Activity</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            {/* <TabsTrigger value="schedules">Schedules</TabsTrigger> */}
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DealOverview deal={deal} />
          </TabsContent>

          <TabsContent value="timeline">
            <DealTimeline
              deal={deal}
              onNavigateToSchedule={(scheduleId) => {
                setActiveTab('schedules')
                // Store the schedule ID to expand it
                setTimeout(() => {
                  const element = document.getElementById(`schedule-${scheduleId}`)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
                    setTimeout(() => {
                      element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
                    }, 2000)
                  }
                }, 100)
              }}
            />
          </TabsContent>

          <TabsContent value="products">
            <DealProducts
              deal={deal}
              highlightedScheduleId={highlightedScheduleId}
              highlightedProductId={highlightedProductId}
              onNavigateToPayment={(paymentId) => {
                setHighlightedPaymentId(paymentId)
                setActiveTab('payments')
                // Scroll to the payment after tab change
                setTimeout(() => {
                  // The payment will be automatically selected in the DealPayments component
                  // via the highlightedPaymentId prop
                }, 100)
              }}
            />
          </TabsContent>

          <TabsContent value="schedules">
            <DealSchedules deal={deal} />
          </TabsContent>

          <TabsContent value="payments">
            <DealPayments
              deal={deal}
              highlightedPaymentId={highlightedPaymentId}
              onNavigateToSchedule={(scheduleId) => {
                setHighlightedScheduleId(scheduleId)
                setActiveTab('products')
                // Scroll to the schedule in the products tab
                setTimeout(() => {
                  const element = document.getElementById(`schedule-${scheduleId}`)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2')
                    setTimeout(() => {
                      element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2')
                      setHighlightedScheduleId(undefined) // Clear highlight after animation
                    }, 2000)
                  }
                }, 100)
              }}
              onNavigateToProduct={(productId) => {
                setHighlightedProductId(productId)
                setActiveTab('products')
                // Wait for tab change to complete
                setTimeout(() => {
                  // Product will be automatically selected in DealProducts component
                  // via the highlightedProductId prop
                  setHighlightedProductId(undefined) // Clear after navigation
                }, 500)
              }}
            />
          </TabsContent>

          <TabsContent value="notes">
            <DealNotes deal={deal} />
          </TabsContent>

          <TabsContent value="attachments">
            <DealAttachments deal={deal} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Deal Information Dialog */}
      <Dialog open={isEditingDealInfo} onOpenChange={setIsEditingDealInfo}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit {labels.deal} Information</DialogTitle>
            <DialogDescription>
              Update the {labels.deal.toLowerCase()} details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-stage">Stage</Label>
              <Select value={editStage} onValueChange={setEditStage}>
                <SelectTrigger id="edit-stage">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Initial Outreach">Initial Outreach</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Terms Agreed Upon">Terms Agreed Upon</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={editIndustry}
                onChange={(e) => setEditIndustry(e.target.value)}
                placeholder="Enter industry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-start-date">Start Date</Label>
              <Input
                id="edit-start-date"
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-close-date">Close Date</Label>
              <Input
                id="edit-close-date"
                type="date"
                value={editCloseDate}
                onChange={(e) => setEditCloseDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingDealInfo(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveDealInfo} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Owner Information Dialog */}
      <Dialog open={isEditingOwnerInfo} onOpenChange={setIsEditingOwnerInfo}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Owner Information</DialogTitle>
            <DialogDescription>
              Update the owner details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-owner">Owner</Label>
              <Input
                id="edit-owner"
                value={editOwner}
                disabled
                placeholder="Owner (read-only)"
              />
              <p className="text-xs text-muted-foreground">
                Owner assignment cannot be changed here
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cost-center">Cost Center</Label>
              <Input
                id="edit-cost-center"
                value={editCostCenter}
                onChange={(e) => setEditCostCenter(e.target.value)}
                placeholder="Enter cost center"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company-reference">Company Reference</Label>
              <Input
                id="edit-company-reference"
                value={editCompanyReference}
                onChange={(e) => setEditCompanyReference(e.target.value)}
                placeholder="Enter company reference"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingOwnerInfo(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveOwnerInfo} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contract Management Dialog */}
      <Dialog open={isEditingContractInfo} onOpenChange={setIsEditingContractInfo}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contract Management</DialogTitle>
            <DialogDescription>
              Update the contract details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clm-contract-number">CLM Contract Number</Label>
              <Input
                id="edit-clm-contract-number"
                value={editClmContractNumber}
                onChange={(e) => setEditClmContractNumber(e.target.value)}
                placeholder="Enter CLM contract number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingContractInfo(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveContractInfo} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <DealExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        deal={deal}
      />
    </AppLayout>
  )
}