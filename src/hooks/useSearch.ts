import { useQuery } from '@tanstack/react-query'
import { SearchService } from '../services/search'

// Query Keys
export const searchKeys = {
  all: ['search'] as const,
  global: (query: string) => [...searchKeys.all, 'global', query] as const,
  suggestions: (query?: string) => [...searchKeys.all, 'suggestions', query] as const,
}

// Hooks
export function useGlobalSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: searchKeys.global(query),
    queryFn: () => SearchService.globalSearch(query),
    enabled: enabled && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useSearchSuggestions(query?: string) {
  return useQuery({
    queryKey: searchKeys.suggestions(query),
    queryFn: () => SearchService.getSuggestions(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}