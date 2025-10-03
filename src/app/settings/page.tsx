'use client'

import { AppLayout } from '../../components/layout/app-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Settings, Users, UserCog } from 'lucide-react'
import { CostCenterGroupManager } from '../../components/settings/cost-center-group-manager'
import { UserManager } from '../../components/settings/user-manager'
import { useUser } from '../../contexts/user-context'

export default function SettingsPage() {
  const { user } = useUser()

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

        {/* User Management - Admin Only */}
        {user?.userType === 'ADMINISTRATOR' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and cost center assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManager />
            </CardContent>
          </Card>
        )}

        {/* Cost Center Groups */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Cost Center Groups
            </CardTitle>
            <CardDescription>
              {user?.userType === 'ADMINISTRATOR'
                ? 'Drag and drop cost centers to organize them into groups'
                : 'View cost center group organization'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CostCenterGroupManager readOnly={user?.userType !== 'ADMINISTRATOR'} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
