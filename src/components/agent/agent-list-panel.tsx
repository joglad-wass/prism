'use client'

import { Badge } from '../ui/badge'
import { Mail, Phone, Users, Briefcase } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface AgentListPanelProps {
  agents: Array<{
    id: string
    name: string
    title?: string
    email: string
    phone?: string
    company?: string
    division?: string
    clients?: any[]
    deals?: any[]
  }>
  selectedAgentId: string | null
  onAgentClick: (agentId: string) => void
}

export function AgentListPanel({
  agents,
  selectedAgentId,
  onAgentClick,
}: AgentListPanelProps) {
  const { labels } = useLabels()
  return (
    <div className={selectedAgentId ? 'lg:col-span-1' : ''}>
      <div className={`space-y-2 ${selectedAgentId ? '' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'}`}>
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedAgentId === agent.id
                ? 'bg-primary/10 border-primary'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onAgentClick(agent.id)}
          >
            <div className="font-medium text-sm mb-1">{agent.name}</div>
            {agent.title && (
              <div className="text-xs text-muted-foreground mb-2">
                {agent.title}
              </div>
            )}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {agent.company && (
                <Badge variant="outline" className="text-xs">
                  {agent.company}
                </Badge>
              )}
              {agent.division && (
                <Badge variant="secondary" className="text-xs">
                  {agent.division}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{agent.email}</span>
              </div>
              {agent.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  {agent.phone}
                </div>
              )}
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {agent.clients?.length || 0} clients
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {agent.deals?.length || 0} {labels.deals.toLowerCase()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
