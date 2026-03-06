import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'submit' })

  return {
    title: t('title'),
    description: t('subtitle'),
  }
}

export default async function SubmitRoutePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const t = await getTranslations({ locale, namespace: 'submit' })

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
          </div>

          {/* Placeholder for route submission form */}
          <div className="border-2 border-dashed border-sand-300 rounded-lg p-12 text-center">
            <div className="space-y-3">
              <div className="text-4xl">🗺️</div>
              <h3 className="text-xl font-semibold">{t('formTitle')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t('formDescription')}
              </p>
              <p className="text-sm text-muted-foreground italic">
                {t('toBeImplemented')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
