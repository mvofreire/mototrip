import { supabase } from '@/lib/supabase/client'
import { RouteWithDetails, RouteFilters, RouteSort } from '@/types'

export class RoutesService {
  /**
   * Fetch routes with optional filters and sorting
   */
  static async getRoutes(filters?: RouteFilters, sort?: RouteSort) {
    let query = supabase
      .from('routes')
      .select(`
        *,
        user:users(*),
        stops:route_stops(*),
        photos:route_photos(*),
        ratings:route_ratings(*)
      `)
      .eq('published', true)

    // Apply filters
    if (filters?.category?.length) {
      query = query.in('category', filters.category)
    }

    if (filters?.difficulty?.length) {
      query = query.in('difficulty', filters.difficulty)
    }

    if (filters?.min_distance) {
      query = query.gte('distance_km', filters.min_distance)
    }

    if (filters?.max_distance) {
      query = query.lte('distance_km', filters.max_distance)
    }

    if (filters?.min_duration) {
      query = query.gte('duration_minutes', filters.min_duration)
    }

    if (filters?.max_duration) {
      query = query.lte('duration_minutes', filters.max_duration)
    }

    if (filters?.min_scenic_score) {
      query = query.gte('scenic_score', filters.min_scenic_score)
    }

    if (filters?.region?.length) {
      query = query.in('region', filters.region)
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error
    return data as RouteWithDetails[]
  }

  /**
   * Get a single route by ID
   */
  static async getRouteById(id: string) {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        user:users(*),
        stops:route_stops(*),
        photos:route_photos(*),
        ratings:route_ratings(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as RouteWithDetails
  }

  /**
   * Get featured routes
   */
  static async getFeaturedRoutes(limit = 3) {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        user:users(*),
        stops:route_stops(*),
        photos:route_photos(*)
      `)
      .eq('featured', true)
      .eq('published', true)
      .order('scenic_score', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data as RouteWithDetails[]
  }

  /**
   * Save a route for a user
   */
  static async saveRoute(routeId: string, userId: string) {
    const { data, error } = await supabase
      .from('saved_routes')
      .insert({ route_id: routeId, user_id: userId })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Unsave a route for a user
   */
  static async unsaveRoute(routeId: string, userId: string) {
    const { error } = await supabase
      .from('saved_routes')
      .delete()
      .eq('route_id', routeId)
      .eq('user_id', userId)

    if (error) throw error
  }

  /**
   * Rate a route
   */
  static async rateRoute(
    routeId: string,
    userId: string,
    ratings: {
      scenic_rating: number
      road_quality_rating: number
      fun_factor_rating: number
      comment?: string
    }
  ) {
    const { data, error } = await supabase
      .from('route_ratings')
      .upsert({
        route_id: routeId,
        user_id: userId,
        ...ratings,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Get user's saved routes
   */
  static async getSavedRoutes(userId: string) {
    const { data, error } = await supabase
      .from('saved_routes')
      .select(`
        *,
        route:routes(
          *,
          user:users(*),
          stops:route_stops(*),
          photos:route_photos(*)
        )
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }
}
