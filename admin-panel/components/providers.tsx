'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '../hooks/useAuth'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 دقيقة
            retry: (failureCount, error: any) => {
              // عدم المحاولة مرة أخرى للأخطاء 401, 403, 404
              if (error?.response?.status === 401 || 
                  error?.response?.status === 403 || 
                  error?.response?.status === 404) {
                return false
              }
              // المحاولة مرة أخرى للأخطاء الأخرى (حد أقصى 2 مرات)
              return failureCount < 2
            },
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
