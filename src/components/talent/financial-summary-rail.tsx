'use client'

import { TalentDetail } from '../../types/talent'
import { DollarSign, TrendingUp, Briefcase } from 'lucide-react'
import { useLabels } from '../../hooks/useLabels'

interface FinancialSummaryRailProps {
  talent: TalentDetail
}

export function FinancialSummaryRail({ talent }: FinancialSummaryRailProps) {
  const { labels } = useLabels()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const metrics = [
    {
      icon: Briefcase,
      label: labels.deals,
      value: talent.dealCount?.toString() || '0',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      icon: DollarSign,
      label: 'Revenue',
      value: formatCurrency(talent.totalRevenue || 0),
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      icon: TrendingUp,
      label: 'Commission',
      value: formatCurrency(talent.wassRevenue || 0),
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30'
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
