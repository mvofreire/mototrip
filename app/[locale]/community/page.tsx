import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'community' })

  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function CommunityPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'community' })

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
          </div>

          {/* Placeholder for community features */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-2 border-dashed border-sand-300 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-3xl">👥</div>
                <h3 className="text-lg font-semibold">{t('topContributors')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('topContributorsDesc')}
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-sand-300 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-3xl">🏆</div>
                <h3 className="text-lg font-semibold">{t('featuredRiders')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('featuredRidersDesc')}
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-sand-300 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-3xl">📸</div>
                <h3 className="text-lg font-semibold">{t('photoGallery')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('photoGalleryDesc')}
                </p>
              </div>
            </div>

            <div className="border-2 border-dashed border-sand-300 rounded-lg p-8 text-center">
              <div className="space-y-3">
                <div className="text-3xl">💬</div>
                <h3 className="text-lg font-semibold">{t('discussions')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('discussionsDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
