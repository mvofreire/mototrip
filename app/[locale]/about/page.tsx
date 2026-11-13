import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo'
import { MapPin, Users, Heart, Globe, Instagram, Facebook } from 'lucide-react'
import { INSTAGRAM, FACEBOOK } from '@/lib/social'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'about' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/about'),
  }
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  setRequestLocale(locale)

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
                <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.community.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.community.description')}
                </p>
              </div>

              {/* Safety */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.safety.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.safety.description')}
                </p>
              </div>

              {/* Adventure */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold">{t('values.adventure.title')}</h3>
                <p className="text-muted-foreground">
                  {t('values.adventure.description')}
                </p>
              </div>

              {/* Global */}
              <div className="space-y-3 p-6 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-lg bg-gradient-brand flex items-center justify-center">
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
          <section className="rounded-lg bg-gradient-brand p-8 text-center text-white">
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

          {/* Instagram */}
          <section className="flex flex-col items-center gap-4 rounded-lg border bg-card p-8 text-center sm:flex-row sm:text-left">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600">
              <Instagram className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 space-y-1">
              <h2 className="text-xl font-bold">{t('instagram.title')}</h2>
              <p className="text-muted-foreground">{t('instagram.description')}</p>
            </div>
            <div className="flex flex-col gap-2 sm:items-stretch">
              <a
                href={INSTAGRAM.url}
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center justify-center gap-2 rounded-md border px-5 py-2.5 font-semibold hover:bg-muted transition-colors"
              >
                <Instagram className="h-4 w-4" />
                @{INSTAGRAM.handle}
              </a>
              <a
                href={FACEBOOK.url}
                target="_blank"
                rel="noopener noreferrer me"
                className="inline-flex items-center justify-center gap-2 rounded-md border px-5 py-2.5 font-semibold hover:bg-muted transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
