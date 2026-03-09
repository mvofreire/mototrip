'use client'

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps'
import { Card } from '@/components/ui/card'

interface FeaturedRoutesMapProps {
  routes: Array<{
    id: string
    title: string
    polyline_coordinates?: {
      coordinates: [number, number][]
    }
  }>
}

export function FeaturedRoutesMap({ routes }: FeaturedRoutesMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return null // Hide map if no API key
  }

  // Get start points of routes
  const markers = routes
    .filter(route => route.polyline_coordinates?.coordinates?.[0])
    .map(route => {
      const [lng, lat] = route.polyline_coordinates!.coordinates[0]
      return {
        id: route.id,
        position: { lat, lng },
        title: route.title,
      }
    })

  // Default center (Portugal)
  const center = { lat: 39.5, lng: -8.0 }

  return (
    <Card className="overflow-hidden">
      <div className="h-[400px]">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={6}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
            gestureHandling="greedy"
            disableDefaultUI={true}
            zoomControl={true}
            className="w-full h-full"
          >
            {markers.map((marker) => (
              <AdvancedMarker
                key={marker.id}
                position={marker.position}
                title={marker.title}
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
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                }}>
                  🏍️
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>
    </Card>
  )
}
