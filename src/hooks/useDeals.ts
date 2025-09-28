import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DealService } from '../services/deals'
import { Deal, DealFilters } from '../types'

// Query Keys
export const dealKeys = {
  all: ['deals'] as const,
  lists: () => [...dealKeys.all, 'list'] as const,
  list: (filters: DealFilters) => [...dealKeys.lists(), filters] as const,
  details: () => [...dealKeys.all, 'detail'] as const,
  detail: (id: string) => [...dealKeys.details(), id] as const,
}

// Hooks
export function useDeals(filters: DealFilters = {}) {
  return useQuery({
    queryKey: dealKeys.list(filters),
    queryFn: () => DealService.getDeals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useDeal(id: string) {
  return useQuery({
    queryKey: dealKeys.detail(id),
    queryFn: () => DealService.getDeal(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (deal: Partial<Deal>) => DealService.createDeal(deal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, deal }: { id: string; deal: Partial<Deal> }) =>
      DealService.updateDeal(id, deal),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
      queryClient.setQueryData(dealKeys.detail(data.id), data)
    },
  })
}

export function useDeleteDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => DealService.deleteDeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.lists() })
    },
  })
}