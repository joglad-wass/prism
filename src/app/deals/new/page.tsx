'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../../components/layout/app-layout'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Separator } from '../../../components/ui/separator'
import { ArrowLeft, Plus, X, Save, Loader2, Search, Upload, FileText, Trash2 } from 'lucide-react'
import { useLabels } from '../../../hooks/useLabels'
import { useBrandSearch } from '../../../hooks/useBrands'
import { useAgentSearch } from '../../../hooks/useAgents'
import { useUser } from '../../../contexts/user-context'
import { useFilter } from '../../../contexts/filter-context'
import { formatFileSize, validateFileSize, fileToBase64 } from '../../../utils/file'
import { DealCreationSummary } from '../../../components/deals/deal-creation-summary'

interface Product {
  id: string
  productName: string
  productCode: string
  unitPrice: string
  quantity: string
  totalPrice: string
  deliverables: string
  startDate: string
  endDate: string
  division: string
}

interface Schedule {
  id: string
  productId?: string
  description: string
  scheduleDate: string
  revenue: string
  paymentTerms: string
  type: string
  splitPercent: string
  talentAmount: string
  commissionAmount: string
  billable: boolean
  agentSplits?: Record<string, string> // agentId or custom name -> split percentage
}

export default function NewDealPage() {
  const router = useRouter()
  const { labels } = useLabels()
  const { user } = useUser()
  const { filterSelection } = useFilter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Deal Information
  const [dealName, setDealName] = useState('')
  const [stage, setStage] = useState('Initial Outreach')
  const [division, setDivision] = useState('')
  const [industry, setIndustry] = useState('')
  const [description, setDescription] = useState('')

  // Relationships
  const [brandId, setBrandId] = useState('')
  const [selectedBrandName, setSelectedBrandName] = useState('')
  const [brandSearchTerm, setBrandSearchTerm] = useState('')
  const [showBrandDropdown, setShowBrandDropdown] = useState(false)
  const brandDropdownRef = useRef<HTMLDivElement>(null)

  const [talentClientIds, setTalentClientIds] = useState<string[]>([])

  const [ownerId, setOwnerId] = useState('')
  const [selectedOwnerName, setSelectedOwnerName] = useState('')
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('')
  const [showOwnerDropdown, setShowOwnerDropdown] = useState(false)
  const [ownerManuallyCleared, setOwnerManuallyCleared] = useState(false)
  const ownerDropdownRef = useRef<HTMLDivElement>(null)

  // Additional Agents
  const [additionalAgentIds, setAdditionalAgentIds] = useState<string[]>([])
  const [selectedAdditionalAgents, setSelectedAdditionalAgents] = useState<Array<{id: string, name: string}>>([])
  const [additionalAgentSearchTerm, setAdditionalAgentSearchTerm] = useState('')
  const [showAdditionalAgentDropdown, setShowAdditionalAgentDropdown] = useState(false)
  const additionalAgentDropdownRef = useRef<HTMLDivElement>(null)

  // Financial Details
  const [amount, setAmount] = useState('')
  const [contractAmount, setContractAmount] = useState('')
  const [splitPercent, setSplitPercent] = useState('')
  const [splitOnScheduleBasis, setSplitOnScheduleBasis] = useState(false)
  const [agentSplits, setAgentSplits] = useState<Record<string, string>>({})
  const [customSplitName, setCustomSplitName] = useState('')
  const [showCustomSplitInput, setShowCustomSplitInput] = useState<string | null>(null) // scheduleId

  // Dates
  const [contractStartDate, setContractStartDate] = useState('')
  const [contractEndDate, setContractEndDate] = useState('')
  const [closeDate, setCloseDate] = useState('')

  // CLM Contract Management
  const [clmContractNumber, setClmContractNumber] = useState('')

  // Attachments
  const [attachments, setAttachments] = useState<Array<{file: File, description: string}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Products
  const [products, setProducts] = useState<Product[]>([])

  // Schedules
  const [schedules, setSchedules] = useState<Schedule[]>([])

  // Get cost center filters
  const costCenter = filterSelection.type === 'individual' ? filterSelection.value || undefined : undefined
  const costCenterGroup = filterSelection.type === 'group' ? filterSelection.value || undefined : undefined

  // Brand search
  const { data: brandSearchResults } = useBrandSearch(brandSearchTerm, 20)
  const brands = brandSearchResults?.data || []

  // Agent/Owner search with cost center filtering
  const { data: ownerSearchResults } = useAgentSearch(
    ownerSearchTerm,
    costCenter,
    costCenterGroup,
    20
  )
  const owners = ownerSearchResults?.data || []

  // Additional agent search with cost center filtering
  const { data: additionalAgentSearchResults } = useAgentSearch(
    additionalAgentSearchTerm,
    costCenter,
    costCenterGroup,
    20
  )
  const additionalAgents = additionalAgentSearchResults?.data || []

  // Default owner to current user if they're an agent (only if not manually cleared)
  useEffect(() => {
    if (user && user.userType === 'AGENT' && user.email && !ownerId && !ownerManuallyCleared) {
      // Fetch agent by email to get ID
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/agents?search=${user.email}&limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data && data.data.length > 0) {
            const agent = data.data[0]
            setOwnerId(agent.id)
            setSelectedOwnerName(agent.name)
          }
        })
        .catch(err => console.error('Failed to fetch agent:', err))
    }
  }, [user, ownerId, ownerManuallyCleared])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setShowBrandDropdown(false)
      }
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target as Node)) {
        setShowOwnerDropdown(false)
      }
      if (additionalAgentDropdownRef.current && !additionalAgentDropdownRef.current.contains(event.target as Node)) {
        setShowAdditionalAgentDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cascade product total price from schedules
  useEffect(() => {
    products.forEach((product) => {
      const productSchedules = schedules.filter((s) => s.productId === product.id)
      if (productSchedules.length > 0) {
        const totalRevenue = productSchedules.reduce((sum, s) => sum + (parseFloat(s.revenue) || 0), 0)
        if (parseFloat(product.totalPrice) !== totalRevenue) {
          updateProduct(product.id, 'totalPrice', totalRevenue.toFixed(2))
        }
      }
    })
  }, [schedules])

  // Cascade deal amount from products
  useEffect(() => {
    if (products.length > 0) {
      const totalAmount = products.reduce((sum, p) => sum + (parseFloat(p.totalPrice) || 0), 0)
      if (parseFloat(amount) !== totalAmount) {
        setAmount(totalAmount.toFixed(2))
      }
    }
  }, [products])

  // Initialize agent splits when agents change
  useEffect(() => {
    const allAgentIds = [...additionalAgentIds]
    if (ownerId && !allAgentIds.includes(ownerId)) {
      allAgentIds.push(ownerId)
    }

    if (allAgentIds.length > 0) {
      // Always recalculate to equal splits when agents change
      const equalSplit = (100 / allAgentIds.length).toFixed(2)
      const newSplits: Record<string, string> = {}
      allAgentIds.forEach(id => {
        newSplits[id] = equalSplit
      })
      setAgentSplits(newSplits)

      // If splitOnScheduleBasis is enabled, update agent splits for all schedules
      if (splitOnScheduleBasis) {
        const updatedSchedules = schedules.map(s => {
          const scheduleSplits: Record<string, string> = {}
          allAgentIds.forEach(id => {
            scheduleSplits[id] = s.agentSplits?.[id] || equalSplit
          })
          return { ...s, agentSplits: scheduleSplits }
        })
        setSchedules(updatedSchedules)
      }
    } else {
      setAgentSplits({})
    }
  }, [ownerId, additionalAgentIds])

  // Auto-calculate deal split % when schedules have splits
  useEffect(() => {
    // Check if any schedule has a split percentage entered
    const schedulesWithSplits = schedules.filter(s => s.splitPercent && parseFloat(s.splitPercent) > 0)

    if (schedulesWithSplits.length > 0) {
      // Calculate weighted average split % from schedules based on revenue
      const schedulesWithRevenue = schedulesWithSplits.filter(s => s.revenue && parseFloat(s.revenue) > 0)

      if (schedulesWithRevenue.length > 0) {
        const totalRevenue = schedulesWithRevenue.reduce((sum, s) =>
          sum + (parseFloat(s.revenue) || 0), 0
        )

        if (totalRevenue > 0) {
          const weightedSplit = schedulesWithRevenue.reduce((sum, s) => {
            const revenue = parseFloat(s.revenue) || 0
            const split = parseFloat(s.splitPercent) || 0
            return sum + (split * revenue / totalRevenue)
          }, 0)
          setSplitPercent(weightedSplit.toFixed(2))
        }
      } else {
        // If no revenue data, use simple average
        const avgSplit = schedulesWithSplits.reduce((sum, s) =>
          sum + (parseFloat(s.splitPercent) || 0), 0
        ) / schedulesWithSplits.length
        setSplitPercent(avgSplit.toFixed(2))
      }
    }
  }, [schedules])

  const handleBrandSelect = (id: string, name: string) => {
    setBrandId(id)
    setSelectedBrandName(name)
    setBrandSearchTerm('')
    setShowBrandDropdown(false)
  }

  const handleClearBrand = () => {
    setBrandId('')
    setSelectedBrandName('')
    setBrandSearchTerm('')
  }

  const handleOwnerSelect = (id: string, name: string) => {
    setOwnerId(id)
    setSelectedOwnerName(name)
    setOwnerSearchTerm('')
    setShowOwnerDropdown(false)
    setOwnerManuallyCleared(false) // Reset flag when manually selecting
  }

  const handleClearOwner = () => {
    setOwnerId('')
    setSelectedOwnerName('')
    setOwnerSearchTerm('')
    setOwnerManuallyCleared(true) // Mark as manually cleared
  }

  const handleAdditionalAgentSelect = (id: string, name: string) => {
    // Don't add if already selected or if it's the owner
    if (additionalAgentIds.includes(id) || id === ownerId) {
      return
    }
    setAdditionalAgentIds([...additionalAgentIds, id])
    setSelectedAdditionalAgents([...selectedAdditionalAgents, { id, name }])
    setAdditionalAgentSearchTerm('')
    setShowAdditionalAgentDropdown(false)
  }

  const handleRemoveAdditionalAgent = (id: string) => {
    setAdditionalAgentIds(additionalAgentIds.filter(agentId => agentId !== id))
    setSelectedAdditionalAgents(selectedAdditionalAgents.filter(agent => agent.id !== id))
  }

  // Helper function to calculate split amount in currency
  const calculateSplitAmount = (totalAmount: string, splitPercent: string): string => {
    const total = parseFloat(totalAmount) || 0
    const percent = parseFloat(splitPercent) || 0
    const splitAmount = total * (splitPercent ? (parseFloat(splitPercent) / 100) : 0)
    return splitAmount.toFixed(2)
  }

  // Helper function to get agent name from ID
  const getAgentName = (agentId: string): string => {
    if (agentId.startsWith('custom_')) {
      return agentId.replace('custom_', '')
    }
    if (agentId === ownerId) {
      return selectedOwnerName
    }
    return selectedAdditionalAgents.find(a => a.id === agentId)?.name || agentId
  }

  // Helper function to remove agent from schedule split with auto-balancing
  const removeAgentFromSchedule = (scheduleId: string, agentId: string) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId && s.agentSplits) {
        const newSplits = { ...s.agentSplits }
        delete newSplits[agentId]

        // Rebalance remaining splits equally
        const remainingCount = Object.keys(newSplits).length
        if (remainingCount > 0) {
          const equalSplit = (100 / remainingCount).toFixed(2)
          Object.keys(newSplits).forEach(id => {
            newSplits[id] = equalSplit
          })
        }

        return { ...s, agentSplits: newSplits }
      }
      return s
    })
    setSchedules(updatedSchedules)
  }

  // Helper function to add agent to schedule split with auto-balancing
  const addAgentToSchedule = (scheduleId: string, agentId: string) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId) {
        const currentSplits = s.agentSplits || {}
        const newAgentCount = Object.keys(currentSplits).length + 1
        const equalSplit = (100 / newAgentCount).toFixed(2)

        // Rebalance all splits equally
        const newSplits: Record<string, string> = {}
        Object.keys(currentSplits).forEach(id => {
          newSplits[id] = equalSplit
        })
        newSplits[agentId] = equalSplit

        return {
          ...s,
          agentSplits: newSplits
        }
      }
      return s
    })
    setSchedules(updatedSchedules)
  }

  // Helper function to add custom split to schedule
  const addCustomSplitToSchedule = (scheduleId: string, customName: string) => {
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId) {
        const currentSplits = s.agentSplits || {}
        const newAgentCount = Object.keys(currentSplits).length + 1
        const equalSplit = (100 / newAgentCount).toFixed(2)

        // Rebalance all splits equally
        const newSplits: Record<string, string> = {}
        Object.keys(currentSplits).forEach(id => {
          newSplits[id] = equalSplit
        })
        newSplits[`custom_${customName}`] = equalSplit

        return {
          ...s,
          agentSplits: newSplits
        }
      }
      return s
    })
    setSchedules(updatedSchedules)
    setCustomSplitName('')
    setShowCustomSplitInput(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(file => {
      if (!validateFileSize(file, 10)) {
        alert(`File "${file.name}" exceeds 10MB limit`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const newFiles = validFiles.map(file => ({
      file,
      description: ''
    }))

    setAttachments([...attachments, ...newFiles])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const handleAttachmentDescriptionChange = (index: number, description: string) => {
    setAttachments(attachments.map((att, i) =>
      i === index ? { ...att, description } : att
    ))
  }

  const addProduct = () => {
    const newProduct: Product = {
      id: `product-${Date.now()}`,
      productName: '',
      productCode: '',
      unitPrice: '',
      quantity: '1',
      totalPrice: '',
      deliverables: '',
      startDate: '',
      endDate: '',
      division: '',
    }
    setProducts([...products, newProduct])
  }

  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id))
    // Also remove associated schedules
    setSchedules(schedules.filter((s) => s.productId !== id))
  }

  const updateProduct = (id: string, field: keyof Product, value: string) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value }
          // Auto-calculate total price
          if (field === 'unitPrice' || field === 'quantity') {
            const unitPrice = parseFloat(field === 'unitPrice' ? value : p.unitPrice) || 0
            const quantity = parseFloat(field === 'quantity' ? value : p.quantity) || 0
            updated.totalPrice = (unitPrice * quantity).toFixed(2)
          }
          return updated
        }
        return p
      })
    )
  }

  const addSchedule = (productId?: string) => {
    // Prepare agent splits if splitOnScheduleBasis is enabled
    let initialAgentSplits: Record<string, string> | undefined = undefined
    if (splitOnScheduleBasis) {
      const allAgentIds = [...additionalAgentIds]
      if (ownerId && !allAgentIds.includes(ownerId)) {
        allAgentIds.push(ownerId)
      }

      if (allAgentIds.length > 0) {
        const equalSplit = (100 / allAgentIds.length).toFixed(2)
        initialAgentSplits = {}
        allAgentIds.forEach(id => {
          initialAgentSplits![id] = equalSplit
        })
      } else {
        initialAgentSplits = {}
      }
    }

    const newSchedule: Schedule = {
      id: `schedule-${Date.now()}`,
      productId,
      description: '',
      scheduleDate: '',
      revenue: '',
      paymentTerms: 'NET_15',
      type: 'Revenue',
      splitPercent: splitPercent || '',
      talentAmount: '',
      commissionAmount: '',
      billable: true,
      agentSplits: initialAgentSplits
    }
    setSchedules([...schedules, newSchedule])
  }

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id))
  }

  const updateSchedule = (id: string, field: keyof Schedule, value: string | boolean) => {
    setSchedules(
      schedules.map((s) => {
        if (s.id === id) {
          const updated = { ...s, [field]: value }

          // Auto-calculate talent and commission amounts when revenue or split % changes
          if (field === 'revenue' || field === 'splitPercent') {
            const revenue = parseFloat(field === 'revenue' ? value as string : s.revenue) || 0
            const split = parseFloat(field === 'splitPercent' ? value as string : s.splitPercent) || 0
            updated.commissionAmount = (revenue * (split / 100)).toFixed(2)
            updated.talentAmount = (revenue * (1 - split / 100)).toFixed(2)
          }

          // Reverse calculate when talent amount changes
          if (field === 'talentAmount') {
            const revenue = parseFloat(s.revenue) || 0
            const talentAmt = parseFloat(value as string) || 0
            const commissionAmt = revenue - talentAmt
            updated.commissionAmount = commissionAmt.toFixed(2)
            if (revenue > 0) {
              updated.splitPercent = ((commissionAmt / revenue) * 100).toFixed(2)
            }
          }

          // Reverse calculate when commission amount changes
          if (field === 'commissionAmount') {
            const revenue = parseFloat(s.revenue) || 0
            const commissionAmt = parseFloat(value as string) || 0
            const talentAmt = revenue - commissionAmt
            updated.talentAmount = talentAmt.toFixed(2)
            if (revenue > 0) {
              updated.splitPercent = ((commissionAmt / revenue) * 100).toFixed(2)
            }
          }

          return updated
        }
        return s
      })
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Combine owner and additional agents for agentIds
      const agentIds = [...additionalAgentIds]
      if (ownerId && !agentIds.includes(ownerId)) {
        agentIds.push(ownerId)
      }

      const dealData = {
        Name: dealName,
        StageName: stage,
        Division__c: division,
        Account_Industry__c: industry,
        Description: description,
        brandId,
        ownerId: ownerId || undefined,
        agentIds: agentIds.length > 0 ? agentIds : undefined,
        Amount: amount ? parseFloat(amount) : undefined,
        Contract_Amount__c: contractAmount ? parseFloat(contractAmount) : undefined,
        splitPercent: splitPercent ? parseFloat(splitPercent) : undefined,
        Contract_Start_Date__c: contractStartDate || undefined,
        Contract_End_Date__c: contractEndDate || undefined,
        CloseDate: closeDate || undefined,
        clmContractNumber: clmContractNumber || undefined,
        products: products.map((p) => ({
          Product_Name__c: p.productName,
          ProductCode: p.productCode,
          UnitPrice: parseFloat(p.unitPrice) || 0,
          Quantity: parseFloat(p.quantity) || 1,
          TotalPrice: parseFloat(p.totalPrice) || 0,
          Project_Deliverables__c: p.deliverables,
          Division__c: p.division,
          schedules: schedules
            .filter((s) => s.productId === p.id)
            .map((s) => ({
              Description: s.description,
              ScheduleDate: s.scheduleDate,
              Revenue: parseFloat(s.revenue) || 0,
              WD_Payment_Term__c: s.paymentTerms,
              Type: s.type,
              Talent_Invoice_Line_Amount__c: parseFloat(s.talentAmount) || 0,
              Wasserman_Invoice_Line_Amount__c: parseFloat(s.commissionAmount) || 0,
              Split_Percent__c: parseFloat(s.splitPercent) || 0,
              Active__c: s.billable || false,
            })),
        })),
        talentClientIds,
      }

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:3001'

      const response = await fetch(`${API_BASE_URL}/api/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      })

      if (!response.ok) {
        throw new Error('Failed to create deal')
      }

      const result = await response.json()
      const dealId = result.data.id

      // Upload attachments if any
      if (attachments.length > 0) {
        const uploadPromises = attachments.map(async (attachment) => {
          try {
            const base64Data = await fileToBase64(attachment.file)
            await fetch(`${API_BASE_URL}/api/attachments`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fileName: attachment.file.name,
                fileType: attachment.file.type,
                fileSize: attachment.file.size,
                base64Data,
                dealId,
                description: attachment.description || undefined,
                uploadedById: user?.id || undefined,
              }),
            })
          } catch (error) {
            console.error(`Failed to upload ${attachment.file.name}:`, error)
          }
        })

        await Promise.allSettled(uploadPromises)
      }

      // Save agent splits for each schedule
      if (result.data.products && result.data.products.length > 0) {
        const splitUpdatePromises = result.data.products
          .flatMap((product: any) => product.schedules || [])
          .map(async (createdSchedule: any) => {
            // Find the original schedule data by matching date and description
            const originalSchedule = schedules.find(s =>
              s.scheduleDate === createdSchedule.ScheduleDate?.split('T')[0] &&
              s.description === createdSchedule.Description
            )

            if (originalSchedule?.agentSplits && Object.keys(originalSchedule.agentSplits).length > 0) {
              const splits = Object.entries(originalSchedule.agentSplits).map(([agentId, splitPct]) => ({
                agentName: getAgentName(agentId),
                agentId: agentId.startsWith('custom_') ? null : agentId,
                splitPercent: parseFloat(splitPct as string),
                splitAmount: parseFloat(calculateSplitAmount(
                  originalSchedule.commissionAmount,
                  splitPct as string
                ))
              }))

              try {
                await fetch(`${API_BASE_URL}/api/schedules/${createdSchedule.id}/splits/batch`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ splits })
                })
              } catch (error) {
                console.error(`Failed to save splits for schedule ${createdSchedule.id}:`, error)
              }
            }
          })

        await Promise.allSettled(splitUpdatePromises)
      }

      // Redirect to the newly created deal
      router.push(`/deals/${dealId}`)
    } catch (error) {
      console.error('Error creating deal:', error)
      alert('Failed to create deal. Please check the console for more details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create New {labels.deal}
              </h1>
              <p className="text-muted-foreground">
                Enter deal information, add products, and schedules
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left Column - Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deal Information */}
        <Card>
          <CardHeader>
            <CardTitle>{labels.deal} Information</CardTitle>
            <CardDescription>
              Basic information about the {labels.deal.toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dealName">
                  {labels.deal} Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dealName"
                  placeholder="Enter deal name"
                  value={dealName}
                  onChange={(e) => setDealName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stage">
                  Stage <span className="text-red-500">*</span>
                </Label>
                <Select value={stage} onValueChange={setStage} required>
                  <SelectTrigger id="stage">
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
                <Label htmlFor="division">Division</Label>
                <Input
                  id="division"
                  placeholder="e.g., Talent, Marketing"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Entertainment, Sports"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter deal description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card>
          <CardHeader>
            <CardTitle>Relationships</CardTitle>
            <CardDescription>
              Connect this {labels.deal.toLowerCase()} to brands, clients, and
              owners
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandId">
                  Brand/Account <span className="text-red-500">*</span>
                </Label>
                <div className="relative" ref={brandDropdownRef}>
                  {selectedBrandName ? (
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
                      <span className="flex-1 text-sm">{selectedBrandName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleClearBrand}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="brandId"
                          placeholder="Search for brand..."
                          value={brandSearchTerm}
                          onChange={(e) => {
                            setBrandSearchTerm(e.target.value)
                            setShowBrandDropdown(true)
                          }}
                          onFocus={() => setShowBrandDropdown(true)}
                          className="pl-8"
                          required
                        />
                      </div>
                      {showBrandDropdown && brands.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                          {brands.map((brand) => (
                            <button
                              key={brand.id}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                              onClick={() => handleBrandSelect(brand.id, brand.name)}
                            >
                              <div className="font-medium">{brand.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {brand.type} • {brand.status}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {showBrandDropdown && brandSearchTerm && brands.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md p-3 text-sm text-muted-foreground">
                          No brands found
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerId">Primary {labels.agent}</Label>
                <div className="relative" ref={ownerDropdownRef}>
                  {selectedOwnerName ? (
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
                      <span className="flex-1 text-sm">{selectedOwnerName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleClearOwner}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="ownerId"
                          placeholder={`Search for ${labels.agent.toLowerCase()}...`}
                          value={ownerSearchTerm}
                          onChange={(e) => {
                            setOwnerSearchTerm(e.target.value)
                            setShowOwnerDropdown(true)
                          }}
                          onFocus={() => setShowOwnerDropdown(true)}
                          className="pl-8"
                        />
                      </div>
                      {showOwnerDropdown && owners.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                          {owners.map((owner) => (
                            <button
                              key={owner.id}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                              onClick={() => handleOwnerSelect(owner.id, owner.name)}
                            >
                              <div className="font-medium">{owner.name}</div>
                              {owner.email && (
                                <div className="text-xs text-muted-foreground">{owner.email}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {showOwnerDropdown && ownerSearchTerm && owners.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md p-3 text-sm text-muted-foreground">
                          No {labels.agents.toLowerCase()} found
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* <p className="text-xs text-muted-foreground">
                  {user?.userType === 'AGENT' ? 'Defaults to you' : 'Filtered by cost center selection'}
                </p> */}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalAgents">Additional {labels.agents}</Label>
              <div className="relative" ref={additionalAgentDropdownRef}>
                <div className="space-y-2">
                  {selectedAdditionalAgents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedAdditionalAgents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center gap-1 px-2 py-1 bg-accent rounded-md text-sm"
                        >
                          <span>{agent.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveAdditionalAgent(agent.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="additionalAgents"
                      placeholder={`Search for ${labels.agents.toLowerCase()}...`}
                      value={additionalAgentSearchTerm}
                      onChange={(e) => {
                        setAdditionalAgentSearchTerm(e.target.value)
                        setShowAdditionalAgentDropdown(true)
                      }}
                      onFocus={() => setShowAdditionalAgentDropdown(true)}
                      className="pl-8"
                    />
                  </div>
                  {showAdditionalAgentDropdown && additionalAgents.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                      {additionalAgents
                        .filter(agent => !additionalAgentIds.includes(agent.id) && agent.id !== ownerId)
                        .map((agent) => (
                          <button
                            key={agent.id}
                            type="button"
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                            onClick={() => handleAdditionalAgentSelect(agent.id, agent.name)}
                          >
                            <div className="font-medium">{agent.name}</div>
                            {agent.email && (
                              <div className="text-xs text-muted-foreground">{agent.email}</div>
                            )}
                          </button>
                        ))}
                    </div>
                  )}
                  {showAdditionalAgentDropdown && additionalAgentSearchTerm && additionalAgents.filter(agent => !additionalAgentIds.includes(agent.id) && agent.id !== ownerId).length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md p-3 text-sm text-muted-foreground">
                      No additional {labels.agents.toLowerCase()} found
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Add collaborating {labels.agents.toLowerCase()} to this {labels.deal.toLowerCase()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
            <CardDescription>
              Deal amounts, percentages, and commission information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amount">{labels.deal} Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={products.length > 0}
                  className={products.length > 0 ? "bg-muted" : ""}
                />
                {products.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from products
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="splitPercent">Split %</Label>
                <Input
                  id="splitPercent"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={splitPercent}
                  onChange={(e) => setSplitPercent(e.target.value)}
                  disabled={splitOnScheduleBasis || schedules.some(s => s.splitPercent && parseFloat(s.splitPercent) > 0)}
                  className={(splitOnScheduleBasis || schedules.some(s => s.splitPercent && parseFloat(s.splitPercent) > 0)) ? "bg-muted" : ""}
                />
                {(splitOnScheduleBasis || schedules.some(s => s.splitPercent && parseFloat(s.splitPercent) > 0)) && (
                  <p className="text-xs text-muted-foreground">
                    Auto-calculated from schedule splits
                  </p>
                )}
              </div>
            </div>

            {/* Agent Split Details */}
            {(ownerId || additionalAgentIds.length > 0) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">{labels.agent} Split Details</Label>
                      <p className="text-sm text-muted-foreground">
                        Manage commission splits between {labels.agents.toLowerCase()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="splitOnScheduleBasis"
                        checked={splitOnScheduleBasis}
                        onChange={(e) => setSplitOnScheduleBasis(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="splitOnScheduleBasis" className="text-sm cursor-pointer">
                        Split on schedule basis
                      </Label>
                    </div>
                  </div>

                  {!splitOnScheduleBasis && (
                    <div className="space-y-3 border rounded-lg p-4">
                      {selectedOwnerName && ownerId && (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{selectedOwnerName}</p>
                            <p className="text-xs text-muted-foreground">Primary {labels.agent}</p>
                            {amount && agentSplits[ownerId] && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ${calculateSplitAmount(
                                  (parseFloat(amount) * (parseFloat(splitPercent) / 100)).toFixed(2),
                                  agentSplits[ownerId]
                                )}
                              </p>
                            )}
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={agentSplits[ownerId] || ''}
                              onChange={(e) => setAgentSplits({
                                ...agentSplits,
                                [ownerId]: e.target.value
                              })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      )}

                      {selectedAdditionalAgents.map((agent) => (
                        <div key={agent.id} className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">Additional {labels.agent}</p>
                            {amount && agentSplits[agent.id] && (
                              <p className="text-xs text-muted-foreground mt-1">
                                ${calculateSplitAmount(
                                  (parseFloat(amount) * (parseFloat(splitPercent) / 100)).toFixed(2),
                                  agentSplits[agent.id]
                                )}
                              </p>
                            )}
                          </div>
                          <div className="w-32">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={agentSplits[agent.id] || ''}
                              onChange={(e) => setAgentSplits({
                                ...agentSplits,
                                [agent.id]: e.target.value
                              })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">%</span>
                        </div>
                      ))}

                      {Object.keys(agentSplits).length > 0 && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Split</span>
                            <span className="text-sm font-bold">
                              {Object.values(agentSplits).reduce((sum, val) =>
                                sum + (parseFloat(val) || 0), 0
                              ).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {splitOnScheduleBasis && (
                    <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                      {labels.agent} splits will be managed at the schedule level. Add schedules below to define splits.
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Milestone Dates</CardTitle>
            <CardDescription>Contract and close dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="contractStartDate">Contract Start Date</Label>
                <Input
                  id="contractStartDate"
                  type="date"
                  value={contractStartDate}
                  onChange={(e) => setContractStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contractEndDate">Contract End Date</Label>
                <Input
                  id="contractEndDate"
                  type="date"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closeDate">Close Date</Label>
                <Input
                  id="closeDate"
                  type="date"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CLM Contract Management */}
        <Card>
          <CardHeader>
            <CardTitle>Contract Management</CardTitle>
            <CardDescription>Contract lifecycle management details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clmContractNumber">CLM Contract Number</Label>
              <Input
                id="clmContractNumber"
                type="text"
                value={clmContractNumber}
                onChange={(e) => setClmContractNumber(e.target.value)}
                placeholder="Enter CLM contract number (optional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>Attachments</CardTitle>
            <CardDescription>
              Upload files related to this {labels.deal.toLowerCase()} (Max 10MB per file)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Modern File Upload Area */}
            <div className="space-y-3">
              <div className="relative">
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Label
                  htmlFor="file-upload"
                  className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 hover:bg-accent/50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Click to upload or drag and drop
                  </span>
                </Label>
              </div>

              {/* File List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 border rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors"
                    >
                      <FileText className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment.file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.file.size)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Add description (optional)"
                          value={attachment.description}
                          onChange={(e) =>
                            handleAttachmentDescriptionChange(index, e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Products</CardTitle>
                <CardDescription>
                  Add multiple products to this {labels.deal.toLowerCase()}
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No products added yet. Click "Add Product" to get started.</p>
              </div>
            ) : (
              products.map((product, index) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Product {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        placeholder="e.g., Talent Marketing"
                        value={product.productName}
                        onChange={(e) =>
                          updateProduct(product.id, 'productName', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Product Code / Cost Center</Label>
                      <Input
                        placeholder="e.g., CC501"
                        value={product.productCode}
                        onChange={(e) =>
                          updateProduct(product.id, 'productCode', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={product.unitPrice}
                        onChange={(e) =>
                          updateProduct(product.id, 'unitPrice', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="1"
                        placeholder="1"
                        value={product.quantity}
                        onChange={(e) =>
                          updateProduct(product.id, 'quantity', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={product.totalPrice}
                        onChange={(e) =>
                          updateProduct(product.id, 'totalPrice', e.target.value)
                        }
                        disabled={schedules.some((s) => s.productId === product.id)}
                        className={schedules.some((s) => s.productId === product.id) ? "bg-muted" : ""}
                      />
                      {schedules.some((s) => s.productId === product.id) && (
                        <p className="text-xs text-muted-foreground">
                          Auto-calculated from schedules
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Division</Label>
                      <Input
                        placeholder="e.g., Talent"
                        value={product.division}
                        onChange={(e) =>
                          updateProduct(product.id, 'division', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={product.startDate}
                        onChange={(e) =>
                          updateProduct(product.id, 'startDate', e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={product.endDate}
                        onChange={(e) =>
                          updateProduct(product.id, 'endDate', e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Deliverables</Label>
                    <Textarea
                      placeholder="Enter project deliverables"
                      rows={2}
                      value={product.deliverables}
                      onChange={(e) =>
                        updateProduct(product.id, 'deliverables', e.target.value)
                      }
                    />
                  </div>

                  <Separator />

                  {/* Schedules for this product */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Schedules for this Product
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addSchedule(product.id)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Schedule
                      </Button>
                    </div>

                    {schedules
                      .filter((s) => s.productId === product.id)
                      .map((schedule, scheduleIndex) => (
                        <div
                          key={schedule.id}
                          className="border rounded p-3 space-y-3 bg-muted/30"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              Schedule {scheduleIndex + 1}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSchedule(schedule.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Description</Label>
                              <Input
                                size={1}
                                placeholder="Schedule description"
                                value={schedule.description}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    'description',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Schedule Date</Label>
                              <Input
                                size={1}
                                type="date"
                                value={schedule.scheduleDate}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    'scheduleDate',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Revenue</Label>
                              <Input
                                size={1}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={schedule.revenue}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    'revenue',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Payment Terms</Label>
                              <Select
                                value={schedule.paymentTerms}
                                onValueChange={(value) =>
                                  updateSchedule(schedule.id, 'paymentTerms', value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="NET_15">Net 15</SelectItem>
                                  <SelectItem value="NET_30">Net 30</SelectItem>
                                  <SelectItem value="NET_45">Net 45</SelectItem>
                                  <SelectItem value="NET_60">Net 60</SelectItem>
                                  <SelectItem value="DUE_ON_RECEIPT">
                                    Due on Receipt
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Type</Label>
                              <Select
                                value={schedule.type}
                                onValueChange={(value) =>
                                  updateSchedule(schedule.id, 'type', value)
                                }
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Revenue">Revenue</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Split %</Label>
                              <Input
                                size={1}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={schedule.splitPercent}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    'splitPercent',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Talent Amount</Label>
                              <Input
                                size={1}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={schedule.talentAmount}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    'talentAmount',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label className="text-xs">Commission Amount</Label>
                              <Input
                                size={1}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={schedule.commissionAmount}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    'commissionAmount',
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`billable-${schedule.id}`}
                                checked={schedule.billable}
                                onChange={(e) =>
                                  updateSchedule(
                                    schedule.id,
                                    'billable',
                                    e.target.checked
                                  )
                                }
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor={`billable-${schedule.id}`} className="text-xs">
                                Billable
                              </Label>
                            </div>
                          </div>

                          {/* Agent Splits for Schedule (if splitOnScheduleBasis is enabled) */}
                          {splitOnScheduleBasis && schedule.agentSplits && (
                            <div className="mt-4 pt-4 border-t bg-muted/30 -mx-3 px-3 pb-3 rounded-b-lg">
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-semibold">
                                  {labels.agent} Split for this Schedule
                                </Label>
                                <Select
                                  onValueChange={(value) => {
                                    if (value === '__custom__') {
                                      setShowCustomSplitInput(schedule.id)
                                    } else {
                                      addAgentToSchedule(schedule.id, value)
                                    }
                                  }}
                                >
                                  <SelectTrigger className="h-8 w-32 text-sm">
                                    <SelectValue placeholder="+ Add" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {selectedOwnerName && ownerId && !schedule.agentSplits[ownerId] && (
                                      <SelectItem value={ownerId}>{selectedOwnerName}</SelectItem>
                                    )}
                                    {selectedAdditionalAgents
                                      .filter(agent => !schedule.agentSplits?.[agent.id])
                                      .map((agent) => (
                                        <SelectItem key={agent.id} value={agent.id}>
                                          {agent.name}
                                        </SelectItem>
                                      ))}
                                    <SelectItem value="__custom__">Custom...</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Custom Split Input */}
                              {showCustomSplitInput === schedule.id && (
                                <div className="flex items-center gap-2 mb-3 p-3 border-2 border-dashed border-primary/30 rounded-lg bg-background">
                                  <Input
                                    placeholder="Enter name..."
                                    value={customSplitName}
                                    onChange={(e) => setCustomSplitName(e.target.value)}
                                    className="h-9 text-sm flex-1"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && customSplitName.trim()) {
                                        addCustomSplitToSchedule(schedule.id, customSplitName.trim())
                                      }
                                    }}
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-9"
                                    onClick={() => {
                                      if (customSplitName.trim()) {
                                        addCustomSplitToSchedule(schedule.id, customSplitName.trim())
                                      }
                                    }}
                                  >
                                    Add
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-9 p-0"
                                    onClick={() => {
                                      setShowCustomSplitInput(null)
                                      setCustomSplitName('')
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}

                              <div className="space-y-2.5">
                                {Object.entries(schedule.agentSplits).map(([agentId, splitPct]) => {
                                  // Handle custom splits
                                  const isCustom = agentId.startsWith('custom_')
                                  const agentName = isCustom
                                    ? agentId.replace('custom_', '')
                                    : (agentId === ownerId ? selectedOwnerName :
                                      selectedAdditionalAgents.find(a => a.id === agentId)?.name)
                                  if (!agentName) return null

                                  return (
                                    <div key={agentId} className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:shadow-sm transition-shadow">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{agentName}</p>
                                        {schedule.commissionAmount && splitPct && (
                                          <p className="text-sm text-muted-foreground mt-0.5">
                                            ${calculateSplitAmount(schedule.commissionAmount, splitPct)}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Input
                                          size={1}
                                          type="number"
                                          step="0.01"
                                          placeholder="0.00"
                                          value={splitPct}
                                          onChange={(e) => {
                                            const newSchedules = schedules.map(s => {
                                              if (s.id === schedule.id) {
                                                return {
                                                  ...s,
                                                  agentSplits: {
                                                    ...s.agentSplits,
                                                    [agentId]: e.target.value
                                                  }
                                                }
                                              }
                                              return s
                                            })
                                            setSchedules(newSchedules)
                                          }}
                                          className="h-9 w-24 text-sm"
                                        />
                                        <span className="text-sm text-muted-foreground w-6">%</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-9 w-9 p-0 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600"
                                          onClick={() => removeAgentFromSchedule(schedule.id, agentId)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  )
                                })}

                                {Object.keys(schedule.agentSplits).length > 0 && (
                                  <div className="pt-3 border-t mt-3">
                                    <div className="flex items-center justify-between px-3 py-2 bg-background rounded-lg">
                                      <span className="text-sm font-semibold">Total</span>
                                      <span className={`text-base font-bold ${
                                        Math.abs(Object.values(schedule.agentSplits).reduce((sum, val) =>
                                          sum + (parseFloat(val) || 0), 0
                                        ) - 100) > 0.01 ? 'text-red-600' : 'text-green-600'
                                      }`}>
                                        {Object.values(schedule.agentSplits).reduce((sum, val) =>
                                          sum + (parseFloat(val) || 0), 0
                                        ).toFixed(2)}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                    {schedules.filter((s) => s.productId === product.id)
                      .length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No schedules added for this product
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

            {/* Submit Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create {labels.deal}
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Right Column - Sticky Summary */}
          <div className="hidden lg:block">
            <DealCreationSummary
              dealName={dealName}
              stage={stage}
              amount={amount}
              contractAmount={contractAmount}
              splitPercent={splitPercent}
              selectedBrandName={selectedBrandName}
              selectedOwnerName={selectedOwnerName}
              selectedAdditionalAgents={selectedAdditionalAgents}
              products={products}
              schedules={schedules}
              attachments={attachments}
              contractStartDate={contractStartDate}
              contractEndDate={contractEndDate}
              closeDate={closeDate}
              agentSplits={agentSplits}
              splitOnScheduleBasis={splitOnScheduleBasis}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
