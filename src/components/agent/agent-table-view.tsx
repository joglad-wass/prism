'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { AgentQuickView, AgentQuickViewData } from './agent-quick-view'
import { ExternalLink, Mail, Phone, Users, Briefcase } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface AgentTableViewProps {
  agents: Array<{
    id: string
    name: string
    title?: string
    email: string
    phone?: string
    company?: string
    division?: string
    costCenter?: string
    clients?: any[]
    deals?: any[]
  }>
}

export function AgentTableView({ agents }: AgentTableViewProps) {
  const { labels } = useLabels()
  const router = useRouter()
  const [quickViewAgent, setQuickViewAgent] = useState<AgentQuickViewData | null>(null)
  const [quickViewOpen, setQuickViewOpen] = useState(false)

  const handleRowClick = (agent: any) => {
    setQuickViewAgent({
      id: agent.id,
      name: agent.name,
      title: agent.title,
      email: agent.email,
      phone: agent.phone,
      company: agent.company,
      division: agent.division,
      costCenter: agent.costCenter,
      clientCount: agent.clients?.length || 0,
      dealCount: agent.deals?.length || 0,
    })
    setQuickViewOpen(true)
  }

  const handleViewProfile = (agentId: string) => {
    router.push(`/agents/${agentId}`)
  }

  return (
    <>
      <div className="relative w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Division</TableHead>
              <TableHead>Cost Center</TableHead>
              <TableHead className="text-right">Clients</TableHead>
              <TableHead className="text-right">{labels.deals}</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow
                key={agent.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(agent)}
              >
                <TableCell className="font-medium">
                  {agent.name}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {agent.title || '-'}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {agent.email}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {agent.phone ? (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {agent.phone}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {agent.company ? (
                    <Badge variant="outline" className="text-xs">
                      {agent.company}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {agent.division ? (
                    <Badge variant="secondary" className="text-xs">
                      {agent.division}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {agent.costCenter || '-'}
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    {agent.clients?.length || 0}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                    {agent.deals?.length || 0}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewProfile(agent.id)
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AgentQuickView
        agent={quickViewAgent}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
        onViewProfile={handleViewProfile}
      />
    </>
  )
}
