'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion'
import { useCreateBrand } from '../../hooks/useBrands'
import { useAgentSearch } from '../../hooks/useAgents'
import { useFilter } from '../../contexts/filter-context'
import { ContactService } from '../../services/contacts'
import { Loader2, Search, X } from 'lucide-react'
import { toast } from 'sonner'

interface CreateBrandDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface BrandFormData {
  name: string
  altName: string
  legalName: string
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT'
  type: 'BRAND' | 'AGENCY'
  industry: string
  currency: string
  ownerId: string
}

interface ContactFormData {
  email: string
  phone: string
  website: string
  address: string
}

const INITIAL_FORM_DATA: BrandFormData = {
  name: '',
  altName: '',
  legalName: '',
  status: 'ACTIVE',
  type: 'BRAND',
  industry: '',
  currency: 'USD',
  ownerId: ''
}

const INITIAL_CONTACT_DATA: ContactFormData = {
  email: '',
  phone: '',
  website: '',
  address: ''
}

export function CreateBrandDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateBrandDialogProps) {
  const [formData, setFormData] = useState<BrandFormData>(INITIAL_FORM_DATA)
  const [contactData, setContactData] = useState<ContactFormData>(INITIAL_CONTACT_DATA)
  const [errors, setErrors] = useState<Partial<Record<keyof BrandFormData, string>>>({})
  const [agentSearchTerm, setAgentSearchTerm] = useState('')
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [selectedAgentName, setSelectedAgentName] = useState('')
  const agentDropdownRef = useRef<HTMLDivElement>(null)

  const createBrandMutation = useCreateBrand()
  const { filterSelection } = useFilter()

  // Get cost center filters
  const costCenter = filterSelection.type === 'individual' ? filterSelection.value || undefined : undefined
  const costCenterGroup = filterSelection.type === 'group' ? filterSelection.value || undefined : undefined

  // Agent search with cost center filtering
  const { data: agentSearchResults } = useAgentSearch(
    agentSearchTerm,
    costCenter,
    costCenterGroup,
    20 // Show up to 20 results
  )

  const agents = agentSearchResults?.data || []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setShowAgentDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BrandFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
    }

    if (!formData.type) {
      newErrors.type = 'Type is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors')
      return
    }

    try {
      // Only include non-empty fields
      const brandData: any = {
        name: formData.name.trim(),
        status: formData.status,
        type: formData.type,
        currency: formData.currency
      }

      if (formData.altName.trim()) brandData.altName = formData.altName.trim()
      if (formData.legalName.trim()) brandData.legalName = formData.legalName.trim()
      if (formData.industry.trim()) brandData.industry = formData.industry.trim()
      if (formData.ownerId) brandData.ownerId = formData.ownerId

      const newBrand = await createBrandMutation.mutateAsync(brandData)

      // Create contact if any contact field is populated
      const hasContactData = Object.values(contactData).some(value => value.trim() !== '')
      if (hasContactData) {
        const contactPayload: any = { brandId: newBrand.id }
        if (contactData.email.trim()) contactPayload.email = contactData.email.trim()
        if (contactData.phone.trim()) contactPayload.phone = contactData.phone.trim()
        if (contactData.website.trim()) contactPayload.website = contactData.website.trim()
        if (contactData.address.trim()) contactPayload.address = contactData.address.trim()

        await ContactService.createContact(contactPayload)
      }

      toast.success('Brand created successfully')
      setFormData(INITIAL_FORM_DATA)
      setContactData(INITIAL_CONTACT_DATA)
      setErrors({})
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error creating brand:', error)
      toast.error('Failed to create brand')
    }
  }

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA)
    setContactData(INITIAL_CONTACT_DATA)
    setErrors({})
    setAgentSearchTerm('')
    setSelectedAgentName('')
    setShowAgentDropdown(false)
    onOpenChange(false)
  }

  const handleAgentSelect = (agentId: string, agentName: string) => {
    setFormData({ ...formData, ownerId: agentId })
    setSelectedAgentName(agentName)
    setAgentSearchTerm('')
    setShowAgentDropdown(false)
  }

  const handleClearAgent = () => {
    setFormData({ ...formData, ownerId: '' })
    setSelectedAgentName('')
    setAgentSearchTerm('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Fields Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Brand Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter brand name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as BrandFormData['status'] })}
                >
                  <SelectTrigger id="status" className={errors.status ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="PROSPECT">Prospect</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as BrandFormData['type'] })}
                >
                  <SelectTrigger id="type" className={errors.type ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRAND">Brand</SelectItem>
                    <SelectItem value="AGENCY">Agency</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-red-500">{errors.type}</p>
                )}
              </div>
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground">Additional Information (Optional)</h4>

            <div className="space-y-2">
              <Label htmlFor="altName" className="text-sm">Alternative Name</Label>
              <Input
                id="altName"
                value={formData.altName}
                onChange={(e) => setFormData({ ...formData, altName: e.target.value })}
                placeholder="Enter alternative name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="legalName" className="text-sm">Legal Name</Label>
              <Input
                id="legalName"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                placeholder="Enter legal name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology, Fashion, Sports"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="USD"
                  maxLength={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner" className="text-sm">Owner</Label>
                <div className="relative" ref={agentDropdownRef}>
                  {selectedAgentName ? (
                    <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-background">
                      <span className="flex-1 text-sm">{selectedAgentName}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={handleClearAgent}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="owner"
                          placeholder="Search for owner..."
                          value={agentSearchTerm}
                          onChange={(e) => {
                            setAgentSearchTerm(e.target.value)
                            setShowAgentDropdown(true)
                          }}
                          onFocus={() => setShowAgentDropdown(true)}
                          className="pl-8"
                        />
                      </div>
                      {showAgentDropdown && agents.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
                          {agents.map((agent) => (
                            <button
                              key={agent.id}
                              type="button"
                              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                              onClick={() => handleAgentSelect(agent.id, agent.name)}
                            >
                              <div className="font-medium">{agent.name}</div>
                              {agent.email && (
                                <div className="text-xs text-muted-foreground">{agent.email}</div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {showAgentDropdown && agentSearchTerm && agents.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md p-3 text-sm text-muted-foreground">
                          No agents found
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* <p className="text-xs text-muted-foreground">
                  {filterSelection.type === 'individual' && costCenter ? (
                    `Showing agents from ${costCenter}`
                  ) : filterSelection.type === 'group' && costCenterGroup ? (
                    `Showing agents from selected group`
                  ) : (
                    'Filtered by site-wide cost center selection'
                  )}
                </p> */}
              </div>
            </div>
          </div>

          {/* Contact Information Section - Expandable */}
          <Accordion type="single" collapsible className="border-t pt-4">
            <AccordionItem value="contact" className="border-none">
              <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Contact Information (Optional)
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      placeholder="contact@brand.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactData.phone}
                      onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={contactData.website}
                      onChange={(e) => setContactData({ ...contactData, website: e.target.value })}
                      placeholder="https://brand.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm">Address</Label>
                    <Input
                      id="address"
                      value={contactData.address}
                      onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={createBrandMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBrandMutation.isPending}>
              {createBrandMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
