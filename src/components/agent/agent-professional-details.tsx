'use client'

import { Agent } from '../../types'
import { Building, Briefcase, DollarSign } from 'lucide-react'

interface AgentProfessionalDetailsProps {
  agent: Agent
}

export function AgentProfessionalDetails({ agent }: AgentProfessionalDetailsProps) {
  const professionalDetails = [
    {
      icon: Briefcase,
      label: 'Title',
      value: agent.title,
      show: !!agent.title
    },
    {
      icon: Building,
      label: 'Company',
      value: agent.company,
      show: !!agent.company
    },
    {
      icon: Building,
      label: 'Division',
      value: agent.division,
      show: !!agent.division
    },
    {
      icon: DollarSign,
      label: 'Cost Center',
      value: agent.costCenter,
      show: !!agent.costCenter
    }
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      {professionalDetails
        .filter(detail => detail.show)
        .map((detail, index) => (
          <div
            key={index}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <detail.icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {detail.label}:
            </span>
            <span className="text-xs font-semibold">{detail.value}</span>
          </div>
        ))}
    </div>
  )
}
