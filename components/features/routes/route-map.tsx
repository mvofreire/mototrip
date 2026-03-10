'use client'

import { RouteWithDetails } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { APIProvider, Map, AdvancedMarker, Marker, useMap } from '@vis.gl/react-google-maps'
import { useMemo, useEffect } from 'react'
import { Download, MapIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface RouteMapProps {
  route: RouteWithDetails
}

// Component to draw the route polyline
function RoutePolyline({ coordinates }: { coordinates: Array<{ lat: number; lng: number }> }) {
  const map = useMap()

  useEffect(() => {
    if (!map || coordinates.length < 2) return

    const polyline = new google.maps.Polyline({
      path: coordinates,
      geodesic: true,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    })

    polyline.setMap(map)

    // Calculate bounds to fit the entire route
    const bounds = new google.maps.LatLngBounds()
    coordinates.forEach(coord => {
      bounds.extend(coord)
    })

    // Fit map to show the entire route with some padding
    map.fitBounds(bounds, {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    })

    return () => {
      polyline.setMap(null)
    }
  }, [map, coordinates])

  return null
}

export function RouteMap({ route }: RouteMapProps) {
  const t = useTranslations('route')
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Extract coordinates from polyline
  const coordinates = useMemo(() => {
    if (route.polyline_coordinates?.coordinates) {
      return route.polyline_coordinates.coordinates.map(
        ([lng, lat]: [number, number]) => ({ lat, lng })
      )
    }
    return []
  }, [route.polyline_coordinates])

  // Calculate center point
  const center = useMemo(() => {
    if (coordinates.length === 0) {
      return { lat: 40.4168, lng: -3.7038 } // Madrid default
    }
    
    const avgLat = coordinates.reduce((sum: number, coord: { lat: number; lng: number }) => sum + coord.lat, 0) / coordinates.length
    const avgLng = coordinates.reduce((sum: number, coord: { lat: number; lng: number }) => sum + coord.lng, 0) / coordinates.length
    
    return { lat: avgLat, lng: avgLng }
  }, [coordinates])

  // Function to generate and download GPX from route coordinates
  const handleDownloadGPX = () => {
    if (coordinates.length === 0) {
      alert('No route coordinates available')
      return
    }

    try {
      // Generate GPX content
      const gpxContent = generateGPXFromCoordinates(coordinates, route.title, route.description || '')
      
      // Create blob and download
      const blob = new Blob([gpxContent], { type: 'application/gpx+xml' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${route.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error generating GPX:', error)
      alert('Failed to generate GPX file')
    }
  }

  // Helper function to generate GPX XML from coordinates
  const generateGPXFromCoordinates = (coords: Array<{ lat: number; lng: number }>, title: string, description: string) => {
    const gpxHeader = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="MotoTrip" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${escapeXml(title)}</name>
    <desc>${escapeXml(description)}</desc>
  </metadata>
  <trk>
    <name>${escapeXml(title)}</name>
    <trkseg>`

    const trackPoints = coords.map(coord => 
      `      <trkpt lat="${coord.lat}" lon="${coord.lng}"></trkpt>`
    ).join('\n')

    const gpxFooter = `
    </trkseg>
  </trk>
</gpx>`

    return gpxHeader + '\n' + trackPoints + gpxFooter
  }

  // Helper function to escape XML special characters
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;'
        case '>': return '&gt;'
        case '&': return '&amp;'
        case '\'': return '&apos;'
        case '"': return '&quot;'
        default: return c
      }
    })
  }

  // Function to open in Google Maps
  const handleOpenInGoogleMaps = () => {
    if (coordinates.length === 0) {
      alert('No route coordinates available')
      return
    }

    // Create Google Maps URL with waypoints
    const start = coordinates[0]
    const end = coordinates[coordinates.length - 1]
    
    // For routes with many points, we'll just use start and end
    // Google Maps has a limit on waypoints in URLs
    const url = `https://www.google.com/maps/dir/?api=1&origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&travelmode=driving`
    
    window.open(url, '_blank')
  }

  if (!apiKey) {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-video bg-destructive/10 flex items-center justify-center">
          <div className="text-center space-y-3 p-8 max-w-md">
            <div className="text-destructive text-4xl mb-2">⚠️</div>
            <p className="text-sm font-semibold text-destructive">Google Maps API Key não configurada</p>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Adicione a variável de ambiente:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-chave-aqui
              </code>
              <p className="pt-2">no arquivo <strong>.env.local</strong></p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Show API key info (only first/last chars for security)
  const keyPreview = `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="aspect-video relative">
          {/* Debug info overlay */}
          <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs p-2 rounded">
            Key: {keyPreview}
          </div>
          
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={10}
              mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapTypeControl={false}
              streetViewControl={false}
              fullscreenControl={true}
              zoomControl={true}
              className="w-full h-full"
            >
              {/* Draw the route line */}
              <RoutePolyline coordinates={coordinates} />

              {/* Add end marker */}
              {coordinates.length > 1 && (
                <AdvancedMarker
                  position={coordinates[coordinates.length - 1]}
                  title="End"
                  zIndex={10}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '3px solid #dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                    transform: 'translate(12px, 0)' // Offset to the right
                  }}>
                    E
                  </div>
                </AdvancedMarker>
              )}

              {/* Add start marker */}
              {coordinates.length > 0 && (
                <AdvancedMarker
                  position={coordinates[0]}
                  title="Start"
                  zIndex={20}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '3px solid #16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                    transform: 'translate(-12px, 0)' // Offset to the left
                  }}>
                    S
                  </div>
                </AdvancedMarker>
              )}

              {/* Add markers for stops */}
              {route.stops?.map((stop, index) => (
                <Marker
                  key={stop.id}
                  position={{
                    lat: Number(stop.latitude),
                    lng: Number(stop.longitude),
                  }}
                  title={stop.name}
                  label={{
                    text: String(index + 1),
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
              ))}
            </Map>
          </APIProvider>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleDownloadGPX}
          variant="outline"
          className="flex-1 sm:flex-initial"
          disabled={coordinates.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          {t('downloadGPX')}
        </Button>
        <Button
          onClick={handleOpenInGoogleMaps}
          variant="outline"
          className="flex-1 sm:flex-initial"
          disabled={coordinates.length === 0}
        >
          <MapIcon className="h-4 w-4 mr-2" />
          {t('openInGoogleMaps')}
        </Button>
      </div>
    </div>
  )
}
