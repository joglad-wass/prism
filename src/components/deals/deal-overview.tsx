'use client'

import { Deal } from '../../types'
import { DealActivityFeed } from './deal-activity-feed'

interface DealOverviewProps {
  deal: Deal
}

export function DealOverview({ deal }: DealOverviewProps) {
  return (
    <div className="space-y-6">
      <DealActivityFeed deal={deal} />
    </div>
  )
}