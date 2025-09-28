import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AgentService } from '../services/agents'
import { Agent, AgentFilters } from '../types'

// Query Keys
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  list: (filters: AgentFilters) => [...agentKeys.lists(), filters] as const,
  details: () => [...agentKeys.all, 'detail'] as const,
  detail: (id: string) => [...agentKeys.details(), id] as const,
}

// Hooks
export function useAgents(filters: AgentFilters = {}) {
  return useQuery({
    queryKey: agentKeys.list(filters),
    queryFn: () => AgentService.getAgents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: () => AgentService.getAgent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (agent: Partial<Agent>) => AgentService.createAgent(agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, agent }: { id: string; agent: Partial<Agent> }) =>
      AgentService.updateAgent(id, agent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
      queryClient.setQueryData(agentKeys.detail(data.id), data)
    },
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AgentService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}