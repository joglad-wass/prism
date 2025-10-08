'use client'

import { useEffect, useState } from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Separator } from '../ui/separator'
import { UserCheck, Mail, Phone, Building, Users, Briefcase, Award } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'
import { useRouter } from 'next/navigation'

export interface AgentQuickViewData {
  id: string
  name: string
  title?: string
  email: string
  phone?: string
  company?: string
  division?: string
  costCenter?: string
  clientCount?: number
  dealCount?: number
  totalRevenue?: number
}

interface AgentQuickViewProps {
  agent: AgentQuickViewData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewProfile?: (agentId: string) => void
}

export function AgentQuickView({ agent, open, onOpenChange, onViewProfile }: AgentQuickViewProps) {
  const { labels } = useLabels()
  const router = useRouter()

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (!agent) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div>Loading...</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            {agent.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          {agent.title ? (
            <div className="text-sm text-muted-foreground">
              {agent.title}
            </div>
          ) : null}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{agent.email}</span>
            </div>

            {agent.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{agent.phone}</span>
              </div>
            ) : null}
          </div>

          <Separator />

          {/* Organization Details */}
          <div className="space-y-3">
            {agent.company ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Company</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {agent.company}
                </Badge>
              </div>
            ) : null}

            {agent.division ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Division</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {agent.division}
                </Badge>
              </div>
            ) : null}

            {agent.costCenter ? (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cost Center</span>
                <span className="text-sm text-muted-foreground">{agent.costCenter}</span>
              </div>
            ) : null}
          </div>

          <Separator />

          {/* Performance Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Clients</span>
              </div>
              <span className="text-sm font-semibold">{agent.clientCount || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{labels.deals}</span>
              </div>
              <span className="text-sm font-semibold">{agent.dealCount || 0}</span>
            </div>

            {agent.totalRevenue !== undefined ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Revenue</span>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(agent.totalRevenue)}</span>
              </div>
            ) : null}
          </div>

          <Separator />

          {/* Actions */}
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                if (onViewProfile) {
                  onViewProfile(agent.id)
                } else {
                  router.push(`/agents/${agent.id}`)
                }
                onOpenChange(false)
              }}
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
