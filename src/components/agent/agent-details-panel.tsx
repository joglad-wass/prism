'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { useLabels } from '../../hooks/useLabels'
import { UserCheck, Mail, Phone, Building2, Users, Briefcase, Award, X, DollarSign } from 'lucide-react'

interface AgentDetailsPanelProps {
  agent: {
    id: string
    name: string
    title?: string
    email: string
    phone?: string
    company?: string
    division?: string
    clients?: any[]
    deals?: any[]
    ownedBrands?: any[]
  } | null
  emptyMessage: string
  onClose?: () => void
}

export function AgentDetailsPanel({
  agent,
  emptyMessage,
  onClose,
}: AgentDetailsPanelProps) {
  const { labels } = useLabels()
  const router = useRouter()

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {agent ? (
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {agent.name}
              </div>
            ) : (
              emptyMessage
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {agent && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!agent ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Agent Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                {labels.agent} Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Name</div>
                  <div className="text-sm font-medium">{agent.name}</div>
                </div>
                {agent.title && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Title</div>
                    <div className="text-sm font-medium">{agent.title}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Email</div>
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${agent.email}`} className="hover:text-primary hover:underline truncate">
                      {agent.email}
                    </a>
                  </div>
                </div>
                {agent.phone && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Phone</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Phone className="h-3 w-3" />
                      <a href={`tel:${agent.phone}`} className="hover:text-primary hover:underline">
                        {agent.phone}
                      </a>
                    </div>
                  </div>
                )}
                {agent.company && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Company</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Building2 className="h-3 w-3" />
                      {agent.company}
                    </div>
                  </div>
                )}
                {agent.division && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Division</div>
                    <Badge variant="secondary" className="text-xs">
                      {agent.division}
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Performance Metrics */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Performance Metrics</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Users className="h-4 w-4" />
                    Talent Clients
                  </div>
                  <div className="text-2xl font-bold">{agent.clients?.length || 0}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Briefcase className="h-4 w-4" />
                    Active {labels.deals}
                  </div>
                  <div className="text-2xl font-bold">{agent.deals?.length || 0}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Award className="h-4 w-4" />
                    Brands Owned
                  </div>
                  <div className="text-2xl font-bold">{agent.ownedBrands?.length || 0}</div>
                </div>
              </div>
            </div>

            {/* Top Clients */}
            {agent.clients && agent.clients.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Top Clients</h3>
                  <div className="space-y-2">
                    {agent.clients.slice(0, 5).map((client: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          if (client.talentClient?.id) {
                            router.push(`/talent/${client.talentClient.id}`)
                          }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{client.talentClient?.Name || 'Unknown Client'}</span>
                        </div>
                        {client.isPrimary && (
                          <Badge variant="outline" className="text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                    {agent.clients.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center pt-2">
                        +{agent.clients.length - 5} more clients
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Active Deals */}
            {agent.deals && agent.deals.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Active {labels.deals}</h3>
                  <div className="space-y-2">
                    {agent.deals.slice(0, 5).map((deal: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          if (deal.id) {
                            router.push(`/deals/${deal.id}`)
                          }
                        }}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium text-sm">{deal.Name || 'Unnamed Deal'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {deal.StageName && (
                              <Badge variant="secondary" className="text-xs">
                                {deal.StageName}
                              </Badge>
                            )}
                            {deal.Amount && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(deal.Amount)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {agent.deals.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center pt-2">
                        +{agent.deals.length - 5} more {labels.deals.toLowerCase()}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
