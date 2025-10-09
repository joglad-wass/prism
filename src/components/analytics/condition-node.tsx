'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { X, Loader2, Copy } from 'lucide-react'
import { SearchService } from '../../services/search'
import { useFilter } from '../../contexts/filter-context'
import type { Condition } from './visual-query-builder'

interface ConditionNodeProps {
  condition: Condition
  baseEntity: 'talents' | 'brands' | 'agents' | 'deals'
  onUpdate: (updates: Partial<Condition>) => void
  onRemove: () => void
  onDuplicate: () => void
}

export function ConditionNode({ condition, baseEntity, onUpdate, onRemove, onDuplicate }: ConditionNodeProps) {
  const { filterSelection } = useFilter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showAutocomplete, setShowAutocomplete] = useState(false)

  const filterParams = {
    ...(filterSelection.type === 'individual' && { costCenter: filterSelection.value || undefined }),
    ...(filterSelection.type === 'group' && { costCenterGroup: filterSelection.value || undefined })
  }

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ['search-suggestions', searchTerm, filterParams],
    queryFn: async () => {
      const results = await SearchService.getSuggestions(searchTerm, filterParams)
      return results
    },
    enabled: searchTerm.length >= 2 && showAutocomplete && condition.type === 'relationship'
  })

  const selectSuggestion = (suggestion: any) => {
    onUpdate({
      entityValue: suggestion.title,
      entityId: suggestion.id
    })
    setShowAutocomplete(false)
    setSearchTerm('')
  }

  const getConditionLabel = () => {
    if (condition.type === 'relationship') {
      const operatorText = condition.operator === 'has' ? 'that have' : 'that do NOT have'
      const relationText = condition.relation === 'deals' ? 'deals with' :
                          condition.relation === 'agents' ? 'representation by' :
                          condition.relation === 'clients' ? 'clients' :
                          condition.relation === 'ownedBrands' ? 'ownership of brand' :
                          condition.relation === 'owner' ? 'owner' : ''

      // Handle special entity types
      if (condition.entityType === 'any') {
        return condition.relation === 'agents' ? 'represented by ANY agent' :
               condition.relation === 'deals' ? 'does NOT have any deals' : 'that have any'
      }
      if (condition.entityType === 'multiple') {
        return 'represented by multiple agents'
      }
      if (condition.entityType === 'active') {
        return 'has active deals'
      }

      const entityTypeText = condition.entityType === 'brand' ? 'Brand' :
                            condition.entityType === 'talent' ? 'Client' :
                            condition.entityType === 'agent' ? 'Agent' : ''

      return `${operatorText} ${relationText} ${entityTypeText}`
    } else {
      const operatorText = condition.fieldOperator === 'equals' ? 'equals' :
                          condition.fieldOperator === 'not_equals' ? 'not equals' :
                          condition.fieldOperator === 'contains' ? 'contains' :
                          condition.fieldOperator === 'greater_than' ? 'greater than' :
                          condition.fieldOperator === 'less_than' ? 'less than' : ''

      return `where ${condition.field} ${operatorText}`
    }
  }

  const getSearchPlaceholder = () => {
    if (condition.type === 'relationship') {
      return condition.entityType === 'brand' ? 'Search brands...' :
             condition.entityType === 'talent' ? 'Search clients...' :
             condition.entityType === 'agent' ? 'Search agents...' : 'Search...'
    } else {
      return 'Enter value...'
    }
  }

  const filteredSuggestions = () => {
    if (!suggestions || condition.type !== 'relationship') return []

    const entityTypeSingular = condition.entityType === 'brand' ? 'brand' :
                               condition.entityType === 'talent' ? 'talent' :
                               condition.entityType === 'agent' ? 'agent' : ''

    return suggestions.filter(s => s.type === entityTypeSingular)
  }

  return (
    <Card className={condition.type === 'relationship' ? 'border-blue-200 dark:border-blue-800' : 'border-green-200 dark:border-green-800'}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 space-y-2">
            {/* Condition Label */}
            <div className="text-xs font-medium text-muted-foreground">
              {getConditionLabel()}
            </div>

            {/* Value Input */}
            {/* Only show input for non-special entity types */}
            {condition.type === 'relationship' &&
             !['any', 'multiple', 'active'].includes(condition.entityType || '') && (
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder={getSearchPlaceholder()}
                  value={showAutocomplete ? searchTerm : (condition.entityValue || '')}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setShowAutocomplete(true)
                  }}
                  onFocus={() => {
                    setSearchTerm(condition.entityValue || '')
                    setShowAutocomplete(true)
                  }}
                />

                {/* Autocomplete Dropdown */}
                {showAutocomplete && searchTerm.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestionsLoading ? (
                      <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading suggestions...
                      </div>
                    ) : filteredSuggestions().length > 0 ? (
                      filteredSuggestions().map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                          onClick={() => selectSuggestion(suggestion)}
                        >
                          <div className="font-medium">{suggestion.title}</div>
                          {suggestion.subtitle && (
                            <div className="text-xs text-muted-foreground">{suggestion.subtitle}</div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground">
                        No {condition.entityType}s found matching "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Field conditions always show input */}
            {condition.type === 'field' && (
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder={getSearchPlaceholder()}
                  value={condition.value as string || ''}
                  onChange={(e) => onUpdate({ value: e.target.value })}
                />
              </div>
            )}

            {/* Display selected value for relationship conditions */}
            {condition.type === 'relationship' &&
             condition.entityValue &&
             !showAutocomplete &&
             !['any', 'multiple', 'active'].includes(condition.entityType || '') && (
              <div className="text-sm">
                <span className="text-muted-foreground">Selected: </span>
                <span className="font-medium text-primary">{condition.entityValue}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onDuplicate}
              className="h-7 w-7"
              title="Duplicate condition"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-7 w-7"
              title="Remove condition"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
