'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Label } from '../ui/label'
import { Settings2 } from 'lucide-react'

export interface FieldDefinition {
  id: string
  label: string
  category: 'basic' | 'contact' | 'metrics' | 'dates' | 'relationships'
}

export const FIELD_DEFINITIONS: Record<string, FieldDefinition[]> = {
  talents: [
    { id: 'Name', label: 'Name', category: 'basic' },
    { id: 'category', label: 'Category', category: 'basic' },
    { id: 'sport', label: 'Sport', category: 'basic' },
    { id: 'status', label: 'Status', category: 'basic' },
    { id: 'Agent_Cost_Center__c', label: 'Cost Center', category: 'basic' },
    { id: 'email', label: 'Email', category: 'contact' },
    { id: 'phone', label: 'Phone', category: 'contact' },
    { id: 'agents', label: 'Agent(s)', category: 'relationships' },
    { id: 'deals_count', label: 'Deal Count', category: 'metrics' },
    { id: 'totalRevenue', label: 'Total Revenue', category: 'metrics' },
    { id: 'createdAt', label: 'Created Date', category: 'dates' },
    { id: 'lastDealDate', label: 'Last Deal Date', category: 'dates' },
  ],
  brands: [
    { id: 'name', label: 'Name', category: 'basic' },
    { id: 'type', label: 'Type', category: 'basic' },
    { id: 'industry', label: 'Industry', category: 'basic' },
    { id: 'status', label: 'Status', category: 'basic' },
    { id: 'legalName', label: 'Legal Name', category: 'basic' },
    { id: 'website', label: 'Website', category: 'contact' },
    { id: 'owner', label: 'Owner', category: 'relationships' },
    { id: 'deals_count', label: 'Deal Count', category: 'metrics' },
    { id: 'totalContracted', label: 'Total Revenue', category: 'metrics' },
    { id: 'projectedRevenue', label: 'Projected Revenue', category: 'metrics' },
    { id: 'createdAt', label: 'Created Date', category: 'dates' },
    { id: 'updatedAt', label: 'Updated Date', category: 'dates' },
  ],
  agents: [
    { id: 'name', label: 'Name', category: 'basic' },
    { id: 'title', label: 'Title', category: 'basic' },
    { id: 'company', label: 'Company', category: 'basic' },
    { id: 'division', label: 'Division', category: 'basic' },
    { id: 'costCenter', label: 'Cost Center', category: 'basic' },
    { id: 'status', label: 'Status', category: 'basic' },
    { id: 'email', label: 'Email', category: 'contact' },
    { id: 'phone', label: 'Phone', category: 'contact' },
    { id: 'clients_count', label: 'Client Count', category: 'metrics' },
    { id: 'createdAt', label: 'Created Date', category: 'dates' },
  ],
  deals: [
    { id: 'Name', label: 'Name', category: 'basic' },
    { id: 'StageName', label: 'Stage', category: 'basic' },
    { id: 'Status__c', label: 'Status', category: 'basic' },
    { id: 'brand', label: 'Brand', category: 'relationships' },
    { id: 'owner', label: 'Owner', category: 'relationships' },
    { id: 'clients', label: 'Clients', category: 'relationships' },
    { id: 'Amount', label: 'Amount', category: 'metrics' },
    { id: 'Contract_Amount__c', label: 'Contract Amount', category: 'metrics' },
    { id: 'CloseDate', label: 'Close Date', category: 'dates' },
    { id: 'Contract_Start_Date__c', label: 'Contract Start Date', category: 'dates' },
    { id: 'Contract_End_Date__c', label: 'Contract End Date', category: 'dates' },
    { id: 'createdAt', label: 'Created Date', category: 'dates' },
  ],
}

export const DEFAULT_VISIBLE_FIELDS: Record<string, string[]> = {
  talents: ['Name', 'category', 'sport', 'status', 'agents', 'deals_count', 'totalRevenue'],
  brands: ['name', 'type', 'industry', 'status', 'owner', 'deals_count', 'totalContracted'],
  agents: ['name', 'title', 'email', 'company', 'division', 'clients_count'],
  deals: ['Name', 'brand', 'StageName', 'Status__c', 'owner', 'Amount', 'CloseDate'],
}

interface FieldSelectorDialogProps {
  open: boolean
  onClose: () => void
  baseEntity: 'talents' | 'brands' | 'agents' | 'deals'
  visibleFields: string[]
  onApply: (fields: string[]) => void
}

export function FieldSelectorDialog({
  open,
  onClose,
  baseEntity,
  visibleFields,
  onApply,
}: FieldSelectorDialogProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(visibleFields)

  const availableFields = FIELD_DEFINITIONS[baseEntity] || []
  const categories = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'relationships', label: 'Relationships' },
    { id: 'metrics', label: 'Metrics' },
    { id: 'dates', label: 'Dates' },
  ]

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    )
  }

  const selectAll = () => {
    setSelectedFields(availableFields.map((f) => f.id))
  }

  const deselectAll = () => {
    setSelectedFields([])
  }

  const resetToDefault = () => {
    setSelectedFields(DEFAULT_VISIBLE_FIELDS[baseEntity] || [])
  }

  const handleApply = () => {
    // Ensure at least one field is selected
    if (selectedFields.length === 0) {
      return
    }
    onApply(selectedFields)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Customize Columns
          </DialogTitle>
          <DialogDescription>
            Select which fields to display in the query results table
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
            <Button variant="outline" size="sm" onClick={resetToDefault}>
              Reset to Default
            </Button>
            <div className="flex-1"></div>
            <div className="text-xs text-muted-foreground">
              {selectedFields.length} of {availableFields.length} selected
            </div>
          </div>

          {/* Field Categories */}
          <div className="max-h-[50vh] overflow-y-auto space-y-4 pr-2">
            {categories.map((category) => {
              const categoryFields = availableFields.filter(
                (f) => f.category === category.id
              )
              if (categoryFields.length === 0) return null

              return (
                <div key={category.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {category.label}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pl-2">
                    {categoryFields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={field.id}
                          checked={selectedFields.includes(field.id)}
                          onCheckedChange={() => toggleField(field.id)}
                        />
                        <Label
                          htmlFor={field.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Apply/Cancel Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={selectedFields.length === 0}
            >
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
