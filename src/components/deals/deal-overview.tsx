'use client'

import { Deal } from '../../types'

interface DealOverviewProps {
  deal: Deal
}

export function DealOverview({ deal }: DealOverviewProps) {

  return (
    <div className="space-y-6">
      <div className="text-center py-12 text-muted-foreground">
        <p>All deal information has been moved to the header and other tabs.</p>
        <p className="text-sm mt-2">Future: This tab can be used for deal insights, notes, or activity feed.</p>
      </div>
    </div>
  )
}