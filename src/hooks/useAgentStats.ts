import { useQuery } from '@tanstack/react-query'
import { AgentStats } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// Query Keys
export const agentStatsKeys = {
  all: ['agentStats'] as const,
  me: () => [...agentStatsKeys.all, 'me'] as const,
}

// Fetch agent stats for logged-in user
async function fetchAgentStats(): Promise<AgentStats> {
  const url = `${API_BASE_URL}/api/agents/me/stats`

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
export function useAgentStats() {
  return useQuery({
    queryKey: agentStatsKeys.me(),
    queryFn: fetchAgentStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
