import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

export interface Note {
  id: string
  title: string
  content: string
  category: string
  status: string
  createdAt: string
  updatedAt: string
  talentClientId: string
  authorId: string | null
  author?: {
    id: string
    name: string
    email: string
  } | null
}

interface CreateNoteData {
  title?: string
  content: string
  category?: string
  status?: string
}

interface UpdateNoteData {
  title?: string
  content?: string
  category?: string
  status?: string
}

// Fetch notes for a talent client
export function useTalentNotes(talentId: string) {
  return useQuery({
    queryKey: ['notes', talentId],
    queryFn: async () => {
      const response = await api.get(`/talents/${talentId}/notes`)
      return response.data.data as Note[]
    },
    enabled: !!talentId
  })
}

// Create, update, delete mutations
export function useNoteMutations(talentId: string) {
  const queryClient = useQueryClient()

  const createNoteMutation = useMutation({
    mutationFn: async (noteData: CreateNoteData) => {
      const response = await api.post(`/talents/${talentId}/notes`, noteData)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', talentId] })
    }
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, noteData }: { noteId: string; noteData: UpdateNoteData }) => {
      const response = await api.put(`/notes/${noteId}`, noteData)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', talentId] })
    }
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      await api.delete(`/notes/${noteId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', talentId] })
    }
  })

  return {
    createNote: createNoteMutation.mutateAsync,
    updateNote: updateNoteMutation.mutateAsync,
    deleteNote: deleteNoteMutation.mutateAsync,
    isCreating: createNoteMutation.isPending,
    isUpdating: updateNoteMutation.isPending,
    isDeleting: deleteNoteMutation.isPending,
    error: createNoteMutation.error || updateNoteMutation.error || deleteNoteMutation.error
  }
}

// Legacy hook for deal notes (for backwards compatibility)
export function useNotes() {
  const queryClient = useQueryClient()

  const createNoteMutation = useMutation({
    mutationFn: async ({ dealId, noteData }: { dealId: string; noteData: CreateNoteData }) => {
      const response = await api.post(`/deals/${dealId}/notes`, noteData)
      return response.data
    },
    onSuccess: (data, variables) => {
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