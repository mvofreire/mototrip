import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RegisterForm } from '@/components/auth/register-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function RegisterPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations({ locale: params.locale, namespace: 'account' })

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t('registerTitle')}</CardTitle>
          <CardDescription>{t('registerDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm locale={params.locale} />
        </CardContent>
      </Card>
    </div>
  )
}
