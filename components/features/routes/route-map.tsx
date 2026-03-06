'use client'

import { RouteWithDetails } from '@/types'
import { Card } from '@/components/ui/card'

interface RouteMapProps {
  route: RouteWithDetails
}

export function RouteMap({ route }: RouteMapProps) {
  // This is a placeholder for the actual map implementation
  // In production, you would integrate Google Maps or Mapbox here
  
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-sand-100 flex items-center justify-center">
        <div className="text-center space-y-2 p-8">
          <div className="text-muted-foreground">
            <svg
              className="mx-auto h-16 w-16 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <p className="text-sm font-medium">Interactive Map</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            Route visualization with {route.stops?.length || 0} stops • {route.distance_km} km
          </p>
          <p className="text-xs text-muted-foreground italic">
            (Map integration: Google Maps or Mapbox API)
          </p>
        </div>
      </div>
    </Card>
  )
}
