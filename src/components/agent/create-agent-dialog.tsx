'use client'

import { useState, useEffect } from 'react'
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
import { useCreateAgent } from '../../hooks/useAgents'
import { useUser } from '../../contexts/user-context'
import { useLabels } from '../../hooks/useLabels'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface AgentFormData {
  name: string
  email: string
  title: string
  company: string
  division: string
  costCenter: string
  status: 'ACTIVE' | 'INACTIVE'
}

interface ContactFormData {
  phone: string
  website: string
  address: string
}

const INITIAL_FORM_DATA: AgentFormData = {
  name: '',
  email: '',
  title: '',
  company: '',
  division: '',
  costCenter: '',
  status: 'ACTIVE'
}

const INITIAL_CONTACT_DATA: ContactFormData = {
  phone: '',
  website: '',
  address: ''
}

export function CreateAgentDialog({
  open,
  onOpenChange,
  onSuccess
}: CreateAgentDialogProps) {
  const { user } = useUser()
  const { labels } = useLabels()
  const [formData, setFormData] = useState<AgentFormData>(INITIAL_FORM_DATA)
  const [contactData, setContactData] = useState<ContactFormData>(INITIAL_CONTACT_DATA)
  const [errors, setErrors] = useState<Partial<Record<keyof AgentFormData, string>>>({})

  const createAgentMutation = useCreateAgent()

  // Check if user is restricted to a cost center (non-admin with cost center)
  const isRestrictedToCostCenter = user?.userType !== 'ADMINISTRATOR' && !!user?.costCenter
  const userCostCenter = user?.costCenter || ''

  // Auto-populate cost center when dialog opens if user is restricted
  useEffect(() => {
    if (open && isRestrictedToCostCenter && userCostCenter) {
      setFormData(prev => ({
        ...prev,
        costCenter: userCostCenter
      }))
    }
  }, [open, isRestrictedToCostCenter, userCostCenter])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AgentFormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = `${labels.agent} name is required`
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required'
    }

    if (!formData.division.trim()) {
      newErrors.division = 'Division is required'
    }

    if (!formData.costCenter.trim()) {
      newErrors.costCenter = 'Cost center is required'
    }

    if (!formData.status) {
      newErrors.status = 'Status is required'
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
      const agentData: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        title: formData.title.trim(),
        company: formData.company.trim(),
        division: formData.division.trim(),
        costCenter: formData.costCenter.trim(),
        status: formData.status
      }

      await createAgentMutation.mutateAsync(agentData)

      // Create contact if any contact field is populated
      // Note: Contact schema may not support agentId - this will need verification
      // For now, we'll skip contact creation for agents
      // TODO: Verify Contact schema supports agent relationships

      toast.success(`${labels.agent} created successfully`)
      setFormData(INITIAL_FORM_DATA)
      setContactData(INITIAL_CONTACT_DATA)
      setErrors({})
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('Error creating agent:', error)
      if (error?.response?.data?.error?.includes('unique constraint')) {
        toast.error(`An ${labels.agent.toLowerCase()} with this email already exists`)
      } else {
        toast.error(`Failed to create ${labels.agent.toLowerCase()}`)
      }
    }
  }

  const handleCancel = () => {
    setFormData(INITIAL_FORM_DATA)
    setContactData(INITIAL_CONTACT_DATA)
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New {labels.agent}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Required Fields Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={`Enter ${labels.agent.toLowerCase()} name`}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Agent, Manager"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-xs text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as AgentFormData['status'] })}
                >
                  <SelectTrigger id="status" className={errors.status ? 'border-red-500 w-full' : 'w-full'}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g., Wasserman"
                  className={errors.company ? 'border-red-500' : ''}
                />
                {errors.company && (
                  <p className="text-xs text-red-500">{errors.company}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="division" className="text-sm font-medium">
                  Division <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="division"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  placeholder="e.g., Talent"
                  className={errors.division ? 'border-red-500' : ''}
                />
                {errors.division && (
                  <p className="text-xs text-red-500">{errors.division}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costCenter" className="text-sm font-medium">
                Cost Center <span className="text-red-500">*</span>
              </Label>
              <Input
                id="costCenter"
                value={formData.costCenter}
                onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                placeholder="e.g., CC501"
                className={errors.costCenter ? 'border-red-500' : ''}
                disabled={isRestrictedToCostCenter}
              />
              {/* {isRestrictedToCostCenter && (
                <p className="text-xs text-muted-foreground">Cost center is set based on your account permissions</p>
              )} */}
              {errors.costCenter && (
                <p className="text-xs text-red-500">{errors.costCenter}</p>
              )}
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
                      placeholder="https://example.com"
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
              disabled={createAgentMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createAgentMutation.isPending}>
              {createAgentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create {labels.agent}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
