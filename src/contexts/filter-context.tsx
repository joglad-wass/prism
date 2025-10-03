'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type FilterType = 'all' | 'group' | 'individual'

type FilterSelection = {
  type: FilterType
  value: string | null  // group ID or individual cost center code
}

type FilterProviderProps = {
  children: React.ReactNode
  storageKey?: string
}

type FilterProviderState = {
  selectedCostCenter: string | null  // For backward compatibility
  filterSelection: FilterSelection
  setSelectedCostCenter: (costCenter: string | null) => void
  setFilterSelection: (selection: FilterSelection) => void
}

const initialState: FilterProviderState = {
  selectedCostCenter: null,
  filterSelection: { type: 'all', value: null },
  setSelectedCostCenter: () => null,
  setFilterSelection: () => null,
}

const FilterProviderContext = createContext<FilterProviderState>(initialState)

export function FilterProvider({
  children,
  storageKey = 'prism-cost-center-filter',
  ...props
}: FilterProviderProps) {
  const [filterSelection, setFilterSelection] = useState<FilterSelection>({ type: 'all', value: null })
  const [mounted, setMounted] = useState(false)

  // Get initial filter from localStorage after component mounts
  useEffect(() => {
    const savedFilter = localStorage?.getItem(storageKey)
    if (savedFilter) {
      try {
        const parsed = JSON.parse(savedFilter) as FilterSelection
        setFilterSelection(parsed)
      } catch {
        // Backward compatibility: handle old string format
        setFilterSelection(savedFilter === 'all'
          ? { type: 'all', value: null }
          : { type: 'individual', value: savedFilter }
        )
      }
    }
    setMounted(true)
  }, [storageKey])

  const value = {
    selectedCostCenter: filterSelection.type === 'individual' ? filterSelection.value : null,
    filterSelection,
    setSelectedCostCenter: (costCenter: string | null) => {
      const selection: FilterSelection = costCenter
        ? { type: 'individual', value: costCenter }
        : { type: 'all', value: null }
      localStorage?.setItem(storageKey, JSON.stringify(selection))
      setFilterSelection(selection)
    },
    setFilterSelection: (selection: FilterSelection) => {
      localStorage?.setItem(storageKey, JSON.stringify(selection))
      setFilterSelection(selection)
    },
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <FilterProviderContext.Provider {...props} value={value}>
      {children}
    </FilterProviderContext.Provider>
  )
}

export const useFilter = () => {
  const context = useContext(FilterProviderContext)

  if (context === undefined)
    throw new Error('useFilter must be used within a FilterProvider')

  return context
}
