'use client'

import { AppLayout } from '../components/layout/app-layout'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import { useLabels } from '../hooks/useLabels'
import { MyDealsCard } from '../components/dashboard/my-deals-card'
import { MyBrandsCard } from '../components/dashboard/my-brands-card'
import { MyClientsCard } from '../components/dashboard/my-clients-card'
import { ActivityCalendar } from '../components/dashboard/activity-calendar'

export default function Home() {
  const { labels } = useLabels()
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
            <p className="text-muted-foreground">
              Your personalized view of clients, deals, and activities.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New {labels.deal}
          </Button>
        </div>

        {/* Agent-Specific Metrics */}
        <div className="grid gap-6 lg:grid-cols-3">
          <MyDealsCard />
          <MyBrandsCard />
          <MyClientsCard />
        </div>

        {/* Activity Calendar */}
        <ActivityCalendar />
      </div>
    </AppLayout>
  )
}
