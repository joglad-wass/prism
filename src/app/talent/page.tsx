'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
import { useInfiniteTalents, useTalentStats } from '../../hooks/useTalents'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { TalentFilters } from '../../types'
import { TalentQuickView, TalentQuickViewData } from '../../components/talent/talent-quick-view'
import { Search, Plus, Users, Loader2 } from 'lucide-react'

export default function TalentsPage() {
  const router = useRouter()
  const [filters, setFilters] = useState<Omit<TalentFilters, 'page' | 'limit'>>({})
  const [selectedTalent, setSelectedTalent] = useState<TalentQuickViewData | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

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

  // Get overall stats (unfiltered) for analytics cards
  const { data: overallStats } = useTalentStats()

  // Get filtered stats for display purposes
  const { data: filteredStats } = useTalentStats(filters)

  const { talents, totalCount } = useMemo(() => {
    if (!data) return { talents: [], totalCount: 0 }
    return {
      talents: data.pages.flatMap(page => page.data),
      totalCount: data.pages[0]?.meta.total || 0
    }
  }, [data])

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value || undefined })
  }

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


  interface Talent {
    id: string
    name: string
    agent?: { name: string }
    agents?: {
      isPrimary: boolean
      agent: {
        name: string
      }
    }[]
    costCenter?: string
    sport?: string
    team?: string
    category?: string
    status: string
    dealCount?: number
    totalRevenue?: number
    wassRevenue?: number
    lastActivity?: string
    lastDealDate?: string
    location?: string
    isNil?: boolean
  }

  const handleTalentClick = (talent: Talent) => {
    const quickViewData: TalentQuickViewData = {
      id: talent.id,
      name: talent.name,
      agents: talent.agents || null,
      costCenter: talent.costCenter,
      sport: talent.sport,
      team: talent.team,
      category: talent.category,
      status: talent.status,
      dealCount: talent.dealCount || 0,
      totalRevenue: talent.totalRevenue,
      wassRevenue: talent.wassRevenue,
      lastActivity: talent.lastActivity || talent.lastDealDate,
      location: talent.location,
      isNil: talent.isNil,
    }
    setSelectedTalent(quickViewData)
    setQuickViewOpen(true)
  }

  const handleViewProfile = (talentId: string) => {
    router.push(`/talent/${talentId}`)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusVariant = (status: string) => {
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

        {/* Talents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Talent Roster</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `Showing ${talents.length} of ${filteredStats?.total || totalCount} ${Object.keys(filters).length > 0 ? 'filtered' : ''} talent clients`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Last Deal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        Loading talents...
                      </TableCell>
                    </TableRow>
                  ) : talents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No talents found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    talents.map((talent) => (
                      <TableRow
                        key={talent.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleTalentClick(talent)}
                      >
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{talent.name}</div>
                            {/* {talent.location && (
                              <div className="text-sm text-muted-foreground">
                                {talent.location}
                              </div>
                            )} */}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {talent.category && (
                              <Badge variant="outline">{talent.category}</Badge>
                            )}
                            {talent.isNil && (
                              <Badge variant="secondary">NIL</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(talent.status)}>
                            {talent.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {talent.sport || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {talent.agents?.find(ta => ta.isPrimary)?.agent?.name || talent.agents?.[0]?.agent?.name || 'No agent assigned'}
                        </TableCell>
                        <TableCell>
                          {formatDate(talent.lastDealDate)}
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

        {/* Quick View Dialog */}
        {selectedTalent && (
          <TalentQuickView
            talent={selectedTalent}
            open={quickViewOpen}
            onOpenChange={setQuickViewOpen}
            onViewProfile={handleViewProfile}
          />
        )}
      </div>
    </AppLayout>
  )
}