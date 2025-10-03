'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Users, DollarSign, TrendingUp, Briefcase, ExternalLink, MapPin, X } from 'lucide-react'

interface TalentDetailsPanelProps {
  talent: {
    id: string
    Name: string
    category?: string
    status: string
    isNil?: boolean
    location?: string
    sport?: string
    team?: string
    costCenter?: string
    dealCount?: number
    totalRevenue?: number
    wassRevenue?: number
    lastActivity?: string
    agents?: {
      isPrimary: boolean
      agent: {
        name: string
      }
    }[]
  } | null
  emptyMessage: string
  formatCurrency: (amount?: number) => string
  formatDate: (dateString?: string) => string
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline'
  onClose?: () => void
}

export function TalentDetailsPanel({
  talent,
  emptyMessage,
  formatCurrency,
  formatDate,
  getStatusVariant,
  onClose,
}: TalentDetailsPanelProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {talent ? (
              <Link
                href={`/talent/${talent.id}`}
                className="hover:text-primary hover:underline"
              >
                {talent.Name}
              </Link>
            ) : (
              emptyMessage
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {talent && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/talent/${talent.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Full Profile
                  </Link>
                </Button>
                {onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!talent ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Talent Summary */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Talent Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Name</div>
                  <div className="text-sm font-medium">
                    <Link
                      href={`/talent/${talent.id}`}
                      className="hover:text-primary hover:underline"
                    >
                      {talent.Name}
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <Badge variant={getStatusVariant(talent.status)} className="text-xs">
                    {talent.status}
                  </Badge>
                </div>
                {talent.category && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Category</div>
                    <Badge variant="outline" className="text-xs">
                      {talent.category}
                    </Badge>
                  </div>
                )}
                {talent.isNil && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">NIL Status</div>
                    <Badge variant="secondary" className="text-xs">
                      NIL Eligible
                    </Badge>
                  </div>
                )}
                {talent.sport && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Sport</div>
                    <div className="text-sm font-medium">{talent.sport}</div>
                  </div>
                )}
                {talent.team && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Team</div>
                    <div className="text-sm font-medium">{talent.team}</div>
                  </div>
                )}
                {talent.location && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Location</div>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <MapPin className="h-3 w-3" />
                      {talent.location}
                    </div>
                  </div>
                )}
                {talent.costCenter && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Cost Center</div>
                    <div className="text-sm font-medium">{talent.costCenter}</div>
                  </div>
                )}
              </div>
            </div>

            {talent.agents && talent.agents.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Agents</h3>
                  <div className="space-y-2">
                    {talent.agents.map((ta, index) => (
                      <div key={index} className="text-sm">
                        {ta.agent.name}
                        {ta.isPrimary && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Revenue Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Performance</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Briefcase className="h-4 w-4" />
                    Total Deals
                  </div>
                  <div className="text-2xl font-bold">{talent.dealCount || 0}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="h-4 w-4" />
                    Total Revenue
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(talent.totalRevenue)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <TrendingUp className="h-4 w-4" />
                    Wasserman Revenue
                  </div>
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(talent.wassRevenue)}
                  </div>
                </div>
              </div>
            </div>

            {talent.lastActivity && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Activity</h3>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Last Deal Date</div>
                    <div className="text-sm font-medium">{formatDate(talent.lastActivity)}</div>
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
