import { RoutesService } from '@/lib/services/routes.service'
import { RouteDetail } from '@/components/features/routes/route-detail'
import { PrivateRouteDetail } from '@/components/features/routes/private-route-detail'
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
    // Missing, or not public yet (its author/staff still see it client-side)
    return {
      title: 'MotoTrip',
      robots: { index: false },
    }
  }
}

export default async function RoutePage({ params }: RoutePageProps) {
  let route
  try {
    route = await RoutesService.getRouteById(params.id)
  } catch {
    // Not public (or doesn't exist): its author/staff may still see it
    return <PrivateRouteDetail id={params.id} locale={params.locale} />
  }

  return <RouteDetail route={route} locale={params.locale} />
}
