import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import { NO_INDEX } from '@/lib/seo'
import { RouteWizard } from '@/components/features/routes/submit/route-wizard'
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
    robots: NO_INDEX,
  }
}

export default async function SubmitRoutePage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  setRequestLocale(locale)

  return (
    <ProtectedRoute>
      <div className="mx-auto w-full max-w-[1240px] px-4 pb-10 pt-8 sm:px-6 sm:pt-12">
        <RouteWizard locale={locale} />
      </div>
    </ProtectedRoute>
  )
}
