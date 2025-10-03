'use client'

import { AppLayout } from '../../components/layout/app-layout'
import { ProfileForm } from '../../components/profile/profile-form'

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>
        <ProfileForm />
      </div>
    </AppLayout>
  )
}
