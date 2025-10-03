import { useQuery } from '@tanstack/react-query'
import { PaymentService } from '../services/payments'

// Query Keys
export const paymentKeys = {
  all: ['payments'] as const,
  byDeal: (dealId: string) => [...paymentKeys.all, 'by-deal', dealId] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
}

// Hooks
export function usePaymentsByDeal(dealId: string) {
  return useQuery({
    queryKey: paymentKeys.byDeal(dealId),
    queryFn: () => PaymentService.getPaymentsByDeal(dealId),
    enabled: !!dealId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: paymentKeys.detail(id),
    queryFn: () => PaymentService.getPayment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
