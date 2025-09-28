'use client'

import { AppLayout } from '../components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Users, Building2, Briefcase, DollarSign, TrendingUp, Plus } from 'lucide-react'
import { useTalentStats } from '../hooks/useTalents'
import { useBrandStats } from '../hooks/useBrands'

export default function Home() {
  const { data: talentStats } = useTalentStats()
  const { data: brandStats } = useBrandStats()
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to Wasserman Prism. Here's an overview of your talent management data.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Deal
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Talent Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{talentStats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Brands</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{brandStats?.totalActive || 0}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.4M</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+20%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Deals</CardTitle>
              <CardDescription>Latest deal activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nike Partnership</p>
                  <p className="text-sm text-muted-foreground">LeBron James</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$850K</p>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">MLB Sponsorship</p>
                  <p className="text-sm text-muted-foreground">Mike Trout</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$1.2M</p>
                  <Badge variant="secondary">Negotiating</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Gaming Partnership</p>
                  <p className="text-sm text-muted-foreground">Ninja</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$300K</p>
                  <Badge variant="outline">Completed</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Agents</CardTitle>
              <CardDescription>Agent performance this month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">45 active clients</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$3.2M</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +25%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mike Chen</p>
                  <p className="text-sm text-muted-foreground">32 active clients</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2.8M</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +18%
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Amanda Davis</p>
                  <p className="text-sm text-muted-foreground">28 active clients</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2.1M</p>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    +12%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
