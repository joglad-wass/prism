'use client'

import { AppLayout } from '../components/layout/app-layout'
import { Button } from '../components/ui/button'
import { Plus } from 'lucide-react'
import { useLabels } from '../hooks/useLabels'
import { useUser } from '../contexts/user-context'
import { useFilter } from '../contexts/filter-context'
import { MyDealsCard } from '../components/dashboard/my-deals-card'
import { MyBrandsCard } from '../components/dashboard/my-brands-card'
import { MyClientsCard } from '../components/dashboard/my-clients-card'
import { ActivityCalendar } from '../components/dashboard/activity-calendar'
import { useMemo } from 'react'

export default function Home() {
  const { labels } = useLabels()
  const { user } = useUser()
  const { filterSelection } = useFilter()

  const isAdministrator = user?.userType === 'ADMINISTRATOR'

  // Build filter for stats API based on filter selection
  const statsFilters = useMemo(() => {
    const filters: { costCenter?: string; costCenterGroup?: string } = {}

    if (filterSelection.type === 'individual' && filterSelection.value) {
      filters.costCenter = filterSelection.value
    } else if (filterSelection.type === 'group' && filterSelection.value) {
      filters.costCenterGroup = filterSelection.value
    }

    return filters
  }, [filterSelection])

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAdministrator ? 'Dashboard' : 'My Dashboard'}
            </h1>
            <p className="text-muted-foreground">
              {isAdministrator
                ? 'Overview of all clients, deals, and activities.'
                : 'Your personalized view of clients, deals, and activities.'}
            </p>
          </div>
          {/* <Button>
            <Plus className="mr-2 h-4 w-4" />
            New {labels.deal}
          </Button> */}
        </div>

        {/* Metrics */}
        <div className="grid gap-6 lg:grid-cols-3">
          <MyDealsCard filters={statsFilters} />
          <MyBrandsCard filters={statsFilters} />
          <MyClientsCard filters={statsFilters} />
        </div>

        {/* Activity Calendar */}
        <ActivityCalendar />
      </div>
    </AppLayout>
  )
}
