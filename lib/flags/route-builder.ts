import { flagsClient } from '@vercel/flags-core'
import type { ApiUser } from '@/lib/auth/api-user'

/**
 * Vercel Flags key. Who gets the map route builder is decided in the Vercel
 * dashboard (Flags → route-builder) with rules on `user.role` / `user.id`.
 */
export const ROUTE_BUILDER_FLAG = 'route-builder'

// A flag request is billed per application request that reads the flags, and
// the builder calls /api/routing on every tap: remember each user's answer
// for a while instead of asking again.
const CACHE_MS = 5 * 60 * 1000
const cache = new Map<string, { value: boolean; expires: number }>()

/** Used when Vercel Flags can't answer (no credentials locally, outage, quota) */
const staffOnly = (user: ApiUser) => user.role === 'admin' || user.role === 'curator'

/** Whether this user may draw routes on the map (and spend routing quota) */
export async function canUseRouteBuilder(user: ApiUser): Promise<boolean> {
  const key = `${user.id}:${user.role}`
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.value

  const fallback = staffOnly(user)
  let value = fallback
  try {
    // Evaluated inside the request: on Vercel the OIDC credentials are request-scoped
    const result = await flagsClient.evaluate<boolean>(ROUTE_BUILDER_FLAG, fallback, {
      user: { id: user.id, role: user.role },
    })
    value = result.value === true
    if (result.errorMessage) {
      console.warn(`Flag ${ROUTE_BUILDER_FLAG}: ${result.errorMessage} (using role fallback)`)
    }
  } catch (e) {
    console.warn(`Flag ${ROUTE_BUILDER_FLAG} unavailable, using role fallback:`, e)
  }

  cache.set(key, { value, expires: Date.now() + CACHE_MS })
  return value
}
