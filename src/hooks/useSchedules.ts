import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ScheduleService } from '../services/schedules'
import { Schedule, ScheduleFilters } from '../types'

// Query Keys
export const scheduleKeys = {
  all: ['schedules'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: (filters: ScheduleFilters) => [...scheduleKeys.lists(), filters] as const,
  details: () => [...scheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const,
  byDeal: (dealId: string) => [...scheduleKeys.all, 'by-deal', dealId] as const,
  byProduct: (productId: string) => [...scheduleKeys.all, 'by-product', productId] as const,
}

// Hooks
export function useSchedules(filters: ScheduleFilters = {}) {
  return useQuery({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => ScheduleService.getSchedules(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSchedule(id: string) {
  return useQuery({
    queryKey: scheduleKeys.detail(id),
    queryFn: () => ScheduleService.getSchedule(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSchedulesByDeal(dealId: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...scheduleKeys.byDeal(dealId), { page, limit }],
    queryFn: () => ScheduleService.getSchedulesByDeal(dealId, page, limit),
    enabled: !!dealId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useSchedulesByProduct(productId: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...scheduleKeys.byProduct(productId), { page, limit }],
    queryFn: () => ScheduleService.getSchedulesByProduct(productId, page, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (schedule: Partial<Schedule>) => ScheduleService.createSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, schedule }: { id: string; schedule: Partial<Schedule> }) =>
      ScheduleService.updateSchedule(id, schedule),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
      queryClient.setQueryData(scheduleKeys.detail(data.id), data)
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ScheduleService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.lists() })
    },
  })
}