'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import { AppLayout } from '../../components/layout/app-layout'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip'
import { useAgents } from '../../hooks/useAgents'
import { AgentFilters } from '../../types'
import { useFilter } from '../../contexts/filter-context'
import { AgentListPanel } from '../../components/agent/agent-list-panel'
import { AgentDetailsPanel } from '../../components/agent/agent-details-panel'
import { AgentTableView } from '../../components/agent/agent-table-view'
import { CreateAgentDialog } from '../../components/agent/create-agent-dialog'
import { ViewToggle } from '../../components/talent/view-toggle'
import { useLabels } from '../../hooks/useLabels'
import { Search, Plus, UserCheck, Users, Award, Loader2 } from 'lucide-react'

// MANUAL FLAG: Set to true to disable agent creation
const DISABLE_AGENT_CREATION = true

export default function AgentsPage() {
  const { labels } = useLabels()
  const { filterSelection } = useFilter()
  const [filters, setFilters] = useState<AgentFilters>({
    limit: 50,
    page: 1,
  })
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Initialize view from localStorage
  const [view, setView] = useState<'modular' | 'table'>(() => {
    if (typeof window !== 'undefined') {
      const savedView = localStorage.getItem('agent-view-preference')
      return (savedView === 'table' ? 'table' : 'modular') as 'modular' | 'table'
    }
    return 'modular'
  })

  const [panelTopPosition, setPanelTopPosition] = useState<number>(0)
  const detailsPanelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const agentListRef = useRef<HTMLDivElement>(null)

  // Save view preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('agent-view-preference', view)
  }, [view])

  const { data: agentsResponse, isLoading, error } = useAgents(filters)

  // Update filters when filter selection changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      costCenter: filterSelection.type === 'individual' ? filterSelection.value || undefined : undefined,
      costCenterGroup: filterSelection.type === 'group' ? filterSelection.value || undefined : undefined,
      page: 1
    }))
  }, [filterSelection])

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

  const handleAgentClick = (agentId: string) => {
    // Calculate where to position the detail panel based on current scroll
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const viewportHeight = window.innerHeight

      // Position the panel to align with the current viewport center
      const idealTop = scrollTop + (viewportHeight / 2) - containerRect.top - 200
      setPanelTopPosition(Math.max(0, idealTop))
    }

    setSelectedAgentId(agentId)
  }

  // Handle click outside to close detail panel (but allow clicking other agent cards)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectedAgentId &&
        detailsPanelRef.current &&
        agentListRef.current &&
        !detailsPanelRef.current.contains(event.target as Node) &&
        !agentListRef.current.contains(event.target as Node)
      ) {
        setSelectedAgentId(null)
      }
    }

    if (selectedAgentId) {
      // Add a small delay to avoid closing immediately after opening
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 100)

      return () => {
        clearTimeout(timeoutId)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [selectedAgentId])

  // Get selected agent from the agents array
  const selectedAgent = agentsResponse?.data.find(a => a.id === selectedAgentId) || null

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading {labels.agents}</h2>
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
            <h1 className="text-2xl font-bold tracking-tight">{labels.agents}</h1>
            <p className="text-muted-foreground">
              Manage your team performance and client portfolios
            </p>
          </div>
          {DISABLE_AGENT_CREATION ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button disabled className="pointer-events-none">
                      <Plus className="mr-2 h-4 w-4" />
                      Add {labels.agent}
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>You do not have permission to create {labels.agents.toLowerCase()}.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add {labels.agent}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total {labels.agents}</CardTitle>
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
              <CardTitle className="text-sm font-medium">Average Clients per {labels.agent}</CardTitle>
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
              <CardTitle className="text-sm font-medium">Active {labels.deals}</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {agentsResponse?.data.reduce((acc, agent) => acc + (agent.deals?.length || 0), 0) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Total {labels.deals.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter and search through your {labels.agent.toLowerCase()} roster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${labels.agents.toLowerCase()}...`}
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

        {/* Top Performers
        {agentsResponse?.data && agentsResponse.data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>
                {labels.agents} with the most clients and {labels.deals.toLowerCase()}
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
                            <p className="text-muted-foreground">{labels.deals}</p>
                            <p className="font-medium">{agent.deals?.length || 0}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Agent Directory - Panel Layout */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{labels.agent} Directory</CardTitle>
                <CardDescription>
                  {isLoading ? 'Loading...' : `Showing ${agentsResponse?.data.length || 0} of ${agentsResponse?.meta.total || 0} ${labels.agents.toLowerCase()}`}
                </CardDescription>
              </div>
              <ViewToggle view={view} onViewChange={setView} />
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              if (isLoading) {
                return (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Loading {labels.agents.toLowerCase()}...</p>
                  </div>
                )
              }

              if (!agentsResponse || agentsResponse.data.length === 0) {
                return (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No {labels.agents.toLowerCase()} found matching your criteria</p>
                  </div>
                )
              }

              if (view === 'table') {
                return (
                  <AgentTableView
                    agents={agentsResponse.data}
                  />
                )
              }

              return (
                <div ref={containerRef} className="relative">
                  <div className={`transition-all duration-300 ${selectedAgentId ? 'lg:grid lg:grid-cols-3 gap-6' : ''}`}>
                    <div ref={agentListRef}>
                      <AgentListPanel
                        agents={agentsResponse.data}
                        selectedAgentId={selectedAgentId}
                        onAgentClick={handleAgentClick}
                      />
                    </div>

                    {selectedAgentId && (
                      <div
                        ref={detailsPanelRef}
                        className="lg:col-span-2 animate-in slide-in-from-right duration-300"
                        style={{
                          position: selectedAgentId ? 'sticky' : 'static',
                          top: '1rem',
                          alignSelf: 'flex-start'
                        }}
                      >
                        <AgentDetailsPanel
                          agent={selectedAgent}
                          emptyMessage={`Select an ${labels.agent.toLowerCase()} to view details`}
                          onClose={() => setSelectedAgentId(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
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

      {/* Create Agent Dialog */}
      <CreateAgentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </AppLayout>
  )
}