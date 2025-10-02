import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { ActivityLog } from '../types'

interface ActivityFeedResponse {
  success: boolean
  data: ActivityLog[]
  meta: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface UseActivityFeedParams {
  dealId: string
  limit?: number
  offset?: number
  activityType?: string
}

export function useActivityFeed({
  dealId,
  limit = 50,
  offset = 0,
  activityType,
}: UseActivityFeedParams): UseQueryResult<ActivityFeedResponse, Error> {
  return useQuery({
    queryKey: ['activities', dealId, { limit, offset, activityType }],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (activityType) {
        params.append('activityType', activityType)
      }

      const response = await fetch(
        `http://localhost:3001/api/deals/${dealId}/activities?${params.toString()}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch activities')
      }

      return response.json()
    },
    enabled: !!dealId,
  })
}
