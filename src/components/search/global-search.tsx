'use client'

import { useState, useEffect } from 'react'
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
import { useGlobalSearch } from '../../hooks/useSearch'
import { SearchResult } from '../../types'
import { Search, Users, Building2, UserCheck, Briefcase, Loader2 } from 'lucide-react'

interface GlobalSearchProps {
  trigger?: React.ReactNode
  onResultSelect?: (result: SearchResult) => void
}

export function GlobalSearch({ trigger, onResultSelect }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading } = useGlobalSearch(debouncedQuery, isOpen && debouncedQuery.length >= 2)

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search talents, brands, agents, deals..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="min-h-[200px] max-h-[400px] overflow-auto">
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
              <div className="space-y-2">
                {Array.isArray(results) && results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-md ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">{result.title}</p>
                        <Badge variant="outline" className="capitalize">
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
                ))}
              </div>
            )}
          </div>

          {/* Search Tips */}
          {query.length === 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Search Tips:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Search by name, email, or category</li>
                <li>• Results include talents, brands, agents, and deals</li>
                <li>• Use specific terms for better results</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}