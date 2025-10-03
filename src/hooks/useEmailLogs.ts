import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export interface EmailLog {
  id: string
  subject: string
  fromEmail: string
  toEmail: string
  body: string | null
  snippet: string | null
  status: string
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

interface CreateEmailLogData {
  subject: string
  fromEmail: string
  toEmail: string
  body?: string
  snippet?: string
  status?: string
  timestamp?: string
  brandId?: string
}

interface UpdateEmailLogData {
  subject?: string
  fromEmail?: string
  toEmail?: string
  body?: string
  snippet?: string
  status?: string
  timestamp?: string
  brandId?: string
}

// Fetch email logs for a talent client
export function useTalentEmailLogs(talentId: string) {
  return useQuery({
    queryKey: ['emailLogs', talentId],
    queryFn: async () => {
      const response = await api.get(`/talents/${talentId}/email-logs`)
      return response.data.data as EmailLog[]
    },
    enabled: !!talentId
  })
}

// Create, update, delete mutations
export function useEmailLogMutations(talentId: string) {
  const queryClient = useQueryClient()

  const createEmailLogMutation = useMutation({
    mutationFn: async (emailData: CreateEmailLogData) => {
      const response = await api.post(`/talents/${talentId}/email-logs`, emailData)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailLogs', talentId] })
    }
  })

  const updateEmailLogMutation = useMutation({
    mutationFn: async ({ emailId, emailData }: { emailId: string; emailData: UpdateEmailLogData }) => {
      const response = await api.put(`/email-logs/${emailId}`, emailData)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailLogs', talentId] })
    }
  })

  const deleteEmailLogMutation = useMutation({
    mutationFn: async (emailId: string) => {
      await api.delete(`/email-logs/${emailId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emailLogs', talentId] })
    }
  })

  return {
    createEmailLog: createEmailLogMutation.mutateAsync,
    updateEmailLog: updateEmailLogMutation.mutateAsync,
    deleteEmailLog: deleteEmailLogMutation.mutateAsync,
    isCreating: createEmailLogMutation.isPending,
    isUpdating: updateEmailLogMutation.isPending,
    isDeleting: deleteEmailLogMutation.isPending,
    error: createEmailLogMutation.error || updateEmailLogMutation.error || deleteEmailLogMutation.error
  }
}
