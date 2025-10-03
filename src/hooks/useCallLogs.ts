import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export interface CallLog {
  id: string
  subject: string
  callType: string
  duration: number | null
  notes: string | null
  outcome: string | null
  timestamp: string
  createdAt: string
  updatedAt: string
  talentClientId: string | null
  brandId: string | null
  brand?: {
    id: string
    name: string
  } | null
}

interface CreateCallLogData {
  subject: string
  callType?: string
  duration?: number
  notes?: string
  outcome?: string
  timestamp?: string
  brandId?: string
}

interface UpdateCallLogData {
  subject?: string
  callType?: string
  duration?: number
  notes?: string
  outcome?: string
  timestamp?: string
  brandId?: string
}

// Fetch call logs for a talent client
export function useTalentCallLogs(talentId: string) {
  return useQuery({
    queryKey: ['callLogs', talentId],
    queryFn: async () => {
      const response = await api.get(`/talents/${talentId}/call-logs`)
      return response.data.data as CallLog[]
    },
    enabled: !!talentId
  })
}

// Create, update, delete mutations
export function useCallLogMutations(talentId: string) {
  const queryClient = useQueryClient()

  const createCallLogMutation = useMutation({
    mutationFn: async (callData: CreateCallLogData) => {
      const response = await api.post(`/talents/${talentId}/call-logs`, callData)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callLogs', talentId] })
    }
  })

  const updateCallLogMutation = useMutation({
    mutationFn: async ({ callId, callData }: { callId: string; callData: UpdateCallLogData }) => {
      const response = await api.put(`/call-logs/${callId}`, callData)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callLogs', talentId] })
    }
  })

  const deleteCallLogMutation = useMutation({
    mutationFn: async (callId: string) => {
      await api.delete(`/call-logs/${callId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callLogs', talentId] })
    }
  })

  return {
    createCallLog: createCallLogMutation.mutateAsync,
    updateCallLog: updateCallLogMutation.mutateAsync,
    deleteCallLog: deleteCallLogMutation.mutateAsync,
    isCreating: createCallLogMutation.isPending,
    isUpdating: updateCallLogMutation.isPending,
    isDeleting: deleteCallLogMutation.isPending,
    error: createCallLogMutation.error || updateCallLogMutation.error || deleteCallLogMutation.error
  }
}
