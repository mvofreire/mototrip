import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Trophy, MapPin, Star } from 'lucide-react'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'riders' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function RidersPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'riders' })

  return (
    <div className="container py-12">
      <div className="max-w-6xl mx-auto">
        <div className="space-y-12">
          {/* Header */}
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          {/* Top Contributors Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-amber-500" />
              <h2 className="text-3xl font-bold">{t('topContributors.title')}</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              {t('topContributors.description')}
            </p>

            {/* Placeholder for top contributors */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-6 rounded-lg border bg-card space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gradient-sunshine flex items-center justify-center text-white font-bold text-xl">
                        #{i}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Rider {i}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('topContributors.member')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{t('topContributors.routes')}</span>
                      </div>
                      <p className="text-2xl font-bold">{15 - i * 2}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4" />
                        <span className="text-sm">{t('topContributors.rating')}</span>
                      </div>
                      <p className="text-2xl font-bold">{(4.8 - i * 0.1).toFixed(1)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Become a Contributor */}
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
