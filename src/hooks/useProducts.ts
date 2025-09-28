import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductService } from '../services/products'
import { Product, ProductFilters } from '../types'

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  schedules: (id: string) => [...productKeys.detail(id), 'schedules'] as const,
}

// Hooks
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => ProductService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductService.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useProductSchedules(id: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...productKeys.schedules(id), { page, limit }],
    queryFn: () => ProductService.getProductSchedules(id, page, limit),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: Partial<Product>) => ProductService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<Product> }) =>
      ProductService.updateProduct(id, product),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.setQueryData(productKeys.detail(data.id), data)
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ProductService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    },
  })
}