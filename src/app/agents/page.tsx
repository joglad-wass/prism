'use client'

import { useState } from 'react'
import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { useAgents } from '../../hooks/useAgents'
import { AgentFilters } from '../../types'
import { Search, Plus, UserCheck, Users, Mail, Phone, Award } from 'lucide-react'

export default function AgentsPage() {
  const [filters, setFilters] = useState<AgentFilters>({
    limit: 50,
    page: 1,
  })

  const { data: agentsResponse, isLoading, error } = useAgents(filters)

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value || undefined, page: 1 })
  }

  const handleCompanyChange = (value: string) => {
    setFilters({
      ...filters,
      company: value === 'all' ? undefined : value,
      page: 1
    })
  }

  const handleDivisionChange = (value: string) => {
    setFilters({
      ...filters,
      division: value === 'all' ? undefined : value,
      page: 1
    })
  }

  // Get unique companies and divisions for filters
  const companies = [...new Set(agentsResponse?.data.map(agent => agent.company).filter(Boolean))] || []
  const divisions = [...new Set(agentsResponse?.data.map(agent => agent.division).filter(Boolean))] || []

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading Agents</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Could not connect to the API. Make sure the backend server is running on http://localhost:3001
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
            <p className="text-muted-foreground">
              Manage your team performance and client portfolios
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Agent
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agentsResponse?.meta.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agentsResponse?.meta?.clientMetrics?.uniqueClients || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Unique talent clients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Clients per Agent</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agentsResponse?.meta?.clientMetrics?.avgClientsPerAgent || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Average workload
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agentsResponse?.data.reduce((acc, agent) => acc + (agent.deals?.length || 0), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total deals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter and search through your agent roster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search agents..."
                    className="pl-8"
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Company Filter */}
              <Select onValueChange={handleCompanyChange} defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Division Filter */}
              <Select onValueChange={handleDivisionChange} defaultValue="all">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Division" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Divisions</SelectItem>
                  {divisions.map((division) => (
                    <SelectItem key={division} value={division}>
                      {division}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        {agentsResponse?.data && agentsResponse.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                Agents with the most clients and deals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {agentsResponse.data
                  .sort((a, b) => (b.clients?.length || 0) - (a.clients?.length || 0))
                  .slice(0, 3)
                  .map((agent, index) => (
                    <Card key={agent.id} className="relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant={index === 0 ? "default" : "secondary"}>
                              #{index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{agent.name}</p>
                              <p className="text-sm text-muted-foreground">{agent.title}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Clients</p>
                            <p className="font-medium">{agent.clients?.length || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Deals</p>
                            <p className="font-medium">{agent.deals?.length || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Directory</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `Showing ${agentsResponse?.data.length || 0} of ${agentsResponse?.meta.total || 0} agents`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead>Clients</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Brands Owned</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Loading agents...
                      </TableCell>
                    </TableRow>
                  ) : agentsResponse?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No agents found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    agentsResponse?.data.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{agent.name}</div>
                            {agent.title && (
                              <div className="text-sm text-muted-foreground">
                                {agent.title}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {agent.email}
                            </div>
                            {agent.phone && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                {agent.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {agent.company || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {agent.division || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {agent.clients?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {agent.deals?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {agent.ownedBrands?.length || 0}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination info */}
        {agentsResponse && agentsResponse.meta.total > 0 && (
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>
              Page {agentsResponse.meta.page} of {agentsResponse.meta.totalPages}
            </span>
          </div>
        )}
      </div>
    </AppLayout>
  )
}