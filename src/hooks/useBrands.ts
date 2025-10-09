import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { BrandService } from '../services/brands'
import { Brand, BrandFilters } from '../types'

// Query Keys
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters: BrandFilters) => [...brandKeys.lists(), filters] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
  industries: () => [...brandKeys.all, 'industries'] as const,
}

// Hooks
export function useBrands(filters: BrandFilters = {}) {
  return useQuery({
    queryKey: brandKeys.list(filters),
    queryFn: () => BrandService.getBrands(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useInfiniteBrands(filters: Omit<BrandFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...brandKeys.lists(), 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      BrandService.getBrands({ ...filters, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta
      return page < totalPages ? page + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: brandKeys.detail(id),
    queryFn: () => BrandService.getBrand(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBrandIndustries() {
  return useQuery({
    queryKey: brandKeys.industries(),
    queryFn: () => BrandService.getIndustries(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useBrandStats(filters: Omit<BrandFilters, 'page' | 'limit'> = {}) {
  return useQuery({
    queryKey: [...brandKeys.lists(), 'stats', filters],
    queryFn: async () => {
      // Get counts for different status/type combinations
      const totalResponse = await BrandService.getBrands({ ...filters, limit: 1, page: 1 })
      const activeResponse = await BrandService.getBrands({ ...filters, status: 'ACTIVE', limit: 1, page: 1 })
      const agencyResponse = await BrandService.getBrands({ ...filters, type: 'AGENCY', limit: 1, page: 1 })
      const prospectResponse = await BrandService.getBrands({ ...filters, status: 'PROSPECT', limit: 1, page: 1 })

      return {
        total: totalResponse.meta.total,
        totalActive: activeResponse.meta.total,
        totalAgencies: agencyResponse.meta.total,
        totalProspects: prospectResponse.meta.total
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useCreateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (brand: Partial<Brand>) => BrandService.createBrand(brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      queryClient.invalidateQueries({ queryKey: brandKeys.industries() })
    },
  })
}

export function useUpdateBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, brand }: { id: string; brand: Partial<Brand> }) =>
      BrandService.updateBrand(id, brand),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
      queryClient.setQueryData(brandKeys.detail(data.id), data)
    },
  })
}

export function useDeleteBrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => BrandService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() })
    },
  })
}

// Brand search hook with debouncing
export function useBrandSearch(searchTerm: string, limit: number = 20) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return useQuery({
    queryKey: brandKeys.list({
      search: debouncedSearch || undefined,
      limit
    }),
    queryFn: () => BrandService.getBrands({
      search: debouncedSearch || undefined,
      limit
    }),
    enabled: true, // Always enabled to show initial results
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}