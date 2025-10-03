'use client'

import { useState, useEffect, useMemo } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { useGlobalSearch } from '../../hooks/useSearch'
import { useFilter } from '../../contexts/filter-context'
import { useLabels } from '../../hooks/useLabels'
import { SearchResult } from '../../types'
import { Search, Users, Building2, UserCheck, Briefcase, Loader2 } from 'lucide-react'

interface GlobalSearchProps {
  trigger?: React.ReactNode
  onResultSelect?: (result: SearchResult) => void
}

export function GlobalSearch({ trigger, onResultSelect }: GlobalSearchProps) {
  const { labels } = useLabels()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const { filterSelection } = useFilter()

  // Build filter object based on filter selection
  const searchFilters = useMemo(() => {
    if (filterSelection.type === 'group') {
      return { costCenterGroup: filterSelection.value, costCenter: null }
    } else if (filterSelection.type === 'individual') {
      return { costCenter: filterSelection.value, costCenterGroup: null }
    }
    return { costCenter: null, costCenterGroup: null }
  }, [filterSelection])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading } = useGlobalSearch(debouncedQuery, searchFilters, isOpen && debouncedQuery.length >= 2)

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'talent':
        return <Users className="h-4 w-4" />
      case 'brand':
        return <Building2 className="h-4 w-4" />
      case 'agent':
        return <UserCheck className="h-4 w-4" />
      case 'deal':
        return <Briefcase className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'talent':
        return 'bg-blue-100 text-blue-800'
      case 'brand':
        return 'bg-green-100 text-green-800'
      case 'agent':
        return 'bg-purple-100 text-purple-800'
      case 'deal':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    onResultSelect?.(result)
  }

  const formatAmount = (amount?: string | number) => {
    if (!amount) return null
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  }

  const getTooltipContent = (result: SearchResult) => {
    switch (result.type) {
      case 'talent':
        const primaryAgent = result.agents?.find(a => a.isPrimary)?.agent?.name
        return (
          <div className="space-y-2">
            <div className="font-semibold">{result.title}</div>
            {result.status && (
              <div className="text-xs">
                <span className="font-medium">Status:</span> {result.status}
              </div>
            )}
            {(result.sport || result.team) && (
              <div className="text-xs">
                {result.sport && <span className="font-medium">Sport:</span>} {result.sport}
                {result.sport && result.team && ' • '}
                {result.team && <span className="font-medium">Team:</span>} {result.team}
              </div>
            )}
            {primaryAgent && (
              <div className="text-xs">
                <span className="font-medium">{labels.agent}:</span> {primaryAgent}
              </div>
            )}
          </div>
        )

      case 'brand':
        return (
          <div className="space-y-2">
            <div className="font-semibold">{result.title}</div>
            {result.category && (
              <div className="text-xs">
                <span className="font-medium">Type:</span> {result.category}
              </div>
            )}
            {result.industry && (
              <div className="text-xs">
                <span className="font-medium">Industry:</span> {result.industry}
              </div>
            )}
            {result.status && (
              <div className="text-xs">
                <span className="font-medium">Status:</span> {result.status}
              </div>
            )}
            {result.owner?.name && (
              <div className="text-xs">
                <span className="font-medium">Owner:</span> {result.owner.name}
              </div>
            )}
          </div>
        )

      case 'agent':
        return (
          <div className="space-y-2">
            <div className="font-semibold">{result.title}</div>
            {result.email && (
              <div className="text-xs">
                <span className="font-medium">Email:</span> {result.email}
              </div>
            )}
            {result.company && (
              <div className="text-xs">
                <span className="font-medium">Company:</span> {result.company}
              </div>
            )}
            {result.division && (
              <div className="text-xs">
                <span className="font-medium">Division:</span> {result.division}
              </div>
            )}
            {result.jobTitle && (
              <div className="text-xs">
                <span className="font-medium">Title:</span> {result.jobTitle}
              </div>
            )}
          </div>
        )

      case 'deal':
        return (
          <div className="space-y-2">
            <div className="font-semibold">{result.title}</div>
            {result.brand?.name && (
              <div className="text-xs">
                <span className="font-medium">Brand:</span> {result.brand.name}
              </div>
            )}
            {result.stage && (
              <div className="text-xs">
                <span className="font-medium">Stage:</span> {result.stage}
              </div>
            )}
            {result.status && (
              <div className="text-xs">
                <span className="font-medium">Status:</span> {result.status}
              </div>
            )}
            {result.amount && (
              <div className="text-sm font-semibold">
                {formatAmount(result.amount)}
              </div>
            )}
            {result.owner?.name && (
              <div className="text-xs">
                <span className="font-medium">Owner:</span> {result.owner.name}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="justify-start">
            <Search className="mr-2 h-4 w-4" />
            Search...
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-0">
          <DialogHeader>
            <DialogTitle>Global Search</DialogTitle>
          </DialogHeader>
        </div>
        <div className="flex flex-col gap-4 px-6 pb-6 flex-1 min-h-0">
          {/* Search Input */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search talents, brands, ${labels.agents.toLowerCase()}, ${labels.deals.toLowerCase()}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="flex-1 min-h-[200px] overflow-y-auto overflow-x-hidden">
            {query.length < 2 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Type at least 2 characters to search</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 mx-auto mb-2 animate-spin" />
                  <p className="text-muted-foreground">Searching...</p>
                </div>
              </div>
            ) : !results || !Array.isArray(results) || results.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                </div>
              </div>
            ) : (
              <TooltipProvider delayDuration={300}>
                <div className="space-y-2 pr-2">
                  {Array.isArray(results) && results.map((result) => (
                    <Tooltip key={`${result.type}-${result.id}`}>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => handleResultClick(result)}
                          className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className={`p-2 rounded-md flex-shrink-0 ${getTypeColor(result.type)}`}>
                            {getTypeIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap">
                              <p className="font-medium truncate">{result.title}</p>
                              <Badge variant="outline" className="capitalize flex-shrink-0">
                                {result.type}
                              </Badge>
                            </div>
                            {result.subtitle && (
                              <p className="text-sm text-muted-foreground truncate">
                                {result.subtitle}
                              </p>
                            )}
                            {result.category && (
                              <Badge variant="secondary" className="mt-1 text-xs">
                                {result.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        {getTooltipContent(result)}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>
            )}
          </div>

          {/* Search Tips */}
          {query.length === 0 && (
            <div className="border-t pt-4 flex-shrink-0">
              <h4 className="font-medium mb-2">Search Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Search by name, email, or category</li>
                <li>• Results include talents, brands, {labels.agents.toLowerCase()}, and {labels.deals.toLowerCase()}</li>
                <li>• Use specific terms for better results</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}