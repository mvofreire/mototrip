import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ProfileView } from '@/components/profile/profile-view'
import { ProfileSkeleton } from '@/components/profile/profile-skeleton'

// Private page: noindex comes from ./layout.tsx
export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'account' })
  return { title: t('profileTitle') }
}

export default function ProfilePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale)

  return (
    <ProtectedRoute fallback={<ProfileSkeleton />}>
      <ProfileView />
    </ProtectedRoute>
  )
}
