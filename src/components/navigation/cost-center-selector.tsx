'use client'

import { useEffect, useState } from 'react'
import { useFilter } from '../../contexts/filter-context'
import { useUser } from '../../contexts/user-context'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Badge } from '../ui/badge'
import { Building2, Users } from 'lucide-react'

interface CostCenterGroup {
  id: string
  groupName: string
  displayName: string
  costCenters: string[]
  isSystem: boolean
}

interface CostCenterOption {
  value: string
  label: string
  type: 'all' | 'group' | 'individual'
}

export function CostCenterSelector() {
  const { filterSelection, setFilterSelection } = useFilter()
  const { user } = useUser()
  const [options, setOptions] = useState<CostCenterOption[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCostCenters()
  }, [])

  // Check if user can access "All" option
  const canAccessAll = user?.userType === 'ADMINISTRATOR'

  const getAllowedValues = () => {
    if (!user) return []

    if (user.userType === 'ADMINISTRATOR') {
      return ['all', ...options.map((opt) => opt.value)]
    }

    if (user.defaultFilterType === 'group' && user.defaultFilterValue) {
      return [`group:${user.defaultFilterValue}`]
    }

    if (user.defaultFilterType === 'individual' && user.defaultFilterValue) {
      return [`individual:${user.defaultFilterValue}`]
    }

    if (user.defaultFilterType === 'all') {
      return ['all']
    }

    const inferred: string[] = []

    if (user.costCenter) {
      if (options.some((opt) => opt.type === 'group' && opt.value === `group:${user.costCenter}`)) {
        inferred.push(`group:${user.costCenter}`)
      } else {
        inferred.push(`individual:${user.costCenter}`)
      }
    }

    return inferred
  }

  const fetchCostCenters = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/cost-centers')
      const data = await response.json()

      if (data.success && data.data) {
        const opts: CostCenterOption[] = []

        // Add groups
        if (data.data.groups && Array.isArray(data.data.groups)) {
          data.data.groups.forEach((group: CostCenterGroup) => {
            opts.push({
              value: `group:${group.id}`,
              label: group.displayName,
              type: 'group'
            })
          })
        }

        // Add ungrouped individual cost centers
        if (data.data.ungrouped && Array.isArray(data.data.ungrouped)) {
          data.data.ungrouped.forEach((cc: string) => {
            // Extract cost center code (e.g., "CC501" from "CC501 Brillstein Management")
            const costCenterCode = cc.match(/^(CC\d{3})/)?.[1] || cc
            opts.push({
              value: `individual:${costCenterCode}`,
              label: cc.replace(/^CC\d{3}\s*/, '').trim() || cc,
              type: 'individual'
            })
          })
        }

        setOptions(opts)
      }
    } catch (error) {
      console.error('Failed to fetch cost centers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleValueChange = (value: string) => {
    console.log('Cost center selector - value changed:', value)
    if (value === 'all') {
      const selection = { type: 'all' as const, value: null }
      console.log('Setting filter to:', selection)
      setFilterSelection(selection)
    } else if (value.startsWith('group:')) {
      const groupId = value.replace('group:', '')
      const selection = { type: 'group' as const, value: groupId }
      console.log('Setting filter to:', selection)
      setFilterSelection(selection)
    } else if (value.startsWith('individual:')) {
      const costCenter = value.replace('individual:', '')
      const selection = { type: 'individual' as const, value: costCenter }
      console.log('Setting filter to:', selection)
      setFilterSelection(selection)
    }
  }

  const getCurrentValue = () => {
    if (filterSelection.type === 'all') return 'all'
    if (filterSelection.type === 'group') return `group:${filterSelection.value}`
    if (filterSelection.type === 'individual') return `individual:${filterSelection.value}`
    return 'all'
  }

  const getCurrentLabel = () => {
    const currentValue = getCurrentValue()
    if (currentValue === 'all') return 'All'

    const option = options.find(opt => opt.value === currentValue)
    return option?.label || 'Select Cost Center'
  }

  const allowedValues = getAllowedValues()

  // Filter options based on user permissions
  const filteredOptions = user?.userType === 'ADMINISTRATOR'
    ? options
    : options.filter((opt) => allowedValues.includes(opt.value))

  // Non-admin users with a default filter shouldn't be able to change the filter
  const isFilterLocked = user?.userType !== 'ADMINISTRATOR' && user?.defaultFilterType && user.defaultFilterType !== 'all'

  return (
    <div className="px-3 pb-3">
      <Select
        value={getCurrentValue()}
        onValueChange={handleValueChange}
        disabled={isLoading || isFilterLocked}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2 w-full min-w-0">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate flex-1 text-left">
              {getCurrentLabel()}
            </span>
            {isFilterLocked && (
              <Badge variant="outline" className="text-xs flex-shrink-0">
                Assigned
              </Badge>
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {(canAccessAll || allowedValues.includes('all')) && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <span>All</span>
                {canAccessAll && (
                  <Badge variant="secondary" className="text-xs">
                    Admin Only
                  </Badge>
                )}
              </div>
            </SelectItem>
          )}
          {filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.type === 'group' && <Users className="h-3 w-3 text-muted-foreground" />}
                <span className="truncate">{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* {isFilterLocked && (
        <div className="mt-2 px-1">
          <div className="group relative inline-block">
            <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center cursor-help">
              <span className="text-xs text-muted-foreground">?</span>
            </div>
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50">
              <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded border shadow-md whitespace-nowrap">
                Your filter is managed by your cost center assignment
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}
