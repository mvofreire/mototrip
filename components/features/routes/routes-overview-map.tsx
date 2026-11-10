'use client'

import { RouteWithDetails } from '@/types'
import { Card } from '@/components/ui/card'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Map } from '@/components/features/maps/map'
import { routePath } from '@/lib/route-url'
import { localizeRoute } from '@/lib/localize'

interface RoutesOverviewMapProps {
  routes: RouteWithDetails[]
  locale: string
}

export function RoutesOverviewMap({ routes: original, locale }: RoutesOverviewMapProps) {
  const routes = useMemo(() => original.map((r) => localizeRoute(r, locale)), [original, locale])
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)

  // Calculate center point from all routes
  const center = useMemo(() => {
    if (routes.length === 0) {
      return { lat: 40.4168, lng: -3.7038 } // Madrid default
    }

    const allCoords = routes.flatMap(route => {
      if (route.polyline_coordinates?.coordinates) {
        return route.polyline_coordinates.coordinates.map(
          ([lng, lat]: [number, number]) => ({ lat, lng })
        )
      }
      return []
    })

    if (allCoords.length === 0) {
      return { lat: 40.4168, lng: -3.7038 }
    }

    const avgLat = allCoords.reduce((sum, coord) => sum + coord.lat, 0) / allCoords.length
    const avgLng = allCoords.reduce((sum, coord) => sum + coord.lng, 0) / allCoords.length

    return { lat: avgLat, lng: avgLng }
  }, [routes])

  // Get start point for each route
  const routeMarkers = useMemo(() => {
    return routes
      .filter(route => route.polyline_coordinates?.coordinates?.[0])
      .map(route => {
        const [lng, lat] = route.polyline_coordinates.coordinates[0]
        return {
          id: route.id,
          position: { lat, lng },
          title: route.title,
          difficulty: route.difficulty,
          distance: route.distance_km,
          category: route.category,
        }
      })
  }, [routes])

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
