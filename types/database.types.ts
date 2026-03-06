export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
          distance_km: number
          duration_minutes: number
          elevation_gain_m: number | null
          polyline_coordinates: any // GeoJSON LineString
          region: string | null
          category: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
          scenic_score: number
          road_quality_score: number
          fun_factor_score: number
          featured: boolean
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
          distance_km: number
          duration_minutes: number
          elevation_gain_m?: number | null
          polyline_coordinates: any
          region?: string | null
          category: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
          scenic_score?: number
          road_quality_score?: number
          fun_factor_score?: number
          featured?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert'
          distance_km?: number
          duration_minutes?: number
          elevation_gain_m?: number | null
          polyline_coordinates?: any
          region?: string | null
          category?: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
          scenic_score?: number
          road_quality_score?: number
          fun_factor_score?: number
          featured?: boolean
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      route_stops: {
        Row: {
          id: string
          route_id: string
          name: string
          description: string | null
          type: 'viewpoint' | 'cafe' | 'gas_station' | 'restaurant' | 'landmark' | 'accommodation'
          latitude: number
          longitude: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          name: string
          description?: string | null
          type: 'viewpoint' | 'cafe' | 'gas_station' | 'restaurant' | 'landmark' | 'accommodation'
          latitude: number
          longitude: number
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          name?: string
          description?: string | null
          type?: 'viewpoint' | 'cafe' | 'gas_station' | 'restaurant' | 'landmark' | 'accommodation'
          latitude?: number
          longitude?: number
          order_index?: number
          created_at?: string
        }
      }
      route_photos: {
        Row: {
          id: string
          route_id: string
          user_id: string
          url: string
          caption: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          user_id: string
          url: string
          caption?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          user_id?: string
          url?: string
          caption?: string | null
          order_index?: number
          created_at?: string
        }
      }
      route_ratings: {
        Row: {
          id: string
          route_id: string
          user_id: string
          scenic_rating: number
          road_quality_rating: number
          fun_factor_rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_id: string
          user_id: string
          scenic_rating: number
          road_quality_rating: number
          fun_factor_rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          user_id?: string
          scenic_rating?: number
          road_quality_rating?: number
          fun_factor_rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      saved_routes: {
        Row: {
          id: string
          user_id: string
          route_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          route_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          route_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
      category: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
      stop_type: 'viewpoint' | 'cafe' | 'gas_station' | 'restaurant' | 'landmark' | 'accommodation'
    }
  }
}
