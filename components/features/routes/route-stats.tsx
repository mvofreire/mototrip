import { RouteWithDetails } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Mountain, Star, TrendingUp, Navigation } from 'lucide-react'
import { formatDistance, formatDuration, formatElevation, formatRating } from '@/lib/utils'

interface RouteStatsProps {
  route: RouteWithDetails
}

export function RouteStats({ route }: RouteStatsProps) {
  const stats = [
    {
      icon: Navigation,
      label: 'Distance',
      value: formatDistance(route.distance_km),
    },
    {
      icon: Clock,
      label: 'Duration',
      value: formatDuration(route.duration_minutes),
    },
    {
      icon: Mountain,
      label: 'Elevation Gain',
      value: route.elevation_gain_m ? formatElevation(route.elevation_gain_m) : 'N/A',
    },
    {
      icon: MapPin,
      label: 'Region',
      value: route.region || 'Unknown',
    },
  ]

  const ratings = [
    {
      label: 'Scenic',
      value: route.scenic_score,
    },
    {
      label: 'Road Quality',
      value: route.road_quality_score,
    },
    {
      label: 'Fun Factor',
      value: route.fun_factor_score,
    },
  ]

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardContent className="pt-4 md:pt-6 p-3 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-lg bg-sunshine-orange-100 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-sunshine-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <p className="text-sm md:text-lg font-semibold truncate">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ratings */}
      <Card className="overflow-hidden">
        <CardContent className="pt-4 md:pt-6 p-4 md:p-6">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Star className="h-5 w-5 shrink-0 fill-sunshine-yellow-400 text-sunshine-yellow-400" />
              <span className="text-xl md:text-2xl font-bold">
                {route.average_rating ? formatRating(route.average_rating) : 'N/A'}
              </span>
              {route.rating_count && (
                <span className="text-sm text-muted-foreground">
                  ({route.rating_count} reviews)
                </span>
              )}
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {ratings.map((rating, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground truncate">{rating.label}</span>
                    <span className="font-semibold shrink-0">{formatRating(rating.value)}</span>
                  </div>
                  <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-sunshine transition-all"
                      style={{ width: `${(rating.value / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
