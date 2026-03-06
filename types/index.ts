import { Database } from './database.types'

// User types
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

// Route types
export type Route = Database['public']['Tables']['routes']['Row']
export type RouteInsert = Database['public']['Tables']['routes']['Insert']
export type RouteUpdate = Database['public']['Tables']['routes']['Update']

export type RouteDifficulty = 'easy' | 'moderate' | 'challenging' | 'expert'
export type RouteCategory = 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'

// Route Stop types
export type RouteStop = Database['public']['Tables']['route_stops']['Row']
export type RouteStopInsert = Database['public']['Tables']['route_stops']['Insert']
export type RouteStopUpdate = Database['public']['Tables']['route_stops']['Update']

export type StopType = 'viewpoint' | 'cafe' | 'gas_station' | 'restaurant' | 'landmark' | 'accommodation'

// Route Photo types
export type RoutePhoto = Database['public']['Tables']['route_photos']['Row']
export type RoutePhotoInsert = Database['public']['Tables']['route_photos']['Insert']
export type RoutePhotoUpdate = Database['public']['Tables']['route_photos']['Update']

// Route Rating types
export type RouteRating = Database['public']['Tables']['route_ratings']['Row']
export type RouteRatingInsert = Database['public']['Tables']['route_ratings']['Insert']
export type RouteRatingUpdate = Database['public']['Tables']['route_ratings']['Update']

// Saved Route types
export type SavedRoute = Database['public']['Tables']['saved_routes']['Row']
export type SavedRouteInsert = Database['public']['Tables']['saved_routes']['Insert']
export type SavedRouteUpdate = Database['public']['Tables']['saved_routes']['Update']

// Extended types with relations
export interface RouteWithDetails extends Route {
  user?: User
  stops?: RouteStop[]
  photos?: RoutePhoto[]
  ratings?: RouteRating[]
  saved_by_current_user?: boolean
  rating_count?: number
  average_rating?: number
}

export interface UserProfile extends User {
  routes_count?: number
  saved_routes_count?: number
  contributed_routes?: Route[]
  saved_routes?: SavedRoute[]
}

// Filter types
export interface RouteFilters {
  category?: RouteCategory[]
  difficulty?: RouteDifficulty[]
  min_distance?: number
  max_distance?: number
  min_duration?: number
  max_duration?: number
  region?: string[]
  min_scenic_score?: number
  search?: string
}

export interface RouteSort {
  field: 'created_at' | 'distance_km' | 'duration_minutes' | 'scenic_score' | 'fun_factor_score'
  direction: 'asc' | 'desc'
}

// GeoJSON types
export interface Coordinates {
  lat: number
  lng: number
}

export interface LineString {
  type: 'LineString'
  coordinates: [number, number][] // [longitude, latitude]
}
