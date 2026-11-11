import { RouteWithDetails } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Clock, Mountain, Navigation } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { regionLabel } from '@/lib/regions'
import { formatDistance, formatDuration, formatElevation } from '@/lib/utils'

interface RouteStatsProps {
  route: RouteWithDetails
}

export function RouteStats({ route }: RouteStatsProps) {
  const t = useTranslations()
  const locale = useLocale()
  const stats = [
    {
      icon: Navigation,
      label: t('route.distance'),
      value: formatDistance(route.distance_km),
    },
    {
      icon: Clock,
      label: t('route.duration'),
      value: formatDuration(route.duration_minutes),
    },
    {
      icon: Mountain,
      label: t('route.elevation'),
      value: route.elevation_gain_m ? formatElevation(route.elevation_gain_m) : t('route.notAvailable'),
    },
    {
      icon: MapPin,
      label: t('route.region'),
      value: regionLabel(route, locale) || t('route.unknown'),
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
                <div className="h-8 w-8 md:h-10 md:w-10 shrink-0 rounded-lg bg-brand-500/15 flex items-center justify-center">
                  <stat.icon className="h-4 w-4 md:h-5 md:w-5 text-brand-500" />
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
    </div>
  )
}
