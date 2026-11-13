import { Suspense } from 'react'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RouteCard } from '@/components/features/routes/route-card'
import { ExploreView } from '@/components/features/routes/explore-view'
import { RoutesService } from '@/lib/services/routes.service'

// Served from the edge cache and rebuilt in the background every 10 minutes
export const revalidate = 600

export default async function ExplorePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'explore' })
  const routes = await RoutesService.getRoutes().catch(() => [])

  // The interactive view reads its filters from the URL (useSearchParams), so
  // it only renders in the browser. Until then — and for search engines — the
  // fallback is the full listing rendered on the server, with real links.
  const serverList = (
    <div className="container py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle', { count: routes.length })}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {routes.map((route: any) => (
            <RouteCard key={route.id} route={route} locale={locale} />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <Suspense fallback={serverList}>
      <ExploreView locale={locale} initialRoutes={routes} />
    </Suspense>
  )
}
