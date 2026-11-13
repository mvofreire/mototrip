import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { buildAlternates } from '@/lib/seo'
import { Trophy, MapPin, Gauge } from 'lucide-react'
import { RoutesService } from '@/lib/services/routes.service'

// Served from the edge cache and rebuilt in the background every hour
export const revalidate = 3600

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'riders' })

  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/riders'),
  }
}

export default async function RidersPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: 'riders' })

  let contributors: Awaited<ReturnType<typeof RoutesService.getTopContributors>> = []
  try {
    contributors = await RoutesService.getTopContributors(6)
  } catch (error) {
    console.error('Error fetching contributors:', error)
  }
  const nf = new Intl.NumberFormat(locale)

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

            {contributors.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                {t('topContributors.empty')}
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {contributors.map((c, i) => (
                  <div key={c.id} className="p-6 rounded-lg border bg-card space-y-4">
                    <div className="flex items-center gap-4">
                      {c.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-xl">
                          #{i + 1}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{c.full_name || 'MotoTrip'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {t('topContributors.memberSince', { year: new Date(c.created_at).getFullYear() })}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{t('topContributors.routes')}</span>
                        </div>
                        <p className="text-2xl font-bold">{nf.format(c.routes)}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Gauge className="h-4 w-4" />
                          <span className="text-sm">{t('topContributors.km')}</span>
                        </div>
                        <p className="text-2xl font-bold">{nf.format(c.km)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Become a Contributor */}
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
        </div>
      </div>
    </div>
  )
}
