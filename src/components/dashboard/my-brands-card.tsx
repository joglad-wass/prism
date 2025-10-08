'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Building2, TrendingUp } from 'lucide-react'
import { useAgentStats } from '../../hooks/useAgentStats'
import { useUser } from '../../contexts/user-context'
import Link from 'next/link'

type MyBrandsCardProps = {
  filters?: { costCenter?: string; costCenterGroup?: string }
}

export function MyBrandsCard({ filters }: MyBrandsCardProps) {
  const { data: stats, isLoading } = useAgentStats(filters)
  const { user } = useUser()

  const isAdministrator = user?.userType === 'ADMINISTRATOR'
  const cardTitle = isAdministrator ? 'Brands' : 'My Brands'

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {cardTitle}
          </CardTitle>
          <CardDescription>Loading brands...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return null
  }

  const { myBrands } = stats

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {cardTitle}
        </CardTitle>
        <CardDescription>
          {myBrands.active} active • {myBrands.total} total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Brands</p>
            <p className="text-2xl font-bold">{myBrands.total}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{myBrands.active}</p>
          </div>
        </div>

        {/* Recent Brands */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Recent Brands</p>
          {myBrands.recent.length > 0 ? (
            myBrands.recent.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{brand.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {brand.type?.toLowerCase().replace('_', ' ') || 'Brand'}
                  </p>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <Badge
                    variant={
                      brand.status === 'ACTIVE'
                        ? 'default'
                        : brand.status === 'PROSPECT'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-xs"
                  >
                    {brand.status}
                  </Badge>
                  {brand.dealCount !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      {brand.dealCount} {brand.dealCount === 1 ? 'deal' : 'deals'}
                    </p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No brands yet
            </div>
          )}
        </div>

        {/* View All Link */}
        {myBrands.total > 5 && (
          <Link
            href="/brands"
            className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-2"
          >
            View all {myBrands.total} brands
            <TrendingUp className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
