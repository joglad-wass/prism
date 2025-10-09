'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Link2, Filter } from 'lucide-react'
import type { Condition } from './visual-query-builder'

interface AddConditionDialogProps {
  baseEntity: 'talents' | 'brands' | 'agents' | 'deals'
  onAdd: (condition: Condition) => void
  onClose: () => void
}

export function AddConditionDialog({ baseEntity, onAdd, onClose }: AddConditionDialogProps) {
  const [selectedType, setSelectedType] = useState<'relationship' | 'field' | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const relationshipTemplates = getRelationshipTemplates(baseEntity)
  const fieldTemplates = getFieldTemplates(baseEntity)

  const handleSelectTemplate = (template: any) => {
    const condition: Condition = {
      id: Math.random().toString(),
      type: template.type,
      ...template.data
    }
    onAdd(condition)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Condition</DialogTitle>
          <DialogDescription>
            Choose a condition type to add to your query
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Condition Type Selection */}
          {!selectedType && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card
                className="p-6 cursor-pointer hover:bg-accent transition-colors border-2 hover:border-primary"
                onClick={() => setSelectedType('relationship')}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <Link2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Relationship Condition</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Filter by connections to other entities
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:bg-accent transition-colors border-2 hover:border-primary"
                onClick={() => setSelectedType('field')}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <Filter className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Field Condition</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Filter by specific field values
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Relationship Templates */}
          {selectedType === 'relationship' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Relationship Conditions</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
                  Back
                </Button>
              </div>
              <div className="grid gap-2">
                {relationshipTemplates.map((template, idx) => (
                  <Card
                    key={idx}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="font-medium text-sm">{template.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Field Templates */}
          {selectedType === 'field' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Field Conditions</h3>
                <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>
                  Back
                </Button>
              </div>
              <div className="grid gap-2">
                {fieldTemplates.map((template, idx) => (
                  <Card
                    key={idx}
                    className="p-4 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="font-medium text-sm">{template.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Get relationship condition templates based on base entity
function getRelationshipTemplates(baseEntity: string) {
  switch (baseEntity) {
    case 'talents':
      return [
        {
          label: 'Has deals with Brand',
          description: 'Find clients who have worked with a specific brand',
          type: 'relationship',
          data: {
            relation: 'deals',
            operator: 'has',
            entityType: 'brand',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'Does NOT have deals with Brand',
          description: 'Find clients who have never worked with a specific brand',
          type: 'relationship',
          data: {
            relation: 'deals',
            operator: 'not_has',
            entityType: 'brand',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'Represented by Agent',
          description: 'Find clients represented by a specific agent',
          type: 'relationship',
          data: {
            relation: 'agents',
            operator: 'has',
            entityType: 'agent',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'NOT represented by Agent',
          description: 'Find clients not represented by a specific agent',
          type: 'relationship',
          data: {
            relation: 'agents',
            operator: 'not_has',
            entityType: 'agent',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'Represented by ANY agent',
          description: 'Find clients who have at least one agent',
          type: 'relationship',
          data: {
            relation: 'agents',
            operator: 'has',
            entityType: 'any',
            entityValue: 'any',
            entityId: 'any'
          }
        },
        {
          label: 'Represented by multiple agents',
          description: 'Find clients with more than one agent',
          type: 'relationship',
          data: {
            relation: 'agents',
            operator: 'has',
            entityType: 'multiple',
            entityValue: 'multiple',
            entityId: 'multiple'
          }
        },
        {
          label: 'Has active deals',
          description: 'Find clients with at least one active deal',
          type: 'relationship',
          data: {
            relation: 'deals',
            operator: 'has',
            entityType: 'active',
            entityValue: 'active',
            entityId: 'active'
          }
        }
      ]

    case 'brands':
      return [
        {
          label: 'Has deals with Client',
          description: 'Find brands who have worked with a specific client',
          type: 'relationship',
          data: {
            relation: 'deals',
            operator: 'has',
            entityType: 'talent',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'Does NOT have deals with Client',
          description: 'Find brands who have never worked with a specific client',
          type: 'relationship',
          data: {
            relation: 'deals',
            operator: 'not_has',
            entityType: 'talent',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'Does NOT have any deals',
          description: 'Find brands with no deals at all',
          type: 'relationship',
          data: {
            relation: 'deals',
            operator: 'not_has',
            entityType: 'any',
            entityValue: 'any',
            entityId: 'any'
          }
        },
        {
          label: 'Has active deals',
          description: 'Find brands with at least one active deal',
          type: 'relationship',
          data: {
            relation: 'deals',
            operator: 'has',
            entityType: 'active',
            entityValue: 'active',
            entityId: 'active'
          }
        },
        {
          label: 'Owned by specific Agent',
          description: 'Find brands owned by a specific agent',
          type: 'relationship',
          data: {
            relation: 'owner',
            operator: 'has',
            entityType: 'agent',
            entityValue: '',
            entityId: ''
          }
        }
      ]

    case 'agents':
      return [
        {
          label: 'Represents Client',
          description: 'Find agents representing a specific client',
          type: 'relationship',
          data: {
            relation: 'clients',
            operator: 'has',
            entityType: 'talent',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'Does NOT represent Client',
          description: 'Find agents who do not represent a specific client',
          type: 'relationship',
          data: {
            relation: 'clients',
            operator: 'not_has',
            entityType: 'talent',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'Is owner of Brand',
          description: 'Find agents who own a specific brand',
          type: 'relationship',
          data: {
            relation: 'ownedBrands',
            operator: 'has',
            entityType: 'brand',
            entityValue: '',
            entityId: ''
          }
        }
      ]

    case 'deals':
      return [
        {
          label: 'With Brand',
          description: 'Find deals with a specific brand',
          type: 'relationship',
          data: {
            relation: 'brand',
            operator: 'has',
            entityType: 'brand',
            entityValue: '',
            entityId: ''
          }
        },
        {
          label: 'With Client',
          description: 'Find deals involving a specific client',
          type: 'relationship',
          data: {
            relation: 'clients',
            operator: 'has',
            entityType: 'talent',
            entityValue: '',
            entityId: ''
          }
        }
      ]

    default:
      return []
  }
}

// Get field condition templates based on base entity
function getFieldTemplates(baseEntity: string) {
  switch (baseEntity) {
    case 'talents':
      return [
        {
          label: 'Category equals',
          description: 'Filter by talent category (e.g., Athletes, Musicians)',
          type: 'field',
          data: {
            field: 'category',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Status equals',
          description: 'Filter by client status',
          type: 'field',
          data: {
            field: 'status',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Sport equals',
          description: 'Filter by sport (for athletes)',
          type: 'field',
          data: {
            field: 'sport',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Cost Center equals',
          description: 'Filter by agent cost center',
          type: 'field',
          data: {
            field: 'Agent_Cost_Center__c',
            fieldOperator: 'equals',
            value: ''
          }
        }
      ]

    case 'brands':
      return [
        {
          label: 'Industry equals',
          description: 'Filter by brand industry',
          type: 'field',
          data: {
            field: 'industry',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Type equals',
          description: 'Filter by brand type (Brand or Agency)',
          type: 'field',
          data: {
            field: 'type',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Status equals',
          description: 'Filter by brand status',
          type: 'field',
          data: {
            field: 'status',
            fieldOperator: 'equals',
            value: ''
          }
        }
      ]

    case 'agents':
      return [
        {
          label: 'Division equals',
          description: 'Filter by agent division',
          type: 'field',
          data: {
            field: 'division',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Company contains',
          description: 'Filter by company name',
          type: 'field',
          data: {
            field: 'company',
            fieldOperator: 'contains',
            value: ''
          }
        },
        {
          label: 'Cost Center equals',
          description: 'Filter by agent cost center',
          type: 'field',
          data: {
            field: 'costCenter',
            fieldOperator: 'equals',
            value: ''
          }
        }
      ]

    case 'deals':
      return [
        {
          label: 'Stage equals',
          description: 'Filter by deal stage',
          type: 'field',
          data: {
            field: 'StageName',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Status equals',
          description: 'Filter by deal status',
          type: 'field',
          data: {
            field: 'Status__c',
            fieldOperator: 'equals',
            value: ''
          }
        },
        {
          label: 'Amount greater than',
          description: 'Filter by minimum deal amount',
          type: 'field',
          data: {
            field: 'Amount',
            fieldOperator: 'greater_than',
            value: ''
          }
        }
      ]

    default:
      return []
  }
}
