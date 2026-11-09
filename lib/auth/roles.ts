import type { AuthUser, UserRole } from '@/types/auth.types'

/**
 * admin       — everything, incl. deleting routes and managing user roles
 * curator     — reviews routes, edits any route, removes any photo/comment
 * contributor — submits routes and edits their own
 *
 * The database enforces the same rules (supabase/migrations/014).
 */
export function roleOf(user: AuthUser | null | undefined): UserRole | null {
  return user?.profile?.role ?? null
}

export function isAdmin(user: AuthUser | null | undefined) {
  return roleOf(user) === 'admin'
}

/** Admin or curator */
export function isStaff(user: AuthUser | null | undefined) {
  const role = roleOf(user)
  return role === 'admin' || role === 'curator'
}

/** Author of the route or staff */
export function canEditRoute(user: AuthUser | null | undefined, route: { user_id: string }) {
  return !!user && (user.id === route.user_id || isStaff(user))
}
