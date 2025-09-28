import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

interface CreateNoteData {
  title: string
  content: string
  category: string
  status: string
  talentClientId?: string
  authorId?: string
}

export function useNotes() {
  const queryClient = useQueryClient()

  const createNoteMutation = useMutation({
    mutationFn: async ({ dealId, noteData }: { dealId: string; noteData: CreateNoteData }) => {
      const response = await api.post(`/deals/${dealId}/notes`, noteData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate the deal query to refresh the notes
      queryClient.invalidateQueries({ queryKey: ['deal', variables.dealId] })
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ dealId, noteId, noteData }: { dealId: string; noteId: string; noteData: Partial<CreateNoteData> }) => {
      const response = await api.put(`/deals/${dealId}/notes/${noteId}`, noteData)
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate the deal query to refresh the notes
      queryClient.invalidateQueries({ queryKey: ['deal', variables.dealId] })
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async ({ dealId, noteId }: { dealId: string; noteId: string }) => {
      await api.delete(`/deals/${dealId}/notes/${noteId}`)
      return true
    },
    onSuccess: (data, variables) => {
      // Invalidate the deal query to refresh the notes
      queryClient.invalidateQueries({ queryKey: ['deal', variables.dealId] })
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  const createNote = async (dealId: string, noteData: CreateNoteData) => {
    return createNoteMutation.mutateAsync({ dealId, noteData })
  }

  const updateNote = async (dealId: string, noteId: string, noteData: Partial<CreateNoteData>) => {
    return updateNoteMutation.mutateAsync({ dealId, noteId, noteData })
  }

  const deleteNote = async (dealId: string, noteId: string) => {
    return deleteNoteMutation.mutateAsync({ dealId, noteId })
  }

  return {
    createNote,
    updateNote,
    deleteNote,
    isLoading: createNoteMutation.isPending || updateNoteMutation.isPending || deleteNoteMutation.isPending,
    error: createNoteMutation.error || updateNoteMutation.error || deleteNoteMutation.error,
  }
}