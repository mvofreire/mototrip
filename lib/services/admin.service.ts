import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import { RouteStorage } from '@/lib/storage/storage.service'
import { authRedirectUrl } from '@/lib/auth/redirects'
import type { UserRole } from '@/types/auth.types'

type Route = Database['public']['Tables']['routes']['Row']
type RouteUpdate = Database['public']['Tables']['routes']['Update']

export interface AdminRouteWithUser extends Route {
  user_email?: string
  user_name?: string
  /** MotoTrip review confidence (null = no review) */
  curator_confidence?: 'high' | 'medium' | 'low' | null
}

export type AccountStatus = 'active' | 'suspended' | 'banned'

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  /** Auth provider used to sign up: 'email' | 'google' */
  provider: string
  created_at: string
  email_confirmed_at: string | null
  confirmation_sent_at: string | null
  last_sign_in_at: string | null
  /** Effective status (an expired suspension is 'active') */
  account_status: AccountStatus
  suspended_until: string | null
  moderation_reason: string | null
  moderated_at: string | null
  /** Banned user's routes, comments, photos and ratings are hidden from the public */
  content_hidden: boolean
  routes_count: number
  comments_count: number
}

export interface ModerationLogEntry {
  id: number
  action: 'suspend' | 'ban' | 'reactivate' | 'role_change' | 'hide_content' | 'show_content'
  reason: string | null
  suspended_until: string | null
  details: { from?: string; to?: string; content_hidden?: boolean } | null
  performed_by_name: string | null
  created_at: string
}

export class AdminService {
  /**
   * List all users with their email-confirmation status (admin only)
   */
  static async listUsers(): Promise<AdminUser[]> {
    const { data, error } = await (supabase as any).rpc('admin_list_users')
    if (error) {
      console.error('Error listing users:', error)
      throw new Error(`Failed to list users: ${error.message}`)
    }
    return (data as AdminUser[]) ?? []
  }

  /**
   * Switch a user between contributor and curator (admin only; enforced by
   * the admin_set_user_role function)
   */
  static async setUserRole(userId: string, role: 'contributor' | 'curator'): Promise<void> {
    const { error } = await (supabase as any).rpc('admin_set_user_role', {
      target_user: userId,
      new_role: role,
    })
    if (error) throw new Error(error.message)
  }

  /**
   * Suspend (until a date), ban, or reactivate a user (admin only). Blocks
   * sign-in, revokes sessions and blocks writes (see migration 016).
   */
  static async moderateUser(
    userId: string,
    status: AccountStatus,
    options: { until?: Date; reason?: string; hideContent?: boolean } = {},
  ): Promise<void> {
    const { error } = await (supabase as any).rpc('admin_moderate_user', {
      target_user: userId,
      new_status: status,
      until: options.until?.toISOString() ?? null,
      reason: options.reason ?? null,
      hide_content: options.hideContent ?? false,
    })
    if (error) throw new Error(error.message)
  }

  /** Hide or show everything a banned user published (admin only) */
  static async setContentHidden(userId: string, hidden: boolean): Promise<void> {
    const { error } = await (supabase as any).rpc('admin_set_content_hidden', {
      target_user: userId,
      hidden,
    })
    if (error) throw new Error(error.message)
  }

  /** Moderation and role-change history of a user, newest first (admin only) */
  static async getModerationLog(userId: string): Promise<ModerationLogEntry[]> {
    const { data, error } = await (supabase as any).rpc('admin_user_moderation_log', {
      target_user: userId,
    })
    if (error) throw new Error(error.message)
    return ((data as ModerationLogEntry[]) ?? [])
  }

