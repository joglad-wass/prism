import { useQuery } from '@tanstack/react-query'
import { SearchService } from '../services/search'

interface SearchFilters {
  costCenter?: string | null
  costCenterGroup?: string | null
}

// Query Keys
export const searchKeys = {
  all: ['search'] as const,
  global: (query: string, filters?: SearchFilters) => [...searchKeys.all, 'global', query, filters] as const,
  suggestions: (query?: string, filters?: SearchFilters) => [...searchKeys.all, 'suggestions', query, filters] as const,
}

// Hooks
export function useGlobalSearch(query: string, filters?: SearchFilters, enabled: boolean = true) {
  return useQuery({
    queryKey: searchKeys.global(query, filters),
    queryFn: () => SearchService.globalSearch(query, filters),
    enabled: enabled && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useSearchSuggestions(query?: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: searchKeys.suggestions(query, filters),
    queryFn: () => SearchService.getSuggestions(query, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}