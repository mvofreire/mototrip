'use client'

import { localizeCard, type RouteCardData } from '@/lib/routes/card'
import { Card } from '@/components/ui/card'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Map } from '@/components/features/maps/map'
import { routePath } from '@/lib/route-url'

interface RoutesOverviewMapProps {
  /** Card data (lib/routes/card.ts): only the start point of each track is used */
  routes: RouteCardData[]
  locale: string
}

export function RoutesOverviewMap({ routes: original, locale }: RoutesOverviewMapProps) {
  const routes = useMemo(() => original.map((r) => localizeCard(r, locale)), [original, locale])
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  // One marker per route, at the start of its track
  const routeMarkers = useMemo(
    () =>
      routes
        .filter((route) => route.start)
        .map((route) => {
          const [lng, lat] = route.start!
          return { id: route.id, position: { lat, lng }, title: route.title }
        }),
    [routes],
  )

  // Centre on the average start point
  const center = useMemo(() => {
    if (routeMarkers.length === 0) return { lat: 40.4168, lng: -3.7038 } // Madrid default
    const lat = routeMarkers.reduce((sum, m) => sum + m.position.lat, 0) / routeMarkers.length
    const lng = routeMarkers.reduce((sum, m) => sum + m.position.lng, 0) / routeMarkers.length
    return { lat, lng }
  }, [routeMarkers])

  return (
    <Card className="overflow-hidden">
      <div className="h-96">
        <Map
          center={center}
          zoom={6}
          scrollWheelZoom
          markers={routeMarkers.map((m) => ({
            id: m.id,
            position: m.position,
            title: m.title,
            variant: 'logo' as const,
            size: 30,
            onClick: () => setSelectedRoute(m.id),
          }))}
        />
      </div>

      {/* Info panel when route is selected */}
      {selectedRoute && (() => {
        const route = routes.find(r => r.id === selectedRoute)
        if (!route) return null

        return (
          <div className="p-4 border-t">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Link 
                  href={routePath(locale, route)}
                  className="text-sm font-semibold hover:underline"
                >
                  {route.title}
                </Link>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {route.distance_km} km
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {route.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {route.category}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoute(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })()}
    </Card>
  )
}
