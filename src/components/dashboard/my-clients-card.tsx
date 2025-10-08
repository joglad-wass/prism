'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Users, TrendingUp } from 'lucide-react'
import { useAgentStats } from '../../hooks/useAgentStats'
import { useUser } from '../../contexts/user-context'
import Link from 'next/link'

type MyClientsCardProps = {
  filters?: { costCenter?: string; costCenterGroup?: string }
}

export function MyClientsCard({ filters }: MyClientsCardProps) {
  const { data: stats, isLoading } = useAgentStats(filters)
  const { user } = useUser()

  const isAdministrator = user?.userType === 'ADMINISTRATOR'
  const cardTitle = isAdministrator ? 'Clients' : 'My Clients'

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {cardTitle}
          </CardTitle>
          <CardDescription>Loading clients...</CardDescription>
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

  const { myClients } = stats

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {cardTitle}
        </CardTitle>
        <CardDescription>
          {myClients.active} active • {myClients.total} total
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-bold">{myClients.total}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{myClients.active}</p>
          </div>
        </div>

        {/* Recent Clients */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Recent Clients</p>
          {myClients.recent.length > 0 ? (
            myClients.recent.map((client) => (
              <Link
                key={client.id}
                href={`/talent/${client.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="font-medium">{client.Name}</p>
                  <p className="text-sm text-muted-foreground">
                    {client.category || client.sport || 'Talent'}
                  </p>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <Badge
                    variant={
                      client.status === 'Active'
                        ? 'default'
                        : client.status === 'Inactive'
                        ? 'outline'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {client.status}
                  </Badge>
                  {client.sport && (
                    <p className="text-xs text-muted-foreground">{client.sport}</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-4">
              No clients yet
            </div>
          )}
        </div>

        {/* View All Link */}
        {myClients.total > 5 && (
          <Link
            href="/talent"
            className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-2"
          >
            View all {myClients.total} clients
            <TrendingUp className="h-3 w-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
