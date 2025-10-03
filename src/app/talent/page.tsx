'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useInfiniteTalents, useTalentStats } from '../../hooks/useTalents'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { TalentFilters } from '../../types'
import { TalentListPanel } from '../../components/talent/talent-list-panel'
import { TalentDetailsPanel } from '../../components/talent/talent-details-panel'
import { useFilter } from '../../contexts/filter-context'
import { Search, Plus, Users, Loader2 } from 'lucide-react'

export default function TalentsPage() {
  const { filterSelection } = useFilter()
  const [filters, setFilters] = useState<Omit<TalentFilters, 'page' | 'limit'>>({})
  const [selectedTalentId, setSelectedTalentId] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [panelTopPosition, setPanelTopPosition] = useState<number>(0)
  const detailsPanelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const talentListRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteTalents(filters)

  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
    fetchNextPage,
  })

  // Get overall stats (respecting cost center filter only, not other filters)
  const costCenterOnlyFilters = {
    ...(filterSelection.type === 'individual' && { costCenter: filterSelection.value || undefined }),
    ...(filterSelection.type === 'group' && { costCenterGroup: filterSelection.value || undefined })
  }
  const { data: overallStats } = useTalentStats(costCenterOnlyFilters)

  // Get filtered stats for display purposes
  const { data: filteredStats } = useTalentStats(filters)

  const { talents, totalCount } = useMemo(() => {
    if (!data) return { talents: [], totalCount: 0 }
    return {
      talents: data.pages.flatMap(page => page.data),
      totalCount: data.pages[0]?.meta.total || 0
    }
  }, [data])

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  // Update filters when filter selection changes
  useEffect(() => {
    console.log('Talents page - filter selection changed:', filterSelection)
    setFilters(prev => {
      const newFilters = {
        ...prev,
        costCenter: filterSelection.type === 'individual' ? filterSelection.value || undefined : undefined,
        costCenterGroup: filterSelection.type === 'group' ? filterSelection.value || undefined : undefined
      }
      console.log('Talents page - setting filters:', newFilters)
      return newFilters
    })
  }, [filterSelection])

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchValue.trim() || undefined
      }))
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchValue])

  const handleStatusChange = (value: string) => {
    setFilters({
      ...filters,
      status: value === 'all' ? undefined : value as TalentFilters['status']
    })
  }

  const handleCategoryChange = (value: string) => {
    setFilters({
      ...filters,
      category: value === 'all' ? undefined : value
    })
  }


  const handleTalentClick = (talentId: string) => {
    // Calculate where to position the detail panel based on current scroll
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight

      // Position the panel to align with the current viewport center
      const idealTop = scrollTop + (viewportHeight / 2) - containerRect.top - 200
      setPanelTopPosition(Math.max(0, idealTop))
    }

    setSelectedTalentId(talentId)
  }

  // Handle click outside to close detail panel (but allow clicking other talent cards)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedTalentId &&
        detailsPanelRef.current &&
        talentListRef.current &&
        !detailsPanelRef.current.contains(event.target as Node) &&
        !talentListRef.current.contains(event.target as Node)
      ) {
        setSelectedTalentId(null)
      }
    }

    if (selectedTalentId) {
      // Add a small delay to avoid closing immediately after opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [selectedTalentId])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    // Make status badge colors more flexible
    const lowercaseStatus = status?.toLowerCase()
    if (lowercaseStatus?.includes('active') && !lowercaseStatus?.includes('inactive')) {
      return 'default'
    }
    if (lowercaseStatus?.includes('retired') || lowercaseStatus?.includes('ended') || lowercaseStatus?.includes('pending')) {
      return 'outline'
    }
    return 'secondary'
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get selected talent from the talents array
  const selectedTalent = talents.find(t => t.id === selectedTalentId) || (talents.length > 0 ? talents[0] : null)

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading Talents</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Could not connect to the API. Make sure the backend server is running on http://localhost:3001
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Talent Clients</h1>
            <p className="text-muted-foreground">
              Manage your talent roster and client relationships
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Talent
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Talent Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Talent Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats?.totalActive || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NIL Athletes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats?.totalNil || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                NIL eligible
              </p>
            </CardContent>
          </Card> 
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter and search through your talent roster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search talents..."
                    className="pl-8"
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select onValueChange={handleStatusChange} defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select onValueChange={handleCategoryChange} defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Baseball">Baseball</SelectItem>
                  <SelectItem value="Men's Basketball">Men's Basketball</SelectItem>
                  <SelectItem value="Women's Basketball">Women's Basketball</SelectItem>
                  <SelectItem value="Coaching & Front Office">Coaching & Front Office</SelectItem>
                  <SelectItem value="Cycling">Cycling</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Football;Media">Football;Media</SelectItem>
                  <SelectItem value="Golf">Golf</SelectItem>
                  <SelectItem value="Hockey">Hockey</SelectItem>
                  <SelectItem value="Marketing Influencers">Marketing Influencers</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Men's Global Football/Soccer">Men's Global Football/Soccer</SelectItem>
                  <SelectItem value="Women's Global Football/Soccer">Women's Global Football/Soccer</SelectItem>
                  <SelectItem value="Olympics & Paralympics">Olympics & Paralympics</SelectItem>
                  <SelectItem value="Olympics & Paralympics;Rugby">Olympics & Paralympics;Rugby</SelectItem>
                  <SelectItem value="Rugby">Rugby</SelectItem>
                </SelectContent>
              </Select>

            </div>
          </CardContent>
        </Card>

        {/* Talent Roster - Panel Layout */}
        <Card>
          <CardHeader>
            <CardTitle>Talent Roster</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `Showing ${talents.length} of ${filteredStats?.total || totalCount} ${Object.keys(filters).length > 0 ? 'filtered' : ''} talent clients`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading talents...</p>
              </div>
            ) : talents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No talents found matching your criteria</p>
              </div>
            ) : (
              <div ref={containerRef} className="relative">
                <div className={`transition-all duration-300 ${selectedTalentId ? 'lg:grid lg:grid-cols-3 gap-6' : ''}`}>
                  <div ref={talentListRef}>
                    <TalentListPanel
                      talents={talents.map(t => ({
                        ...t,
                        lastDealDate: t.lastDealDate || t.LastActivityDate
                      }))}
                      selectedTalentId={selectedTalentId}
                      onTalentClick={handleTalentClick}
                      formatDate={formatDate}
                      getStatusVariant={getStatusVariant}
                    />
                  </div>

                  {selectedTalentId && (
                    <div
                      ref={detailsPanelRef}
                      className="lg:col-span-2 animate-in slide-in-from-right duration-300"
                      style={{
                        position: selectedTalentId ? 'sticky' : 'static',
                        top: '1rem',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <TalentDetailsPanel
                        talent={selectedTalent ? {
                          ...selectedTalent,
                          lastActivity: selectedTalent.lastDealDate || selectedTalent.LastActivityDate
                        } : null}
                        emptyMessage="Select a talent to view details"
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getStatusVariant={getStatusVariant}
                        onClose={() => setSelectedTalentId(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load More Trigger */}
        {hasNextPage && (
          <div ref={loadMoreRef} className="flex items-center justify-center py-6">
            {isFetchingNextPage ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading more talents...</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Scroll down to load more talents
              </div>
            )}
          </div>
        )}

        {/* Show total count */}
        {!hasNextPage && talents.length > 0 && (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            Showing all {talents.length} talents
          </div>
        )}
      </div>
    </AppLayout>
  )
}