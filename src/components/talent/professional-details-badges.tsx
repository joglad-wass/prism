'use client'

import { Badge } from '../ui/badge'
import { useLabels } from '../../hooks/useLabels'
import { TalentDetail } from '../../types/talent'
import { Building, Users, Trophy } from 'lucide-react'

interface ProfessionalDetailsBadgesProps {
  talent: TalentDetail
}

export function ProfessionalDetailsBadges({ talent }: ProfessionalDetailsBadgesProps) {
  const { labels } = useLabels()

  // Helper functions for multi-agent support
  const formatAgentsDisplay = () => {
    if (!talent.agents || talent.agents.length === 0) {
      return `No ${labels.agent.toLowerCase()} assigned`
    }

    if (talent.agents.length === 1) {
      return talent.agents[0].agent.name
    }

    const primaryAgent = talent.agents.find(ta => ta.isPrimary)?.agent
    const otherAgents = talent.agents.filter(ta => !ta.isPrimary)

    if (primaryAgent && otherAgents.length > 0) {
      return `${primaryAgent.name} +${otherAgents.length} other${otherAgents.length > 1 ? 's' : ''}`
    }

    return talent.agents.map(ta => ta.agent.name).join(', ')
  }

  const professionalDetails = [
    {
      icon: Users,
      label: talent.agents?.length > 1 ? labels.agents : labels.agent,
      value: formatAgentsDisplay(),
      show: true
    },
    {
      icon: Building,
      label: 'Cost Center',
      value: talent.Cost_Center__c || talent.costCenter,
      show: !!(talent.Cost_Center__c || talent.costCenter)
    },
    {
      icon: Trophy,
      label: 'Sport',
      value: talent.Sport__c || talent.CSM_Sport__c || talent.sport,
      show: !!(talent.Sport__c || talent.CSM_Sport__c || talent.sport)
    },
    {
      icon: Trophy,
      label: 'Category',
      value: talent.Client_Category__c || talent.category,
      show: !!(talent.Client_Category__c || talent.category)
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
