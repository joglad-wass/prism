'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { AgentService } from '../../services/agents'
import { useDeleteAgent, useUpdateAgent } from '../../hooks/useAgents'
import { useRouter } from 'next/navigation'
import { useLabels } from '../../hooks/useLabels'

interface DeleteAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  agentName: string
}

export function DeleteAgentDialog({
  open,
  onOpenChange,
  agentId,
  agentName
}: DeleteAgentDialogProps) {
  const router = useRouter()
  const { labels } = useLabels()
  const [loading, setLoading] = useState(false)
  const [associations, setAssociations] = useState<{ hasAssociations: boolean; dealCount: number; brandCount: number; clientCount: number } | null>(null)
  const [fetchingAssociations, setFetchingAssociations] = useState(true)

  const deleteAgentMutation = useDeleteAgent()
  const updateAgentMutation = useUpdateAgent()

  useEffect(() => {
    if (open && agentId) {
      fetchAssociations()
    }
  }, [open, agentId])

  const fetchAssociations = async () => {
    try {
      setFetchingAssociations(true)
      const data = await AgentService.getAgentAssociations(agentId)
      setAssociations(data)
    } catch (error) {
      console.error('Error fetching agent associations:', error)
      toast.error(`Failed to check ${labels.agent.toLowerCase()} associations`)
      onOpenChange(false)
    } finally {
      setFetchingAssociations(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteAgentMutation.mutateAsync(agentId)
      toast.success(`${labels.agent} deleted successfully`)
      onOpenChange(false)
      router.push('/agents')
    } catch (error) {
      console.error('Error deleting agent:', error)
      toast.error(`Failed to delete ${labels.agent.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInactivate = async () => {
    setLoading(true)
    try {
      await updateAgentMutation.mutateAsync({
        id: agentId,
        agent: { status: 'INACTIVE' }
      })
      toast.success(`${labels.agent} inactivated successfully`)
      onOpenChange(false)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error inactivating agent:', error)
      toast.error(`Failed to inactivate ${labels.agent.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingAssociations) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Checking Agent Associations</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const totalAssociations = (associations?.dealCount || 0) + (associations?.brandCount || 0) + (associations?.clientCount || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {associations?.hasAssociations ? `Cannot Delete ${labels.agent}` : `Delete ${labels.agent}`}
          </DialogTitle>
          <DialogDescription>
            {associations?.hasAssociations
              ? `This agent has ${totalAssociations} association${totalAssociations !== 1 ? 's' : ''}.`
              : 'This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {associations?.hasAssociations ? (
              <>
                <strong className="text-foreground">{agentName}</strong> cannot be permanently deleted because they have:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {associations.dealCount > 0 && (
                    <li><strong>{associations.dealCount}</strong> associated deal{associations.dealCount !== 1 ? 's' : ''}</li>
                  )}
                  {associations.brandCount > 0 && (
                    <li><strong>{associations.brandCount}</strong> owned brand{associations.brandCount !== 1 ? 's' : ''}</li>
                  )}
                  {associations.clientCount > 0 && (
                    <li><strong>{associations.clientCount}</strong> client relationship{associations.clientCount !== 1 ? 's' : ''}</li>
                  )}
                </ul>
                <p className="mt-3">
                  You can inactivate the {labels.agent.toLowerCase()} instead, which will mark them as inactive but preserve all historical data.
                </p>
              </>
            ) : (
              <>
                Are you sure you want to permanently delete <strong className="text-foreground">{agentName}</strong>?
                This will remove the agent and all associated data from the database.
              </>
            )}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          {associations?.hasAssociations ? (
            <Button
              type="button"
              variant="default"
              onClick={handleInactivate}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Inactivate {labels.agent}
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Permanently
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
