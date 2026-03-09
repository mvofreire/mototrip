import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Route = Database['public']['Tables']['routes']['Row']
type RouteUpdate = Database['public']['Tables']['routes']['Update']

export interface AdminRouteWithUser extends Route {
  user_email?: string
  user_name?: string
}

export class AdminService {
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
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    // Create a map of profiles by id
    const profileMap = new Map(
      (profiles as any[])?.map(p => [p.id, p]) || []
    )

    // Combine routes with profile info
    return typedRoutes.map((route) => {
      const profile = profileMap.get(route.user_id)
      return {
        ...route,
        user_email: profile?.email,
        user_name: profile?.full_name,
      }
    })
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
