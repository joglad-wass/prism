'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useUser } from './user-context'

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
  const [filterSelection, setFilterSelectionState] = useState<FilterSelection>({ type: 'all', value: null })
  const [mounted, setMounted] = useState(false)
  const { user, isLoading: isUserLoading } = useUser()

  const effectiveStorageKey = useMemo(() => {
    return user?.id ? `${storageKey}:${user.id}` : storageKey
  }, [storageKey, user?.id])

  const getDefaultSelection = useCallback((): FilterSelection => {
    if (!user || !user.defaultFilterType) {
      return { type: 'all', value: null }
    }

    switch (user.defaultFilterType) {
      case 'group':
      case 'individual':
        return {
          type: user.defaultFilterType as FilterType,
          value: user.defaultFilterValue,
        }
      case 'all':
      default:
        return { type: 'all', value: null }
    }
  }, [user?.defaultFilterType, user?.defaultFilterValue])

  const isSelectionAllowed = useCallback((selection: FilterSelection) => {
    if (!user) return true
    if (user.userType === 'ADMINISTRATOR') return true

    const defaultSelection = getDefaultSelection()

    return (
      selection.type === defaultSelection.type &&
      selection.value === defaultSelection.value
    )
  }, [getDefaultSelection, user?.userType])

  // Get initial filter from localStorage after component mounts
  useEffect(() => {
    if (mounted && isUserLoading) {
      return
    }

    const savedFilter = typeof window !== 'undefined'
      ? window.localStorage.getItem(effectiveStorageKey)
      : null

    let initialSelection: FilterSelection | null = null

    if (savedFilter) {
      try {
        const parsed = JSON.parse(savedFilter) as FilterSelection
        if (parsed && parsed.type && isSelectionAllowed(parsed)) {
          initialSelection = parsed
        }
      } catch {
        if (savedFilter === 'all') {
          initialSelection = { type: 'all', value: null }
        } else {
          initialSelection = { type: 'individual', value: savedFilter }
        }
      }
    }

    if (!initialSelection) {
      initialSelection = getDefaultSelection()
    }

    setFilterSelectionState(initialSelection)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(effectiveStorageKey, JSON.stringify(initialSelection))
    }

    if (!mounted) {
      setMounted(true)
    }
  }, [
    effectiveStorageKey,
    isUserLoading,
    mounted,
    getDefaultSelection,
    isSelectionAllowed,
  ])

  const value = {
    selectedCostCenter: filterSelection.type === 'individual' ? filterSelection.value : null,
    filterSelection,
    setSelectedCostCenter: (costCenter: string | null) => {
      const selection: FilterSelection = costCenter
        ? { type: 'individual', value: costCenter }
        : { type: 'all', value: null }
      if (isSelectionAllowed(selection)) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(effectiveStorageKey, JSON.stringify(selection))
        }
        setFilterSelectionState(selection)
      }
    },
    setFilterSelection: (selection: FilterSelection) => {
      if (isSelectionAllowed(selection)) {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(effectiveStorageKey, JSON.stringify(selection))
        }
        setFilterSelectionState(selection)
      }
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
