'use client'

import { AppLayout } from '../../components/layout/app-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Settings, Users } from 'lucide-react'
import { CostCenterGroupManager } from '../../components/settings/cost-center-group-manager'

export default function SettingsPage() {

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage cost center groups and application settings
            </p>
          </div>
        </div>

        {/* Cost Center Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cost Center Groups
            </CardTitle>
            <CardDescription>
              Drag and drop cost centers to organize them into groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CostCenterGroupManager />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
