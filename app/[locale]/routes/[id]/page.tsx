import { permanentRedirect } from 'next/navigation'
import { RoutesService } from '@/lib/services/routes.service'
import { isUuid, routePath } from '@/lib/route-url'
import { routeStructuredData } from '@/lib/route-structured-data'
import { localizeRoute } from '@/lib/localize'
import { RouteDetail } from '@/components/features/routes/route-detail'
import { PrivateRouteDetail } from '@/components/features/routes/private-route-detail'
import { Metadata } from 'next'
import { languageAlternates } from '@/lib/seo'
import { getTranslations, setRequestLocale } from 'next-intl/server'

// Served from the edge cache and rebuilt in the background every 5 minutes
export const revalidate = 300

// No route is built ahead of time: each one is rendered on its first visit and
// then served from the cache (an empty list is what turns that on)
export function generateStaticParams() {
  return []
}

interface RoutePageProps {
  params: {
    id: string
    locale: string
  }
}

export async function generateMetadata({ params }: RoutePageProps): Promise<Metadata> {
  try {
    const route = localizeRoute(await RoutesService.getRouteByIdOrSlug(params.id), params.locale)
    const t = await getTranslations({ locale: params.locale })
    const description =
      route.description ||
      t('route.metaDescription', {
        category: t(`categories.${route.category}`),
        region: route.region || 'Portugal',
      })
    return {
      title: route.title,
      description,
      alternates: {
        canonical: routePath(params.locale, route),
        languages: languageAlternates((l) => routePath(l, route)),
      },
      openGraph: {
        type: 'article',
        title: route.title,
        description,
        url: routePath(params.locale, route),
        // image: opengraph-image.tsx next to this page
      },
      twitter: {
        card: 'summary_large_image',
        title: route.title,
        description,
      },
    }
  } catch {
    // Missing, or not public yet (its author/staff still see it client-side)
    return {
      title: 'MotoTrip',
      robots: { index: false },
    }
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  setRequestLocale(params.locale)

  let route
  try {
    route = await RoutesService.getRouteByIdOrSlug(params.id)
  } catch {
    // Not public (or doesn't exist): its author/staff may still see it
    return <PrivateRouteDetail id={params.id} locale={params.locale} />
  }

  // Old /routes/<uuid> links move permanently to the readable URL
  if (isUuid(params.id) && route.slug) {
    permanentRedirect(routePath(params.locale, route))
  }

  route = localizeRoute(route, params.locale)
  const t = await getTranslations({ locale: params.locale })
  const jsonLd = routeStructuredData(route, params.locale, {
    destinations: t('regions.allDestinations'),
    distance: t('route.distance'),
    duration: t('route.duration'),
    elevation: t('route.elevation'),
  })

  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so route text can't close the script tag
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <RouteDetail route={route} locale={params.locale} />
    </>
  )
}
