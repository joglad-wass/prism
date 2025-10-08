'use client'

import { Brand } from '../../types'
import { DollarSign, Users, Briefcase } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface BrandSummaryBadgesProps {
  brand: Brand
}

export function BrandSummaryBadges({ brand }: BrandSummaryBadgesProps) {
  const { labels } = useLabels()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate metrics from brand data
  const dealCount = brand.deals?.length ?? 0

  // Get unique talent count from deals
  const uniqueTalentIds = new Set(
    brand.deals?.flatMap(deal =>
      deal.clients?.map(client => client.clientId) ?? []
    ) ?? []
  )
  const talentCount = uniqueTalentIds.size

  const totalRevenue = brand.deals?.reduce((sum, deal) => {
    return sum + (deal.Amount ? Number(deal.Amount) : 0)
  }, 0) ?? 0

  const metrics = [
    {
      icon: Briefcase,
      label: labels.deals,
      value: dealCount.toString(),
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    },
    {
      icon: Users,
      label: 'Talent',
      value: talentCount.toString(),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      icon: DollarSign,
      label: 'Total Revenue',
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
