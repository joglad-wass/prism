import { useQuery } from '@tanstack/react-query'
import { AgentStats } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

type AgentStatsFilters = {
  costCenter?: string
  costCenterGroup?: string
}

// Query Keys
export const agentStatsKeys = {
  all: ['agentStats'] as const,
  me: (filters?: AgentStatsFilters) => [...agentStatsKeys.all, 'me', filters] as const,
}

// Fetch agent stats for logged-in user
async function fetchAgentStats(filters?: AgentStatsFilters): Promise<AgentStats> {
  const params = new URLSearchParams()

  if (filters?.costCenter) {
    params.append('costCenter', filters.costCenter)
  }
  if (filters?.costCenterGroup) {
    params.append('costCenterGroup', filters.costCenterGroup)
  }

  const url = `${API_BASE_URL}/api/agents/me/stats${params.toString() ? `?${params.toString()}` : ''}`

  // Get user ID from localStorage
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('prism-active-user-id') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (userId) {
    headers['x-user-id'] = userId
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error('Failed to fetch agent stats')
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch agent stats')
  }

  return result.data
}

// Hook to get agent stats
export function useAgentStats(filters?: AgentStatsFilters) {
  return useQuery({
    queryKey: agentStatsKeys.me(filters),
    queryFn: () => fetchAgentStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
