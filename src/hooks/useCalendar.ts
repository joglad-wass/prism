import { useQuery } from '@tanstack/react-query'
import { CalendarEvent, CalendarEventFilters } from '../types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// Query Keys
export const calendarKeys = {
  all: ['calendar'] as const,
  events: (filters: CalendarEventFilters) => [...calendarKeys.all, 'events', filters] as const,
}

// Fetch calendar events
async function fetchCalendarEvents(filters: CalendarEventFilters = {}): Promise<CalendarEvent[]> {
  const params = new URLSearchParams()

  if (filters.startDate) params.append('startDate', filters.startDate)
  if (filters.endDate) params.append('endDate', filters.endDate)
  if (filters.eventTypes && filters.eventTypes.length > 0) {
    filters.eventTypes.forEach(type => params.append('eventTypes', type))
  }
  if (filters.entityTypes && filters.entityTypes.length > 0) {
    filters.entityTypes.forEach(type => params.append('entityTypes', type))
  }

  const queryString = params.toString()
  const url = `${API_BASE_URL}/api/calendar/events${queryString ? `?${queryString}` : ''}`

  // Get user ID from localStorage (assuming it's stored there)
  const userId = typeof window !== 'undefined' ? window.localStorage.getItem('prism-active-user-id') : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (userId) {
    headers['x-user-id'] = userId
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar events')
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch calendar events')
  }

  return result.data
}

// Hook to get calendar events
export function useCalendarEvents(filters: CalendarEventFilters = {}) {
  return useQuery({
    queryKey: calendarKeys.events(filters),
    queryFn: () => fetchCalendarEvents(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}
