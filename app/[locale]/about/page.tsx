import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { MapPin, Users, Heart, Globe } from 'lucide-react'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'about' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Mission Section */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">{t('mission.title')}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('mission.description')}
            </p>
          </section>

          {/* Values Grid */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">{t('values.title')}</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Community */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.community.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.community.description')}
                </p>
              </div>

              {/* Safety */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.safety.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.safety.description')}
                </p>
              </div>

              {/* Adventure */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.adventure.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.adventure.description')}
                </p>
              </div>

              {/* Global */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-sunshine flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.global.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.global.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Story Section */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">{t('story.title')}</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{t('story.paragraph1')}</p>
              <p>{t('story.paragraph2')}</p>
              <p>{t('story.paragraph3')}</p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="rounded-lg bg-gradient-sunshine p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-lg mb-6 opacity-90">
              {t('cta.description')}
            </p>
            <a
              href={`/${locale}/submit`}
              className="inline-flex items-center justify-center rounded-md bg-white text-gray-900 px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
            >
              {t('cta.button')}
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
