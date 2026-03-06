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
    <div className="space-y-6">
      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-sunshine-orange-100 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-sunshine-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ratings */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-sunshine-yellow-400 text-sunshine-yellow-400" />
              <span className="text-2xl font-bold">
                {route.average_rating ? formatRating(route.average_rating) : 'N/A'}
              </span>
              {route.rating_count && (
                <span className="text-sm text-muted-foreground">
                  ({route.rating_count} reviews)
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {ratings.map((rating, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{rating.label}</span>
                    <span className="font-semibold">{formatRating(rating.value)}</span>
                  </div>
                  <div className="h-2 bg-sand-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-sunshine"
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
