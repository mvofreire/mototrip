'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/hooks/use-auth'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {/* Dark by default for everyone (the OS preference is ignored); the
          header toggle switches to light and remembers it. The storage key is
          new so earlier saved choices don't override the new default. */}
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="mototrip-theme">
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
