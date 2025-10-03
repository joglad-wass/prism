'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Briefcase, TrendingUp } from 'lucide-react'
import { useAgentStats } from '../../hooks/useAgentStats'
import { useLabels } from '../../hooks/useLabels'
import Link from 'next/link'

export function MyDealsCard() {
  const { data: stats, isLoading } = useAgentStats()
  const { labels } = useLabels()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            My {labels.deals}
          </CardTitle>
          <CardDescription>Loading your {labels.deals.toLowerCase()}...</CardDescription>
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

  const { myDeals } = stats

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          My {labels.deals}
        </CardTitle>
        <CardDescription>
          {myDeals.active} active • {myDeals.total} total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-2xl font-bold">
              {myDeals.totalValue > 0
                ? `$${(myDeals.totalValue / 1000000).toFixed(1)}M`
                : '$0'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active {labels.deals}</p>
            <p className="text-2xl font-bold">{myDeals.active}</p>
          </div>
        </div>

        {/* Recent Deals */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Recent {labels.deals}</p>
          {myDeals.recent.length > 0 ? (
            myDeals.recent.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{deal.Name}</p>
                  <p className="text-sm text-muted-foreground">
                    {deal.brand?.name || 'Unknown Brand'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {deal.Amount
                      ? `$${(deal.Amount / 1000000).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}M`
                      : 'N/A'}
                  </p>
                  <Badge
                    variant={
                      deal.Status__c === 'Won' || deal.StageName?.includes('Closed')
                        ? 'default'
                        : deal.Status__c === 'Negotiating' || deal.StageName?.includes('Negotiat')
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-xs"
                  >
                    {deal.StageName || deal.Status__c}
                  </Badge>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No {labels.deals.toLowerCase()} yet
            </div>
          )}
        </div>

        {/* View All Link */}
        {myDeals.total > 5 && (
          <Link
            href="/deals"
            className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-2"
          >
            View all {myDeals.total} {labels.deals.toLowerCase()}
            <TrendingUp className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
