export type RouteStatus = 'pending' | 'approved' | 'rejected'
export type BlogPostStatus = 'draft' | 'published' | 'archived'
export type CuratorConfidence = 'high' | 'medium' | 'low'
export type CuratorReviewSource = { title: string; url: string; site?: string; lang?: string }
export type CuratorReviewTranslation = {
  verdict?: string
  highlights?: string[]
  warnings?: string[]
  best_season?: string
}

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
          slug: string
          translations: Record<string, Record<string, string>>
          rating_count: number
          rating_average: number | null
          rating_scenic: number | null
          rating_road: number | null
          rating_fun: number | null
          curator_rating: number | null
          curator_scenic: number | null
          curator_road: number | null
          curator_fun: number | null
          description: string | null
          difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
          distance_km: number
          duration_minutes: number
          elevation_gain_m: number | null
          polyline_coordinates: any // GeoJSON LineString
          region: string | null
          country: string | null
          route_type: 'loop' | 'out_and_back' | null
          thumbnail_url: string | null
          category: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
          featured: boolean
          published: boolean
          status: RouteStatus
          review_note: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          slug?: string
          translations?: Record<string, Record<string, string>>
          description?: string | null
          difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
          distance_km: number
          duration_minutes: number
          elevation_gain_m?: number | null
          polyline_coordinates: any
          region?: string | null
          country?: string | null
          route_type?: 'loop' | 'out_and_back' | null
          thumbnail_url?: string | null
          category: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
          featured?: boolean
          published?: boolean
          status?: RouteStatus
          review_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          slug?: string
          translations?: Record<string, Record<string, string>>
          description?: string | null
          difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert'
          distance_km?: number
          duration_minutes?: number
          elevation_gain_m?: number | null
          polyline_coordinates?: any
          region?: string | null
          country?: string | null
          route_type?: 'loop' | 'out_and_back' | null
          thumbnail_url?: string | null
          category?: 'scenic' | 'mountain' | 'coastal' | 'weekend' | 'adventure'
          featured?: boolean
          published?: boolean
          status?: RouteStatus
          review_note?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
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
          translations: Record<string, Record<string, string>>
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
      route_curator_reviews: {
        Row: {
          route_id: string
          curator_id: string | null
          overall: number
          scenic: number
          road: number
          fun: number
          verdict: string
          highlights: string[]
          warnings: string[]
          best_season: string | null
          translations: Record<string, CuratorReviewTranslation>
          sources: CuratorReviewSource[]
          confidence: CuratorConfidence
          researched_at: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          route_id: string
          curator_id?: string | null
          overall: number
          scenic: number
          road: number
          fun: number
          verdict: string
          highlights?: string[]
          warnings?: string[]
          best_season?: string | null
          translations?: Record<string, CuratorReviewTranslation>
          sources?: CuratorReviewSource[]
          confidence?: CuratorConfidence
          researched_at?: string | null
        }
        Update: {
          curator_id?: string | null
          overall?: number
          scenic?: number
          road?: number
          fun?: number
          verdict?: string
          highlights?: string[]
          warnings?: string[]
          best_season?: string | null
          translations?: Record<string, CuratorReviewTranslation>
          sources?: CuratorReviewSource[]
          confidence?: CuratorConfidence
          researched_at?: string | null
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
      route_comments: {
        Row: {
          id: string
          route_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          slug: string
          status: BlogPostStatus
          cover_route_id: string | null
          cover_image_url: string | null
          cover_image_credit: string | null
          published_at: string | null
          author_id: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          status?: BlogPostStatus
          cover_route_id?: string | null
          cover_image_url?: string | null
          cover_image_credit?: string | null
          published_at?: string | null
        }
        Update: {
          slug?: string
          status?: BlogPostStatus
          cover_route_id?: string | null
          cover_image_url?: string | null
          cover_image_credit?: string | null
          published_at?: string | null
        }
      }
      blog_post_translations: {
        Row: {
          post_id: string
          locale: string
          title: string
          description: string
          body_md: string
          updated_at: string
        }
        Insert: {
          post_id: string
          locale: string
          title: string
          description?: string
          body_md?: string
        }
        Update: {
          title?: string
          description?: string
          body_md?: string
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
