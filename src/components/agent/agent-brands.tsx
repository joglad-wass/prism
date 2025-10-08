'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Building2, ExternalLink, DollarSign, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLabels } from '../../hooks/useLabels'
import { ViewToggle } from '../talent/view-toggle'

import { Agent } from '../../types'

interface AgentBrandsProps {
  agent: Agent
}

export function AgentBrands({ agent }: AgentBrandsProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [selectedBrand, setSelectedBrand] = useState<any>(null)

  // Initialize view from localStorage
  const [view, setView] = useState<'modular' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('agent-brands-view-preference')
      return (savedView === 'table' ? 'table' : 'modular') as 'modular' | 'table'
    }
    return 'modular'
  })

  // Save view preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agent-brands-view-preference', view)
  }, [view])

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
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

  // Get all brands owned by this agent
  const brands = agent.ownedBrands || []

  // Select first brand by default or keep current selection
  const activeBrand = selectedBrand || (brands.length > 0 ? brands[0] : null)

  // Get deals for the selected brand
  const brandDeals = activeBrand?.deals || []

  // Calculate brand revenue
  const brandRevenue = brandDeals.reduce((sum: number, deal: any) => {
    return sum + (deal.Amount ? Number(deal.Amount) : 0)
  }, 0)

  // Table view
  if (view === 'table') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Owned Brands ({brands.length})
            </CardTitle>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No brands owned by this {labels.agent.toLowerCase()}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">{labels.deals}</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand: any) => {
                    const brandRevenue = (brand.deals || []).reduce((sum: number, deal: any) => {
                      return sum + (deal.Amount ? Number(deal.Amount) : 0)
                    }, 0)

                    return (
                      <TableRow
                        key={brand.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/brands/${brand.id}`)}
                      >
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell>{brand.industry || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(brand.status)} className="text-xs">
                            {brand.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(brand.type)} className="text-xs">
                            {brand.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {brand.deals?.length || 0}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(brandRevenue)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Modular view
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left: Brands List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Owned Brands ({brands.length})
            </CardTitle>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          {brands.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No brands owned by this {labels.agent.toLowerCase()}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeBrand?.id === brand.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedBrand(brand)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{brand.name}</div>
                      {brand.industry && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {brand.industry}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusVariant(brand.status)} className="text-xs">
                          {brand.status}
                        </Badge>
                        <Badge variant={getTypeVariant(brand.type)} className="text-xs">
                          {brand.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {brand.deals?.length || 0} {(brand.deals?.length || 0) === 1 ? labels.deal.toLowerCase() : labels.deals.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right: Brand Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {activeBrand ? activeBrand.name : 'Select a brand to view details'}
            </CardTitle>
            {activeBrand && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/brands/${activeBrand.id}`)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!activeBrand ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Select a brand from the list to view details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Brand Info */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge variant={getStatusVariant(activeBrand.status)}>
                    {activeBrand.status}
                  </Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Type</div>
                  <Badge variant={getTypeVariant(activeBrand.type)}>
                    {activeBrand.type}
                  </Badge>
                </div>
                {activeBrand.industry && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Industry</div>
                    <div className="text-sm font-medium">{activeBrand.industry}</div>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Briefcase className="h-4 w-4" />
                    Total {labels.deals}
                  </div>
                  <div className="text-2xl font-bold">{brandDeals.length}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(brandRevenue)}</div>
                </div>
              </div>

              {/* Deals Table */}
              {brandDeals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">{labels.deal} History</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{labels.deal} Name</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Clients</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {brandDeals.map((deal: any) => (
                          <TableRow
                            key={deal.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/deals/${deal.id}`)}
                          >
                            <TableCell className="font-medium">{deal.Name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{deal.StageName || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(deal.Amount ? Number(deal.Amount) : 0)}
                            </TableCell>
                            <TableCell>{deal.clients?.length || 0}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
