import { notFound } from 'next/navigation'
import { mockRoutes } from '@/lib/mock-data'
import { RouteHero } from '@/components/features/routes/route-hero'
import { RouteStats } from '@/components/features/routes/route-stats'
import { RouteMap } from '@/components/features/routes/route-map'
import { StopsTimeline } from '@/components/features/routes/stops-timeline'
import { RouteRatings } from '@/components/features/routes/route-ratings'
import { Metadata } from 'next'

interface RoutePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  const route = mockRoutes.find(r => r.id === params.id)
  
  if (!route) {
    return {
      title: 'Route Not Found',
    }
  }

  return {
    title: route.title,
    description: route.description || `Discover this ${route.category} route in ${route.region}`,
    openGraph: {
      title: route.title,
      description: route.description || undefined,
    },
  }
}

export default function RoutePage({ params }: RoutePageProps) {
  const route = mockRoutes.find(r => r.id === params.id)

  if (!route) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      <RouteHero route={route} />
      
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Stats */}
            <RouteStats route={route} />

            {/* Description */}
            {route.description && (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">About This Route</h2>
                <p className="text-muted-foreground leading-relaxed">{route.description}</p>
              </div>
            )}

            {/* Map */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Route Map</h2>
              <RouteMap route={route} />
            </div>

            {/* Stops */}
            {route.stops && route.stops.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Recommended Stops</h2>
                <StopsTimeline stops={route.stops} />
              </div>
            )}

            {/* Ratings & Reviews */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <RouteRatings route={route} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* This would contain additional info like weather, nearby routes, etc. */}
          </aside>
        </div>
      </div>
    </div>
  )
}
