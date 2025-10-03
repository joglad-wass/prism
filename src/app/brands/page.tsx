'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
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
import { useInfiniteBrands, useBrandStats } from '../../hooks/useBrands'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { BrandFilters, Brand } from '../../types'
import { BrandListPanel } from '../../components/brand/brand-list-panel'
import { BrandDetailsPanel } from '../../components/brand/brand-details-panel'
import { Search, Plus, Building2, DollarSign, TrendingUp, Loader2 } from 'lucide-react'

export default function BrandsPage() {
  const [filters, setFilters] = useState<Omit<BrandFilters, 'page' | 'limit'>>({})
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)
  const [panelTopPosition, setPanelTopPosition] = useState<number>(0)
  const detailsPanelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const brandListRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteBrands(filters)

  const { loadMoreRef } = useInfiniteScroll({
    hasNextPage: hasNextPage || false,
    isFetchingNextPage,
    fetchNextPage,
  })

  // Get overall stats (unfiltered) for analytics cards
  const { data: overallStats } = useBrandStats()

  // Get filtered stats for display purposes
  const { data: filteredStats } = useBrandStats(filters)

  const { brands, totalCount } = useMemo(() => {
    if (!data) return { brands: [], totalCount: 0 }
    return {
      brands: data.pages.flatMap(page => page.data),
      totalCount: data.pages[0]?.meta.total || 0
    }
  }, [data])

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value || undefined })
  }

  const handleStatusChange = (value: string) => {
    setFilters({
      ...filters,
      status: value === 'all' ? undefined : value as BrandFilters['status']
    })
  }

  const handleTypeChange = (value: string) => {
    setFilters({
      ...filters,
      type: value === 'all' ? undefined : value as BrandFilters['type']
    })
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
        return 'secondary'
      case 'PROSPECT':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getTypeVariant = (type: string): 'default' | 'secondary' => {
    return type === 'AGENCY' ? 'secondary' : 'default'
  }

  const handleBrandClick = (brandId: string) => {
    // Calculate where to position the detail panel based on current scroll
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight

      // Position the panel to align with the current viewport center
      const idealTop = scrollTop + (viewportHeight / 2) - containerRect.top - 200
      setPanelTopPosition(Math.max(0, idealTop))
    }

    setSelectedBrandId(brandId)
  }

  // Handle click outside to close detail panel (but allow clicking other brand cards)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedBrandId &&
        detailsPanelRef.current &&
        brandListRef.current &&
        !detailsPanelRef.current.contains(event.target as Node) &&
        !brandListRef.current.contains(event.target as Node)
      ) {
        setSelectedBrandId(null)
      }
    }

    if (selectedBrandId) {
      // Add a small delay to avoid closing immediately after opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [selectedBrandId])

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get selected brand from the brands array
  const selectedBrand = brands.find(b => b.id === selectedBrandId) || (brands.length > 0 ? brands[0] : null)

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading Brands</h2>
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
            <h1 className="text-2xl font-bold tracking-tight">Brands</h1>
            <p className="text-muted-foreground">
              Manage your brand partnerships and client relationships
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All brands & agencies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">Agencies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats?.totalAgencies || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Partner agencies
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prospects</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats?.totalProspects || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Potential partners
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter and search through your brand portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search brands..."
                    className="pl-8"
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
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PROSPECT">Prospect</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select onValueChange={handleTypeChange} defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="BRAND">Brand</SelectItem>
                  <SelectItem value="AGENCY">Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Brand Portfolio - Panel Layout */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Portfolio</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `Showing ${brands.length} of ${filteredStats?.total || totalCount} ${Object.keys(filters).length > 0 ? 'filtered' : ''} brands`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading brands...</p>
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No brands found matching your criteria</p>
              </div>
            ) : (
              <div ref={containerRef} className="relative">
                <div className={`transition-all duration-300 ${selectedBrandId ? 'lg:grid lg:grid-cols-3 gap-6' : ''}`}>
                  <div ref={brandListRef}>
                    <BrandListPanel
                      brands={brands}
                      selectedBrandId={selectedBrandId}
                      onBrandClick={handleBrandClick}
                      getStatusVariant={getStatusVariant}
                      getTypeVariant={getTypeVariant}
                    />
                  </div>

                  {selectedBrandId && (
                    <div
                      ref={detailsPanelRef}
                      className="lg:col-span-2 animate-in slide-in-from-right duration-300"
                      style={{
                        position: selectedBrandId ? 'sticky' : 'static',
                        top: '1rem',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <BrandDetailsPanel
                        brand={selectedBrand ? {
                          ...selectedBrand,
                          lastActivity: selectedBrand.updatedAt
                        } : null}
                        emptyMessage="Select a brand to view details"
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getStatusVariant={getStatusVariant}
                        getTypeVariant={getTypeVariant}
                        onClose={() => setSelectedBrandId(null)}
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
                <span>Loading more brands...</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Scroll down to load more brands
              </div>
            )}
          </div>
        )}

        {/* Show total count */}
        {!hasNextPage && brands.length > 0 && (
          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
            Showing all {brands.length} brands
          </div>
        )}
      </div>
    </AppLayout>
  )
}