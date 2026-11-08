import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, MapPin, Gauge, Mountain, Star, Navigation, Map, MessageCircle } from 'lucide-react'
import { RouteCard } from '@/components/features/routes/route-card'
import { RoutesService } from '@/lib/services/routes.service'
import {
  Section,
  SectionContainer,
  SectionContent,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  SectionGrid,
} from '@/components/ui/section'

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'home' })
  const tNav = await getTranslations({ locale, namespace: 'nav' })
  
  // Fetch featured and popular routes from database
  let featuredRoutes: any[] = []
  let popularRoutes: any[] = []
  let stats = { routes: 0, km: 0, regions: 0 }
  
  try {
    featuredRoutes = await RoutesService.getFeaturedRoutes(3)
    popularRoutes = await RoutesService.getRoutes({}, { field: 'created_at', direction: 'desc' })
    popularRoutes = popularRoutes.slice(0, 6)
    stats = await RoutesService.getStats()
  } catch (error) {
    console.error('Error fetching routes:', error)
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Section variant="hero" padding="hero" withRadialGradient>
        <SectionContainer relative>
          <SectionContent centered maxWidth="3xl" className="space-y-8">
            <SectionHeader>
              <SectionTitle as="h1">
                {t('hero.title')}
                <span className="block mt-2 text-gradient-brand text-transparent">
                  {t('hero.titleHighlight')}
                </span>
              </SectionTitle>
              <SectionDescription size="lg" className="max-w-2xl mx-auto">
                {t('hero.subtitle')}
              </SectionDescription>
            </SectionHeader>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-brand hover:opacity-90">
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

            {/* Stats (real totals) */}
            {stats.routes > 0 && (
              <div className="grid grid-cols-3 gap-8 pt-8 max-w-xl mx-auto">
                {[
                  { icon: MapPin, value: stats.routes, label: t('stats.routes') },
                  { icon: Gauge, value: stats.km, label: t('stats.km') },
                  { icon: Mountain, value: stats.regions, label: t('stats.regions') },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-center gap-2 text-brand-500">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-display text-3xl font-bold">
                      {new Intl.NumberFormat(locale).format(value)}
                    </div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </SectionContent>
        </SectionContainer>
      </Section>

      {/* Clarification Section */}
      <Section variant="clarification">
        <SectionContainer>
          <SectionContent centered maxWidth="4xl" className="space-y-12">
            <SectionHeader className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-brand-500/10 rounded-full mb-4">
                <Navigation className="h-8 w-8 text-brand-500" strokeWidth={2.5} />
              </div>
              <SectionTitle as="h2">
                {t('clarification.title')}
              </SectionTitle>
              <p className="text-lg text-brand-600 dark:text-brand-400 font-medium">
                {t('clarification.subtitle')}
              </p>
              <SectionDescription className="max-w-2xl mx-auto leading-relaxed">
                {t('clarification.description')}
              </SectionDescription>
            </SectionHeader>

            <SectionGrid cols={3}>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="p-3 bg-steel-500/10 rounded-full">
                  <Star className="h-6 w-6 text-steel-600 dark:text-steel-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('clarification.feature1Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('clarification.feature1Desc')}</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="p-3 bg-steel-500/10 rounded-full">
                  <Map className="h-6 w-6 text-steel-600 dark:text-steel-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('clarification.feature2Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('clarification.feature2Desc')}</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="p-3 bg-brand-500/10 rounded-full">
                  <MessageCircle className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('clarification.feature3Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('clarification.feature3Desc')}</p>
              </div>
            </SectionGrid>
          </SectionContent>
        </SectionContainer>
      </Section>

      {/* Featured Routes Section */}
      <Section variant="ghost">
        <SectionContainer className="space-y-8">
          <div className="flex items-center justify-between">
            <SectionHeader>
              <SectionTitle as="h2">{t('featured.title')}</SectionTitle>
              <SectionDescription>{t('featured.subtitle')}</SectionDescription>
            </SectionHeader>
            <Button variant="ghost" asChild>
              <Link href={`/${locale}/explore`}>
                {t('featured.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <SectionGrid cols={3}>
            {featuredRoutes.map((route) => (
              <RouteCard key={route.id} route={route} locale={locale} />
            ))}
          </SectionGrid>
        </SectionContainer>
      </Section>

      {/* Popular Routes Section */}
      <Section variant="default">
        <SectionContainer className="space-y-8">
          <SectionHeader>
            <SectionTitle as="h2">{t('popular.title')}</SectionTitle>
            <SectionDescription>{t('popular.subtitle')}</SectionDescription>
          </SectionHeader>

          <SectionGrid cols={3}>
            {popularRoutes.map((route) => (
              <RouteCard key={route.id} route={route} locale={locale} />
            ))}
          </SectionGrid>
        </SectionContainer>
      </Section>

      {/* CTA Section */}
      <Section variant="ghost" className="border-t">
        <SectionContainer>
          <SectionContent centered maxWidth="3xl" className="space-y-8">
            <SectionHeader>
              <SectionTitle as="h2">
                {t('cta.title')}
              </SectionTitle>
              <SectionDescription size="lg">{t('cta.subtitle')}</SectionDescription>
            </SectionHeader>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-brand hover:opacity-90">
                <Link href={`/${locale}/explore`}>{t('cta.startExploring')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={`/${locale}/submit`}>{t('cta.submitYourRoute')}</Link>
              </Button>
            </div>
          </SectionContent>
        </SectionContainer>
      </Section>
    </div>
  )
}

