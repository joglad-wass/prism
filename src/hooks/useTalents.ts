import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TalentService } from '../services/talents'
import { TalentClient, TalentFilters } from '../types'

// Query Keys
export const talentKeys = {
  all: ['talents'] as const,
  lists: () => [...talentKeys.all, 'list'] as const,
  list: (filters: TalentFilters) => [...talentKeys.lists(), filters] as const,
  details: () => [...talentKeys.all, 'detail'] as const,
  detail: (id: string) => [...talentKeys.details(), id] as const,
  categories: () => [...talentKeys.all, 'categories'] as const,
}

// Hooks
export function useTalents(filters: TalentFilters = {}) {
  return useQuery({
    queryKey: talentKeys.list(filters),
    queryFn: () => TalentService.getTalents(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInfiniteTalents(filters: Omit<TalentFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...talentKeys.lists(), 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      TalentService.getTalents({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTalent(id: string) {
  return useQuery({
    queryKey: talentKeys.detail(id),
    queryFn: () => TalentService.getTalent(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTalentCategories() {
  return useQuery({
    queryKey: talentKeys.categories(),
    queryFn: () => TalentService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useTalentStats(filters: Omit<TalentFilters, 'page' | 'limit'> = {}) {
  return useQuery({
    queryKey: [...talentKeys.lists(), 'stats', filters],
    queryFn: async () => {
      // Get total count
      const totalResponse = await TalentService.getTalents({ ...filters, limit: 1, page: 1 })

      // Get active count
      const activeResponse = await TalentService.getTalents({
        ...filters,
        status: 'Active',
        limit: 1,
        page: 1
      })

      // Get NIL count - we need to sample since NIL isn't a filterable field
      const sampleResponse = await TalentService.getTalents({ ...filters, limit: 100, page: 1 })
      const nilCount = sampleResponse.data.filter(t => t.isNil).length
      const estimatedNilTotal = sampleResponse.data.length > 0
        ? Math.round((nilCount / sampleResponse.data.length) * totalResponse.meta.total)
        : 0

      return {
        total: totalResponse.meta.total,
        totalActive: activeResponse.meta.total,
        totalNil: estimatedNilTotal
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useCreateTalent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (talent: Partial<TalentClient>) => TalentService.createTalent(talent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: talentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: talentKeys.categories() })
    },
  })
}

export function useUpdateTalent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, talent }: { id: string; talent: Partial<TalentClient> }) =>
      TalentService.updateTalent(id, talent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: talentKeys.lists() })
      queryClient.setQueryData(talentKeys.detail(data.id), data)
    },
  })
}

export function useDeleteTalent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => TalentService.deleteTalent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: talentKeys.lists() })
    },
  })
}