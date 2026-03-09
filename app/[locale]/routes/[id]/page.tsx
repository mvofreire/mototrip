import { notFound } from 'next/navigation'
import { RoutesService } from '@/lib/services/routes.service'
import { RouteHero } from '@/components/features/routes/route-hero'
import { RouteStats } from '@/components/features/routes/route-stats'
import { RouteMap } from '@/components/features/routes/route-map'
import { StopsTimeline } from '@/components/features/routes/stops-timeline'
import { RouteRatings } from '@/components/features/routes/route-ratings'
import { Metadata } from 'next'

interface RoutePageProps {
  params: {
    id: string
    locale: string
  }
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  try {
    const route = await RoutesService.getRouteById(params.id)
    
    return {
      title: route.title,
      description: route.description || `Discover this ${route.category} route in ${route.region}`,
      openGraph: {
        title: route.title,
        description: route.description || undefined,
      },
    }
  } catch {
    return {
      title: 'Route Not Found',
    }
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  let route
  
  try {
    route = await RoutesService.getRouteById(params.id)
  } catch (error) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <RouteHero route={route} />
      
      <div className="container mx-auto py-6 md:py-8 lg:py-12 px-4 max-w-7xl">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
          {/* Main Content */}
          <div className="space-y-6 md:space-y-8 min-w-0">
            {/* Stats */}
            <RouteStats route={route} />

            {/* Description */}
            {route.description && (
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">About This Route</h2>
                <p className="text-muted-foreground leading-relaxed break-words">{route.description}</p>
              </div>
            )}

            {/* Map */}
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">Route Map</h2>
              <RouteMap route={route} />
            </div>

            {/* Stops */}
            {route.stops && route.stops.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">Recommended Stops</h2>
                <StopsTimeline stops={route.stops} />
              </div>
            )}

            {/* Ratings & Reviews */}
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">Reviews</h2>
              <RouteRatings route={route} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 min-w-0">
            {/* This would contain additional info like weather, nearby routes, etc. */}
          </aside>
        </div>
      </div>
    </div>
  )
}
