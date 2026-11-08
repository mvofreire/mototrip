import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import { RouteStorage } from '@/lib/storage/storage.service'
import { authRedirectUrl } from '@/lib/auth/redirects'

type Route = Database['public']['Tables']['routes']['Row']
type RouteUpdate = Database['public']['Tables']['routes']['Update']

export interface AdminRouteWithUser extends Route {
  user_email?: string
  user_name?: string
}

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'contributor'
  created_at: string
  email_confirmed_at: string | null
  confirmation_sent_at: string | null
  last_sign_in_at: string | null
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
  static async getAllRoutes(): Promise<AdminRouteWithUser[]> {
    // Get all routes
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*')
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
        (supabase as any).rpc('admin_get_user_emails', { user_ids: userIds }),
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
    return typedRoutes.map((route) => ({
      ...route,
      user_email: emailMap.get(route.user_id),
      user_name: nameMap.get(route.user_id) ?? undefined,
    }))
  }

  /**
   * Update route (admin only)
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
   * Toggle route published status (admin only)
   */
  static async togglePublished(id: string, published: boolean): Promise<Route> {
    return this.updateRoute(id, { published })
  }

  /**
   * Toggle route featured status (admin only)
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
   * Check if user is admin
   */
  static async isAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error || !data) return false

    return (data as any).role === 'admin'
  }
}
