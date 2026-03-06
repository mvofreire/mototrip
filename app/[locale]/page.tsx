import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, MapPin, Users, Star } from 'lucide-react'
import { RouteCard } from '@/components/features/routes/route-card'
import { mockRoutes } from '@/lib/mock-data'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'home' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  
  const featuredRoutes = mockRoutes.filter((route) => route.featured).slice(0, 3)
  const popularRoutes = mockRoutes.slice(0, 6)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-sand-50 to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(252,211,77,0.1),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(251,146,60,0.1),transparent_50%)]" />

        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                {t('hero.title')}
                <span className="block mt-2 bg-gradient-sunshine bg-clip-text text-transparent">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                {t('hero.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-sunshine hover:opacity-90">
                <Link href={`/${locale}/explore`}>
                  {t('hero.exploreRoutes')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/submit`}>
                  {t('hero.submitRoute')}
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 max-w-xl mx-auto">
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sunshine-orange-500">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">1,200+</div>
                <div className="text-sm text-muted-foreground">{t('stats.routes')}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sunshine-pink-500">
                  <Users className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">25K+</div>
                <div className="text-sm text-muted-foreground">{t('stats.riders')}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2 text-sunshine-yellow-500">
                  <Star className="h-5 w-5" />
                </div>
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-muted-foreground">{t('stats.reviews')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Routes Section */}
      <section className="container py-16 md:py-24">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{t('featured.title')}</h2>
              <p className="text-muted-foreground">{t('featured.subtitle')}</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/explore`}>
                {t('featured.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredRoutes.map((route) => (
              <RouteCard key={route.id} route={route} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="border-t bg-sand-50/50">
        <div className="container py-16 md:py-24">
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">{t('popular.title')}</h2>
              <p className="text-muted-foreground">{t('popular.subtitle')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {popularRoutes.map((route) => (
                <RouteCard key={route.id} route={route} locale={locale} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="container py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t('cta.title')}
              </h2>
              <p className="text-lg text-muted-foreground">{t('cta.subtitle')}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-sunshine hover:opacity-90">
                <Link href={`/${locale}/explore`}>{t('cta.startExploring')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/submit`}>{t('cta.submitYourRoute')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
