import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations({ locale: params.locale, namespace: 'password' })

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('forgotTitle')}</CardTitle>
          <CardDescription>{t('forgotDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm locale={params.locale} />
        </CardContent>
      </Card>
    </div>
  )
}
