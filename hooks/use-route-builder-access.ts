'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'

/**
 * Whether the signed-in user may draw routes on the map. Decided on the
 * server by the "route-builder" flag (Vercel Flags); false while loading.
 */
export function useRouteBuilderAccess(): boolean {
  const { user } = useAuth()
  const { data } = useQuery({
    queryKey: ['feature', 'route-builder', user?.id, user?.profile?.role],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return false
      const res = await fetch('/api/features/route-builder', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) return false
      return (await res.json()).enabled === true
    },
  })
  return data === true
}
