import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Attachment } from '../types'
import { fileToBase64 } from '../utils/file'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:3001'

// Query Keys
export const attachmentKeys = {
  all: ['attachments'] as const,
  lists: () => [...attachmentKeys.all, 'list'] as const,
  list: (dealId: string) => [...attachmentKeys.lists(), { dealId }] as const,
  details: () => [...attachmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...attachmentKeys.details(), id] as const,
}

// API Service
const AttachmentService = {
  async getAttachments(dealId: string): Promise<Attachment[]> {
    const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}/attachments`)
    const data = await response.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch attachments')
    return data.data
  },

  async getAttachment(id: string): Promise<Attachment> {
    const response = await fetch(`${API_BASE_URL}/api/attachments/${id}`)
    const data = await response.json()
    if (!data.success) throw new Error(data.error || 'Failed to fetch attachment')
    return data.data
  },

  async uploadAttachment(file: File, dealId: string, description?: string): Promise<Attachment> {
    const base64Data = await fileToBase64(file)

    const response = await fetch(`${API_BASE_URL}/api/attachments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Data,
        dealId,
        description,
      }),
    })

    const data = await response.json()
    if (!data.success) throw new Error(data.error || 'Failed to upload attachment')
    return data.data
  },

  async deleteAttachment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/attachments/${id}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.error || 'Failed to delete attachment')
  },

  async downloadAttachment(id: string): Promise<{ base64Data: string; fileName: string; fileType: string }> {
    const response = await fetch(`${API_BASE_URL}/api/attachments/${id}/download`)
    const data = await response.json()
    if (!data.success) throw new Error(data.error || 'Failed to download attachment')
    return data.data
  },
}

// Hooks
export function useAttachments(dealId: string) {
  return useQuery({
    queryKey: attachmentKeys.list(dealId),
    queryFn: () => AttachmentService.getAttachments(dealId),
    enabled: !!dealId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAttachment(id: string) {
  return useQuery({
    queryKey: attachmentKeys.detail(id),
    queryFn: () => AttachmentService.getAttachment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useUploadAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ file, dealId, description }: { file: File; dealId: string; description?: string }) =>
      AttachmentService.uploadAttachment(file, dealId, description),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.list(data.dealId!) })
    },
  })
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => AttachmentService.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attachmentKeys.lists() })
    },
  })
}

export function useDownloadAttachment() {
  return useMutation({
    mutationFn: (id: string) => AttachmentService.downloadAttachment(id),
  })
}
