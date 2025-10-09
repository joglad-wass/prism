'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Search, Plus, Loader2, Users, Building2, UserCircle, Briefcase, Download, ArrowUpDown, ArrowUp, ArrowDown, Save, FolderOpen, Trash2, Settings2 } from 'lucide-react'
import { useFilter } from '../../contexts/filter-context'
import { ConditionNode } from './condition-node'
import { AddConditionDialog } from './add-condition-dialog'
import { FieldSelectorDialog, DEFAULT_VISIBLE_FIELDS, FIELD_DEFINITIONS } from './field-selector-dialog'
import { ExportOptionsDialog, ExportType } from './export-options-dialog'
import { exportToCSV, flattenForExport } from '../../utils/export'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export interface Condition {
  id: string
  type: 'relationship' | 'field'

  // For relationship conditions
  relation?: string
  operator?: 'has' | 'not_has'
  entityType?: 'brand' | 'talent' | 'agent'
  entityValue?: string
  entityId?: string

  // For field conditions
  field?: string
  fieldOperator?: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than'
  value?: string | number | boolean
}

export function VisualQueryBuilder() {
  const router = useRouter()
  const { filterSelection } = useFilter()
  const [baseEntity, setBaseEntity] = useState<'talents' | 'brands' | 'agents' | 'deals'>('talents')
  const [conditions, setConditions] = useState<Condition[]>([])
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND')
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showLoadDialog, setShowLoadDialog] = useState(false)
  const [showFieldSelector, setShowFieldSelector] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [queryName, setQueryName] = useState('')
  const [visibleFields, setVisibleFields] = useState<Record<string, string[]>>({
    talents: DEFAULT_VISIBLE_FIELDS.talents,
    brands: DEFAULT_VISIBLE_FIELDS.brands,
    agents: DEFAULT_VISIBLE_FIELDS.agents,
    deals: DEFAULT_VISIBLE_FIELDS.deals,
  })
  const [savedQueries, setSavedQueries] = useState<Array<{
    id: string
    name: string
    baseEntity: string
    conditions: Condition[]
    logic: 'AND' | 'OR'
    visibleFields?: Record<string, string[]>
    createdAt: string
  }>>([])

  // Get current visible fields for the selected base entity
  const currentVisibleFields = visibleFields[baseEntity] || DEFAULT_VISIBLE_FIELDS[baseEntity]

  // Load saved queries from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('visualQueries')
      if (saved) {
        setSavedQueries(JSON.parse(saved))
      }
    }
  }, [])

  const filterParams = {
    ...(filterSelection.type === 'individual' && { costCenter: filterSelection.value || undefined }),
    ...(filterSelection.type === 'group' && { costCenterGroup: filterSelection.value || undefined })
  }

  const addCondition = (condition: Condition) => {
    setConditions([...conditions, condition])
    setShowAddDialog(false)
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id))
  }

  const duplicateCondition = (id: string) => {
    const condition = conditions.find(c => c.id === id)
    if (condition) {
      const duplicate = {
        ...condition,
        id: Math.random().toString()
      }
      const index = conditions.findIndex(c => c.id === id)
      const newConditions = [...conditions]
      newConditions.splice(index + 1, 0, duplicate)
      setConditions(newConditions)
    }
  }

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const clearAll = () => {
    setConditions([])
    setResults([])
    setSortField(null)
  }

  const saveQuery = () => {
    if (!queryName.trim()) return

    const newQuery = {
      id: Date.now().toString(),
      name: queryName.trim(),
      baseEntity,
      conditions,
      logic,
      visibleFields,
      createdAt: new Date().toISOString()
    }

    const updated = [...savedQueries, newQuery]
    setSavedQueries(updated)
    localStorage.setItem('visualQueries', JSON.stringify(updated))
    setQueryName('')
    setShowSaveDialog(false)
  }

  const loadQuery = (query: typeof savedQueries[0]) => {
    setBaseEntity(query.baseEntity as any)
    setConditions(query.conditions)
    setLogic(query.logic)
    if (query.visibleFields) {
      setVisibleFields(query.visibleFields)
    }
    setResults([])
    setSortField(null)
    setShowLoadDialog(false)
  }

  const handleApplyFields = (fields: string[]) => {
    setVisibleFields({
      ...visibleFields,
      [baseEntity]: fields
    })
  }

  const deleteQuery = (id: string) => {
    const updated = savedQueries.filter(q => q.id !== id)
    setSavedQueries(updated)
    localStorage.setItem('visualQueries', JSON.stringify(updated))
  }

  const executeQuery = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:3001/api/analytics/visual-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseEntity,
          conditions,
          logic,
          ...filterParams
        })
      })

      const data = await response.json()
      console.log('Query results:', data)

      if (data.success) {
        setResults(data.data || [])
      } else {
        console.error('Query failed:', data)
        setResults([])
      }
    } catch (error) {
      console.error('Query execution error:', error)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const buildQueryDescription = () => {
    if (conditions.length === 0) {
      return `Show me: All ${baseEntity}`
    }

    const entityLabel = baseEntity === 'talents' ? 'Clients' :
                       baseEntity === 'brands' ? 'Brands' :
                       baseEntity === 'agents' ? 'Agents' : 'Deals'

    const conditionTexts = conditions.map(condition => {
      if (condition.type === 'relationship') {
        // Handle special entity types
        if (condition.entityType === 'any') {
          if (condition.relation === 'agents') {
            return condition.operator === 'has' ? 'represented by ANY agent' : 'NOT represented by any agent'
          } else if (condition.relation === 'deals') {
            return 'that do NOT have any deals'
          }
          return 'that have any'
        }

        if (condition.entityType === 'multiple') {
          return 'represented by multiple agents'
        }

        if (condition.entityType === 'active') {
          return 'that have active deals'
        }

        // Regular entity relationships
        const relationLabel = condition.operator === 'has' ? 'that have' : 'that do NOT have'
        const entityTypeLabel = condition.entityType === 'brand' ? 'deals with brand' :
                               condition.entityType === 'talent' ? 'deals with client' :
                               condition.entityType === 'agent' ? 'representation by agent' : ''
        return `${relationLabel} ${entityTypeLabel} "${condition.entityValue || '[select entity]'}"`
      } else {
        const operator = condition.fieldOperator === 'equals' ? '=' :
                        condition.fieldOperator === 'not_equals' ? '≠' :
                        condition.fieldOperator === 'contains' ? 'contains' :
                        condition.fieldOperator === 'greater_than' ? '>' :
                        condition.fieldOperator === 'less_than' ? '<' : '='
        return `where ${condition.field} ${operator} "${condition.value}"`
      }
    })

    return `Show me: ${entityLabel} ${conditionTexts.join(` ${logic} `)}`
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'talents': return Users
      case 'brands': return Building2
      case 'agents': return UserCircle
      case 'deals': return Briefcase
      default: return Users
    }
  }

  const handleResultClick = (result: any) => {
    switch (baseEntity) {
      case 'talents':
        router.push(`/talent/${result.id}`)
        break
      case 'brands':
        router.push(`/brands/${result.id}`)
        break
      case 'agents':
        router.push(`/agents/${result.id}`)
        break
      case 'deals':
        router.push(`/deals/${result.id}`)
        break
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortedResults = () => {
    if (!sortField) return results

    return [...results].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // Handle nested values (e.g., owner.name, brand.name)
      if (sortField.includes('.')) {
        const path = sortField.split('.')
        aVal = path.reduce((obj, key) => obj?.[key], a)
        bVal = path.reduce((obj, key) => obj?.[key], b)
      }

      // Handle array lengths (e.g., deals.length, clients.length)
      if (sortField.includes('_count')) {
        const arrayField = sortField.replace('_count', '')
        aVal = a[arrayField]?.length || 0
        bVal = b[arrayField]?.length || 0
      }

      // Handle null/undefined
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      // Handle different types
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      return 0
    })
  }

  const SortableHeader = ({ field, children, align = 'left' }: { field: string, children: React.ReactNode, align?: 'left' | 'right' }) => {
    const isSorted = sortField === field
    const Icon = isSorted ? (sortDirection === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown

    return (
      <th
        className={`${align === 'right' ? 'text-right' : 'text-left'} p-3 font-medium cursor-pointer hover:bg-accent/50 transition-colors select-none`}
        onClick={(e) => {
          e.stopPropagation()
          handleSort(field)
        }}
      >
        <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
          {children}
          <Icon className={`h-3 w-3 ${isSorted ? 'text-primary' : 'text-muted-foreground/50'}`} />
        </div>
      </th>
    )
  }

  // Helper to render cell content based on field ID
  const renderCellContent = (result: any, fieldId: string) => {
    switch (fieldId) {
      // Talents fields
      case 'Name':
        return result.Name || 'Unnamed'
      case 'category':
        return result.category || '-'
      case 'sport':
        return result.sport || '-'
      case 'status':
        return result.status ? <Badge variant="outline" className="text-xs">{result.status}</Badge> : null
      case 'Agent_Cost_Center__c':
        return result.Agent_Cost_Center__c || '-'
      case 'email':
        return result.email || '-'
      case 'phone':
        return result.phone || '-'
      case 'agents':
        return result.agents?.map((ta: any) => ta.agent?.name).filter(Boolean).join(', ') || '-'
      case 'deals_count':
        return result.deals?.length || 0
      case 'totalRevenue':
        return result.totalRevenue ? `$${result.totalRevenue.toLocaleString()}` : '-'
      case 'createdAt':
        return result.createdAt ? new Date(result.createdAt).toLocaleDateString() : '-'
      case 'lastDealDate':
        return result.lastDealDate ? new Date(result.lastDealDate).toLocaleDateString() : '-'

      // Brands fields
      case 'name':
        return result.name || 'Unnamed'
      case 'type':
        return result.type || '-'
      case 'industry':
        return result.industry || '-'
      case 'legalName':
        return result.legalName || '-'
      case 'website':
        return result.website || '-'
      case 'owner':
        return result.owner?.name || '-'
      case 'totalContracted':
        return result.totalContracted ? `$${result.totalContracted.toLocaleString()}` : '-'
      case 'projectedRevenue':
        return result.projectedRevenue ? `$${result.projectedRevenue.toLocaleString()}` : '-'
      case 'updatedAt':
        return result.updatedAt ? new Date(result.updatedAt).toLocaleDateString() : '-'

      // Agents fields
      case 'title':
        return result.title || '-'
      case 'company':
        return result.company || '-'
      case 'division':
        return result.division || '-'
      case 'costCenter':
        return result.costCenter || '-'
      case 'clients_count':
        return result.clients?.length || 0

      // Deals fields
      case 'brand':
        return result.brand?.name || '-'
      case 'StageName':
        return result.StageName || '-'
      case 'Status__c':
        return result.Status__c ? <Badge variant="outline" className="text-xs">{result.Status__c}</Badge> : null
      case 'clients':
        return result.clients?.map((dc: any) => dc.talentClient?.Name).filter(Boolean).join(', ') || '-'
      case 'Amount':
        return result.Amount ? `$${result.Amount.toLocaleString()}` : '-'
      case 'Contract_Amount__c':
        return result.Contract_Amount__c ? `$${result.Contract_Amount__c.toLocaleString()}` : '-'
      case 'CloseDate':
        return result.CloseDate ? new Date(result.CloseDate).toLocaleDateString() : '-'
      case 'Contract_Start_Date__c':
        return result.Contract_Start_Date__c ? new Date(result.Contract_Start_Date__c).toLocaleDateString() : '-'
      case 'Contract_End_Date__c':
        return result.Contract_End_Date__c ? new Date(result.Contract_End_Date__c).toLocaleDateString() : '-'

      default:
        return result[fieldId] || '-'
    }
  }

  // Helper to determine if field should be right-aligned
  const isRightAligned = (fieldId: string) => {
    return ['deals_count', 'clients_count', 'totalRevenue', 'totalContracted', 'projectedRevenue', 'Amount', 'Contract_Amount__c'].includes(fieldId)
  }

  const exportVisibleColumns = () => {
    const timestamp = new Date().toISOString().split('T')[0]

    // Build export data based on visible fields only
    const exportData = results.map(result => {
      const row: Record<string, any> = {}

      currentVisibleFields.forEach(fieldId => {
        const fieldDef = FIELD_DEFINITIONS[baseEntity]?.find(f => f.id === fieldId)
        if (!fieldDef) return

        // Get the display value using the same render function
        let value = renderCellContent(result, fieldId)

        // Convert React elements to strings for CSV export
        if (typeof value === 'object' && value !== null) {
          // Handle Badge components and other React elements
          if (result[fieldId]) {
            value = result[fieldId]
          } else {
            value = '-'
          }
        }

        row[fieldDef.label] = value
      })

      return row
    })

    const fileName = `${baseEntity}-visible-columns-${timestamp}`
    exportToCSV(exportData, fileName)
  }

  const exportAllFields = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const allFields = FIELD_DEFINITIONS[baseEntity] || []

    // Build export data with all available fields
    const exportData = results.map(result => {
      const row: Record<string, any> = {}

      allFields.forEach(fieldDef => {
        let value = renderCellContent(result, fieldDef.id)

        // Convert React elements to strings for CSV export
        if (typeof value === 'object' && value !== null) {
          if (result[fieldDef.id]) {
            value = result[fieldDef.id]
          } else {
            value = '-'
          }
        }

        row[fieldDef.label] = value
      })

      return row
    })

    const fileName = `${baseEntity}-all-fields-${timestamp}`
    exportToCSV(exportData, fileName)
  }

  const exportComplete = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('http://localhost:3001/api/analytics/visual-query/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseEntity,
          conditions,
          logic,
          ...filterParams
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        const timestamp = new Date().toISOString().split('T')[0]
        const fileName = `${baseEntity}-complete-export-${timestamp}`
        exportToCSV(data.data, fileName)
      } else {
        console.error('Export failed:', data)
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
      setShowExportDialog(false)
    }
  }

  const handleExport = (type: ExportType) => {
    if (results.length === 0) return

    switch (type) {
      case 'visible':
        exportVisibleColumns()
        setShowExportDialog(false)
        break
      case 'all-fields':
        exportAllFields()
        setShowExportDialog(false)
        break
      case 'complete':
        exportComplete()
        break
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Visual Relationship Builder
          </CardTitle>
          <CardDescription>
            Build visual queries to explore relationships across your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Side - Your Query */}
            <div className="border rounded-lg p-4 bg-card space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Your Query</h3>
                <p className="text-xs text-muted-foreground">Configure and preview your query</p>
              </div>

              {/* Base Entity Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Start with:</label>
                <Select value={baseEntity} onValueChange={(value: any) => {
                  setBaseEntity(value)
                  setConditions([])
                  setResults([])
                }}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="talents">Clients</SelectItem>
                    <SelectItem value="brands">Brands</SelectItem>
                    <SelectItem value="agents">Agents</SelectItem>
                    <SelectItem value="deals">Deals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Query Preview */}
              <div className="p-3 bg-muted/50 rounded-md text-xs border">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-muted-foreground">Preview:</div>
                  {results.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <div className="text-foreground leading-relaxed">{buildQueryDescription()}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={executeQuery} disabled={isLoading} className="w-full" size="sm">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Run Query
                    </>
                  )}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowLoadDialog(true)} className="flex-1">
                    <FolderOpen className="h-3 w-3 mr-2" />
                    Load
                  </Button>
                  {conditions.length > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(true)} className="flex-1">
                      <Save className="h-3 w-3 mr-2" />
                      Save
                    </Button>
                  )}
                </div>
                {(conditions.length > 0 || results.length > 0) && (
                  <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Right Side - Condition Building */}
            <div className="border rounded-lg p-4 bg-card space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">Build Conditions</h3>
                <p className="text-xs text-muted-foreground">Add and configure query conditions</p>
              </div>

              <div className="space-y-2">
                {conditions.map((condition, index) => (
                  <div key={condition.id} className="space-y-2">
                    {index > 0 && (
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-px bg-border"></div>
                        <Select value={logic} onValueChange={(value: 'AND' | 'OR') => setLogic(value)}>
                          <SelectTrigger className="w-20 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AND">AND</SelectItem>
                            <SelectItem value="OR">OR</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="h-4 w-px bg-border"></div>
                      </div>
                    )}

                    <ConditionNode
                      condition={condition}
                      baseEntity={baseEntity}
                      onUpdate={(updates) => updateCondition(condition.id, updates)}
                      onRemove={() => removeCondition(condition.id)}
                      onDuplicate={() => duplicateCondition(condition.id)}
                    />
                  </div>
                ))}

                {conditions.length > 0 && (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-px bg-border"></div>
                  </div>
                )}

                {/* Add Condition Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                  className="w-full border-dashed"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  Add Condition
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Query Results</CardTitle>
                <CardDescription>{results.length} {baseEntity} found</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFieldSelector(true)}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Customize Columns
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowExportDialog(true)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {(() => {
                    const Icon = getResultIcon(baseEntity)
                    return <Icon className="h-3 w-3" />
                  })()}
                  {baseEntity}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0 z-10">
                    <tr className="border-b">
                      {currentVisibleFields.map((fieldId) => {
                        const fieldDef = FIELD_DEFINITIONS[baseEntity]?.find(f => f.id === fieldId)
                        if (!fieldDef) return null

                        const align = isRightAligned(fieldId) ? 'right' : 'left'

                        return (
                          <SortableHeader key={fieldId} field={fieldId} align={align}>
                            {fieldDef.label}
                          </SortableHeader>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {getSortedResults().map((result, idx) => (
                      <tr
                        key={idx}
                        className="border-b hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        {currentVisibleFields.map((fieldId) => {
                          const align = isRightAligned(fieldId) ? 'text-right' : 'text-left'
                          const isFirstCol = fieldId === currentVisibleFields[0]

                          return (
                            <td
                              key={fieldId}
                              className={`p-3 ${align} ${isFirstCol ? 'font-medium' : ''}`}
                            >
                              {renderCellContent(result, fieldId)}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Condition Dialog */}
      {showAddDialog && (
        <AddConditionDialog
          baseEntity={baseEntity}
          onAdd={addCondition}
          onClose={() => setShowAddDialog(false)}
        />
      )}

      {/* Save Query Dialog */}
      {showSaveDialog && (
        <Dialog open onOpenChange={() => setShowSaveDialog(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Query</DialogTitle>
              <DialogDescription>
                Give your query a name to save it for later use
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Query name..."
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && queryName.trim()) {
                    saveQuery()
                  }
                }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowSaveDialog(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={saveQuery} disabled={!queryName.trim()}>
                  <Save className="h-3 w-3 mr-2" />
                  Save Query
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Load Query Dialog */}
      {showLoadDialog && (
        <Dialog open onOpenChange={() => setShowLoadDialog(false)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Load Saved Query</DialogTitle>
              <DialogDescription>
                Select a previously saved query to load
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 pt-4 max-h-[60vh] overflow-y-auto">
              {savedQueries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No saved queries yet. Save your first query to see it here.
                </div>
              ) : (
                savedQueries.map((query) => (
                  <div
                    key={query.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-accent cursor-pointer group"
                  >
                    <div className="flex-1" onClick={() => loadQuery(query)}>
                      <div className="font-medium text-sm">{query.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {query.baseEntity === 'talents' ? 'Clients' :
                         query.baseEntity === 'brands' ? 'Brands' :
                         query.baseEntity === 'agents' ? 'Agents' : 'Deals'} • {query.conditions.length} condition{query.conditions.length !== 1 ? 's' : ''} • {query.logic}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Saved {new Date(query.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteQuery(query.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Field Selector Dialog */}
      <FieldSelectorDialog
        open={showFieldSelector}
        onClose={() => setShowFieldSelector(false)}
        baseEntity={baseEntity}
        visibleFields={currentVisibleFields}
        onApply={handleApplyFields}
      />

      {/* Export Options Dialog */}
      <ExportOptionsDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
        isExporting={isExporting}
        visibleFieldCount={currentVisibleFields.length}
        totalFieldCount={FIELD_DEFINITIONS[baseEntity]?.length || 0}
        baseEntity={baseEntity}
      />
    </div>
  )
}
