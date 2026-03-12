import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { SubmitRouteForm } from '@/components/features/routes/submit-route-form'
import { ProtectedRoute } from '@/components/auth/protected-route'

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
    <ProtectedRoute>
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-2 text-center">
              <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
              <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
            </div>

            {/* Form */}
            <SubmitRouteForm locale={locale} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
