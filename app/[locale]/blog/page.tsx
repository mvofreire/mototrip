import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'blog' })

  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function BlogPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'blog' })

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
          </div>

          {/* Placeholder for blog */}
          <div className="border-2 border-dashed border-sand-300 rounded-lg p-16 text-center">
            <div className="space-y-4">
              <div className="text-5xl">📝</div>
              <h2 className="text-2xl font-bold">{t('comingSoon')}</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('comingSoonDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
