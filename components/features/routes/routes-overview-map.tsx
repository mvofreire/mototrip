'use client'

import { RouteWithDetails } from '@/types'
import { Card } from '@/components/ui/card'
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface RoutesOverviewMapProps {
  routes: RouteWithDetails[]
  locale: string
}

export function RoutesOverviewMap({ routes, locale }: RoutesOverviewMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
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

  if (!apiKey) {
    return (
      <Card className="overflow-hidden">
        <div className="h-96 bg-sand-100 flex items-center justify-center">
          <div className="text-center space-y-2 p-8">
            <p className="text-sm font-medium text-destructive">Google Maps API Key Missing</p>
            <p className="text-xs text-muted-foreground max-w-sm">
              Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-96">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={6}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={true}
            zoomControl={true}
            className="w-full h-full"
          >
            {routeMarkers.map((marker) => (
              <AdvancedMarker
                key={marker.id}
                position={marker.position}
                title={marker.title}
                onClick={() => setSelectedRoute(marker.id)}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  border: '3px solid #d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  cursor: 'pointer'
                }}>
                  🏍️
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
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
                  href={`/${locale}/routes/${route.id}`}
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
