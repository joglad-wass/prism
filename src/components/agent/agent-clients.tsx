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
import { Users, DollarSign, Briefcase, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLabels } from '../../hooks/useLabels'
import { ViewToggle } from '../talent/view-toggle'

import { Agent } from '../../types'

interface AgentClientsProps {
  agent: Agent
}

export function AgentClients({ agent }: AgentClientsProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState<any>(null)

  // Initialize view from localStorage
  const [view, setView] = useState<'modular' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('agent-clients-view-preference')
      return (savedView === 'table' ? 'table' : 'modular') as 'modular' | 'table'
    }
    return 'modular'
  })

  // Save view preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agent-clients-view-preference', view)
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

  // Get all talent clients
  const clients = agent.clients || []

  // Select first client by default or keep current selection
  const activeClient = selectedClient || (clients.length > 0 ? clients[0] : null)

  // Get deals for the selected client
  const clientDeals = activeClient?.deals || []

  // Calculate client revenue
  const clientRevenue = clientDeals.reduce((sum: number, deal: any) => {
    return sum + (deal.Amount ? Number(deal.Amount) : 0)
  }, 0)

  // Table view
  if (view === 'table') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Clients ({clients.length})
            </CardTitle>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No clients assigned to this {labels.agent.toLowerCase()}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sport</TableHead>
                    <TableHead className="text-right">{labels.deals}</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client: any) => {
                    const clientRevenue = (client.deals || []).reduce((sum: number, deal: any) => {
                      return sum + (deal.Amount ? Number(deal.Amount) : 0)
                    }, 0)

                    return (
                      <TableRow
                        key={client.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => router.push(`/talent/${client.id}`)}
                      >
                        <TableCell className="font-medium">{client.Name}</TableCell>
                        <TableCell>
                          {client.Client_Category__c || client.category || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                            {client.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {client.Sport__c || client.sport || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {client.deals?.length || 0}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(clientRevenue)}
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
      {/* Left: Clients List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Talent Clients ({clients.length})
            </CardTitle>
            <ViewToggle view={view} onViewChange={setView} />
          </div>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No clients assigned to this {labels.agent.toLowerCase()}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    activeClient?.id === client.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{client.Name}</div>
                      {(client.Client_Category__c || client.category) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {client.Client_Category__c || client.category}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={client.status === 'ACTIVE' ? 'default' : 'secondary'} className="text-xs">
                          {client.status}
                        </Badge>
                        {client.isNil && (
                          <Badge variant="outline" className="text-xs">
                            NIL
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {client.deals?.length || 0} {(client.deals?.length || 0) === 1 ? labels.deal.toLowerCase() : labels.deals.toLowerCase()}
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

      {/* Right: Client Details */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {activeClient ? `${activeClient.Name}` : 'Select a client to view details'}
            </CardTitle>
            {activeClient && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/talents/${activeClient.id}`)}
              >
                <UserIcon className="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!activeClient ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Select a client from the list to view their details</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Client Info */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge variant={activeClient.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {activeClient.status}
                  </Badge>
                </div>
                {activeClient.sport && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Sport</div>
                    <div className="text-sm font-medium">{activeClient.sport}</div>
                  </div>
                )}
                {activeClient.location && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="text-sm font-medium">{activeClient.location}</div>
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
                  <div className="text-2xl font-bold">{clientDeals.length}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(clientRevenue)}</div>
                </div>
              </div>

              {/* Deals Table */}
              {clientDeals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">{labels.deal} History</h3>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{labels.deal} Name</TableHead>
                          <TableHead>Brand</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clientDeals.map((deal: any) => (
                          <TableRow
                            key={deal.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => router.push(`/deals/${deal.id}`)}
                          >
                            <TableCell className="font-medium">{deal.Name}</TableCell>
                            <TableCell>{deal.brand?.name || 'N/A'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{deal.StageName || 'N/A'}</Badge>
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(deal.Amount ? Number(deal.Amount) : 0)}
                            </TableCell>
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
