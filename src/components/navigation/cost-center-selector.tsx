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

  // Get user's allowed cost centers based on their role
  const getAllowedCostCenters = () => {
    if (!user) return []

    if (user.userType === 'ADMINISTRATOR') {
      // Administrators can access all cost centers
      return options.map(opt => opt.value)
    }

    // Agents can only access their cost center or group
    const allowed: string[] = []

    if (user.costCenter) {
      // Check if the cost center is a group ID or individual cost center
      if (user.costCenter.startsWith('group:') ||
          options.some(opt => opt.type === 'group' && opt.value === `group:${user.costCenter}`)) {
        allowed.push(`group:${user.costCenter}`)
      } else {
        allowed.push(`individual:${user.costCenter}`)
      }
    }

    return allowed
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
            opts.push({
              value: `individual:${cc}`,
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

  const allowedCostCenters = getAllowedCostCenters()

  // Filter options based on user permissions
  const filteredOptions = user?.userType === 'ADMINISTRATOR'
    ? options
    : options.filter(opt => allowedCostCenters.includes(opt.value))

  return (
    <div className="px-3 pb-3">
      <Select
        value={getCurrentValue()}
        onValueChange={handleValueChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2 w-full">
            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <SelectValue placeholder="Select Cost Center" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {canAccessAll && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <span>All</span>
                <Badge variant="secondary" className="text-xs">
                  Admin Only
                </Badge>
              </div>
            </SelectItem>
          )}
          {filteredOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.type === 'group' && <Users className="h-3 w-3 text-muted-foreground" />}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
