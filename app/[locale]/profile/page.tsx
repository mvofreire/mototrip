import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProfileForm } from '@/components/profile/profile-form'
import { ChangePasswordForm } from '@/components/profile/change-password-form'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { SavedRoutes } from '@/components/profile/saved-routes'
import { MyRoutes } from '@/components/profile/my-routes'

export default async function ProfilePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)
  const t = await getTranslations({ locale: params.locale, namespace: 'account' })

  return (
    <ProtectedRoute>
      <div className="container py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{t('profileTitle')}</h1>
            <p className="text-muted-foreground mt-2">{t('profileSubtitle')}</p>
          </div>
          <ProfileForm />
          <div className="mt-6">
            <ChangePasswordForm />
          </div>
          <div className="mt-12">
            <MyRoutes />
          </div>
          <div className="mt-12">
            <SavedRoutes />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
