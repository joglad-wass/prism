'use client'

import { useState, useMemo } from 'react'
import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
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
import { BrandFilters } from '../../types'
import { Search, Plus, Building2, DollarSign, TrendingUp, Loader2 } from 'lucide-react'

export default function BrandsPage() {
  const [filters, setFilters] = useState<Omit<BrandFilters, 'page' | 'limit'>>({})

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

  const getStatusVariant = (status: string) => {
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

  const getTypeVariant = (type: string) => {
    return type === 'AGENCY' ? 'secondary' : 'default'
  }

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

        {/* Brands Table */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Portfolio</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `Showing ${brands.length} of ${filteredStats?.total || totalCount} ${Object.keys(filters).length > 0 ? 'filtered' : ''} brands`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Brand Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Legal Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Loading brands...
                      </TableCell>
                    </TableRow>
                  ) : brands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No brands found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    brands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{brand.name}</div>
                            {brand.altName && (
                              <div className="text-sm text-muted-foreground">
                                {brand.altName}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(brand.type)}>
                            {brand.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(brand.status)}>
                            {brand.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {brand.industry || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {brand.owner?.name || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                            {brand.currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground max-w-32 truncate">
                            {brand.legalName || brand.name}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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