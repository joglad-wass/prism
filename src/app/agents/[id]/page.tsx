'use client'

import { useState, use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '../../../components/layout/app-layout'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { AgentCalendar } from '../../../components/agent/agent-calendar'
import { AgentContact } from '../../../components/agent/agent-contact'
import { AgentClients } from '../../../components/agent/agent-clients'
import { AgentDeals } from '../../../components/agent/agent-deals'
import { AgentBrands } from '../../../components/agent/agent-brands'
import { AgentNotes } from '../../../components/agent/agent-notes'
import { AgentSummaryBadges } from '../../../components/agent/agent-summary-badges'
import { AgentProfessionalDetails } from '../../../components/agent/agent-professional-details'
import { DeleteAgentDialog } from '../../../components/agent/delete-agent-dialog'
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Trash2,
} from 'lucide-react'
import { AgentService } from '../../../services/agents'
import { Agent } from '../../../types'
import { useLabels } from '../../../hooks/useLabels'
import { useUser } from '../../../contexts/user-context'

interface AgentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { labels } = useLabels()
  const { user } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('calendar')
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { id } = use(params)

  const isAdmin = user?.userType === 'ADMINISTRATOR'

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true)
        setError(null)
        const agentData = await AgentService.getAgent(id)
        setAgent(agentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agent')
        console.error('Error fetching agent:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAgent()
    }
  }, [id])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading {labels.agent.toLowerCase()} details...</span>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-red-600">Error Loading {labels.agent}</h2>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
            <div className="flex gap-2 mt-4 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!agent) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-lg font-semibold">{labels.agent} Not Found</h2>
            <p className="text-sm text-muted-foreground mt-2">The {labels.agent.toLowerCase()} you're looking for doesn't exist.</p>
            <Button variant="outline" onClick={() => router.back()} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="h-9 px-3 hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Agent Info Header - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
          {/* Left Side - Agent Information */}
          <div className="space-y-3">
            {/* Name and Email */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                {agent.email && (
                  <span className="text-sm text-muted-foreground">
                    {agent.email}
                  </span>
                )}
                {agent.phone && (
                  <span className="text-sm text-muted-foreground">
                    | {agent.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Professional Details Badges */}
            <AgentProfessionalDetails agent={agent} />
          </div>

          {/* Right Side - Summary Badges */}
          <AgentSummaryBadges agent={agent} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="deals">{labels.deals}</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <AgentCalendar agent={agent} />
          </TabsContent>

          <TabsContent value="clients">
            <AgentClients agent={agent} />
          </TabsContent>

          <TabsContent value="contact">
            <AgentContact agent={agent} />
          </TabsContent>

          <TabsContent value="deals">
            <AgentDeals agent={agent} />
          </TabsContent>

          <TabsContent value="brands">
            <AgentBrands agent={agent} />
          </TabsContent>

          <TabsContent value="notes">
            <AgentNotes agent={agent} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Agent Dialog */}
      <DeleteAgentDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        agentId={agent.id}
        agentName={agent.name}
      />
    </AppLayout>
  )
}
