'use client'

import { Agent } from '../../types'
import { DollarSign, Users, Briefcase } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface AgentSummaryBadgesProps {
  agent: Agent
}

export function AgentSummaryBadges({ agent }: AgentSummaryBadgesProps) {
  const { labels } = useLabels()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate metrics from agent data
  const clientCount = agent.clients?.length ?? 0
  const dealCount = agent.deals?.length ?? 0

  const totalRevenue = agent.deals?.reduce((sum, deal) => {
    return sum + (deal.Amount ? Number(deal.Amount) : 0)
  }, 0) ?? 0

  const metrics = [
    {
      icon: Users,
      label: 'Clients',
      value: clientCount.toString(),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      icon: Briefcase,
      label: labels.deals,
      value: dealCount.toString(),
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      value: formatCurrency(totalRevenue),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    }
  ]

  return (
    <div className="flex items-center gap-3">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${metric.bgColor} transition-all hover:scale-105`}
        >
          <metric.icon className={`h-5 w-5 ${metric.color}`} />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">
              {metric.label}
            </span>
            <span className={`text-lg font-bold ${metric.color}`}>
              {metric.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
