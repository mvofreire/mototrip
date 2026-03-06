import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, MapPin, Users, Star, Navigation, Map, MessageCircle } from 'lucide-react'
import { RouteCard } from '@/components/features/routes/route-card'
import { mockRoutes } from '@/lib/mock-data'
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
  
  const featuredRoutes = mockRoutes.filter((route) => route.featured).slice(0, 3)
  const popularRoutes = mockRoutes.slice(0, 6)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <Section variant="hero" padding="hero" withRadialGradient>
        <SectionContainer relative>
          <SectionContent centered maxWidth="3xl" className="space-y-8">
            <SectionHeader>
              <SectionTitle as="h1">
                {t('hero.title')}
                <span className="block mt-2 text-gradient-sunshine text-transparent">
                  {t('hero.titleHighlight')}
                </span>
              </SectionTitle>
              <SectionDescription size="lg" className="max-w-2xl mx-auto">
                {t('hero.subtitle')}
              </SectionDescription>
            </SectionHeader>

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
          </SectionContent>
        </SectionContainer>
      </Section>

      {/* Clarification Section */}
      <Section variant="clarification">
        <SectionContainer>
          <SectionContent centered maxWidth="4xl" className="space-y-12">
            <SectionHeader className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-sunshine-orange-100 dark:bg-sunshine-orange-500/10 rounded-full mb-4">
                <Navigation className="h-8 w-8 text-sunshine-orange-500" strokeWidth={2.5} />
              </div>
              <SectionTitle as="h2">
                {t('clarification.title')}
              </SectionTitle>
              <p className="text-lg text-sunshine-orange-600 dark:text-sunshine-orange-400 font-medium">
                {t('clarification.subtitle')}
              </p>
              <SectionDescription className="max-w-2xl mx-auto leading-relaxed">
                {t('clarification.description')}
              </SectionDescription>
            </SectionHeader>

            <SectionGrid cols={3}>
              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="p-3 bg-sunshine-yellow-100 dark:bg-sunshine-yellow-500/10 rounded-full">
                  <Star className="h-6 w-6 text-sunshine-yellow-600 dark:text-sunshine-yellow-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('clarification.feature1Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('clarification.feature1Desc')}</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="p-3 bg-sunshine-pink-100 dark:bg-sunshine-pink-500/10 rounded-full">
                  <Map className="h-6 w-6 text-sunshine-pink-600 dark:text-sunshine-pink-400" />
                </div>
                <h3 className="font-semibold text-lg">{t('clarification.feature2Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('clarification.feature2Desc')}</p>
              </div>

              <div className="flex flex-col items-center text-center space-y-3 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="p-3 bg-sunshine-coral-100 dark:bg-sunshine-coral-500/10 rounded-full">
                  <MessageCircle className="h-6 w-6 text-sunshine-coral-600 dark:text-sunshine-coral-400" />
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
              <Button size="lg" asChild className="bg-gradient-sunshine hover:opacity-90">
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