  /**
   * Re-send the signup confirmation email to an unconfirmed user.
   * The link points to the site the admin is currently using.
   */
  static async resendConfirmation(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: authRedirectUrl('') },
    })
    if (error) throw error
  }

  /**
   * Get all routes (admin only)
   */
  static async getAllRoutes({ withEmails = false } = {}): Promise<AdminRouteWithUser[]> {
    // Get all routes
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*, curator_review:route_curator_reviews(confidence)')
      .order('created_at', { ascending: false })

    if (routesError) {
      console.error('Error fetching routes:', routesError)
      throw new Error(`Failed to fetch routes: ${routesError.message}`)
    }

    if (!routes || routes.length === 0) {
      return []
    }

    // Type assertion to work around Supabase typing issues
    const typedRoutes = routes as any[]

    // Get all unique user IDs
    const userIds = [...new Set(typedRoutes.map(r => r.user_id))]

    // Get profiles for these users
    const [{ data: profiles, error: profilesError }, { data: emails, error: emailsError }] =
      await Promise.all([
        supabase.from('profiles').select('id, full_name').in('id', userIds),
        // Emails are only exposed to admins through this RPC
        withEmails
          ? (supabase as any).rpc('admin_get_user_emails', { user_ids: userIds })
          : Promise.resolve({ data: [], error: null }),
      ])

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }
    if (emailsError) {
      console.error('Error fetching user emails:', emailsError)
    }

    const nameMap = new Map<string, string | null>(
      ((profiles as any[]) || []).map((p) => [p.id, p.full_name])
    )
    const emailMap = new Map<string, string>(
      ((emails as any[]) || []).map((e) => [e.id, e.email])
    )

    // Combine routes with profile info
    return typedRoutes.map(({ curator_review, ...route }) => ({
      ...route,
      curator_confidence: (Array.isArray(curator_review) ? curator_review[0] : curator_review)?.confidence ?? null,
      user_email: emailMap.get(route.user_id),
      user_name: nameMap.get(route.user_id) ?? undefined,
    }))
  }

  /**
   * Update route (admins and curators)
   */
  static async updateRoute(id: string, updates: RouteUpdate): Promise<Route> {
    const { data, error } = await (supabase as any)
      .from('routes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating route:', error)
      throw new Error('Failed to update route')
    }

    return data
  }

  /**
   * Approve a route (admins and curators). It becomes visible to everyone.
   */
  static async approveRoute(id: string): Promise<Route> {
    return this.updateRoute(id, { status: 'approved', review_note: null })
  }

  /**
   * Reject a route with a reason the author can see (admins and curators)
   */
  static async rejectRoute(id: string, note: string): Promise<Route> {
    return this.updateRoute(id, { status: 'rejected', review_note: note })
  }

  /**
   * Toggle route featured status (admins and curators)
   */
  static async toggleFeatured(id: string, featured: boolean): Promise<Route> {
    return this.updateRoute(id, { featured })
  }

  /**
   * Delete route (admin only)
   */
  static async deleteRoute(id: string): Promise<void> {
    // Delete thumbnail from storage
    try {
      await RouteStorage.deleteRouteThumbnail(id)
    } catch (error) {
      console.warn('Error deleting thumbnail:', error)
      // Continue even if thumbnail deletion fails
    }

    // Delete route from database
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting route:', error)
      throw new Error('Failed to delete route')
    }
  }

  /**
   * Delete multiple routes (admin only)
   */
  static async deleteRoutesBulk(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      throw new Error('No routes to delete')
    }

    // Delete thumbnails from storage
    await Promise.allSettled(
      ids.map(id => RouteStorage.deleteRouteThumbnail(id))
    )

    // Delete routes from database
    const { error } = await supabase
      .from('routes')
      .delete()
      .in('id', ids)

    if (error) {
      console.error('Error deleting routes:', error)
      throw new Error('Failed to delete routes')
    }
  }

  /**
   * Current user's role, read fresh from the database
   */
  static async getRole(): Promise<UserRole | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !data) return null
    return (data as any).role as UserRole
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(): Promise<boolean> {
    return (await this.getRole()) === 'admin'
  }
}
