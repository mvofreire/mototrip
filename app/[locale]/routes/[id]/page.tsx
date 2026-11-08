import { notFound } from 'next/navigation'
import { RoutesService } from '@/lib/services/routes.service'
import { RouteHero } from '@/components/features/routes/route-hero'
import { RouteStats } from '@/components/features/routes/route-stats'
import { RouteMap } from '@/components/features/routes/route-map'
import { StopsTimeline } from '@/components/features/routes/stops-timeline'
import { RoutePhotos } from '@/components/features/routes/route-photos'
import { CommentsList } from '@/components/features/comments'
import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

interface RoutePageProps {
  params: {
    id: string
    locale: string
  }
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  try {
    const route = await RoutesService.getRouteById(params.id)
    const t = await getTranslations({ locale: params.locale })
    const description =
      route.description ||
      t('route.metaDescription', {
        category: t(`categories.${route.category}`),
        region: route.region || 'Portugal',
      })
    const cover =
      [...(route.photos ?? [])].sort((a, b) => a.order_index - b.order_index)[0]?.url ||
      route.thumbnail_url

    return {
      title: route.title,
      description,
      alternates: { canonical: `/${params.locale}/routes/${route.id}` },
      openGraph: {
        type: 'article',
        title: route.title,
        description,
        url: `/${params.locale}/routes/${route.id}`,
        images: cover ? [{ url: cover, alt: route.title }] : undefined,
      },
      twitter: {
        card: cover ? 'summary_large_image' : 'summary',
        title: route.title,
        description,
        images: cover ? [cover] : undefined,
      },
    }
  } catch {
    const t = await getTranslations({ locale: params.locale })
    return {
      title: t('route.notFoundTitle'),
    }
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  const t = await getTranslations({ locale: params.locale, namespace: 'route' })
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
          {/* Main Content */}
          <div className="space-y-6 md:space-y-8 min-w-0">
            {/* Stats */}
            <RouteStats route={route} />

            {/* Description */}
            {route.description && (
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">{t('aboutRoute')}</h2>
                <p className="text-muted-foreground leading-relaxed break-words">{route.description}</p>
              </div>
            )}

            {/* Photos */}
            <RoutePhotos route={route} />

            {/* Map */}
            <div className="space-y-3">
              <h2 className="text-xl md:text-2xl font-bold">{t('routeMap')}</h2>
              <RouteMap route={route} />
            </div>

            {/* Stops */}
            {route.stops && route.stops.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-bold">{t('recommendedStops')}</h2>
                <StopsTimeline stops={route.stops} />
              </div>
            )}

            {/* Comments Section */}
            <CommentsList routeId={route.id} locale={params.locale} />
          </div>
      </div>
    </div>
  )
}
