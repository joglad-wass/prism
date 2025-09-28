'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Prevent refetch on window focus in development
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            // Retry failed requests
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false
              }
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            // Stale time for all queries
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
          mutations: {
            // Retry failed mutations
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                return false
              }
              // Retry once for other errors
              return failureCount < 1
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}