'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Shown while auth loads (and while the page's code is still arriving); defaults to a spinner */
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const t = useTranslations('common')
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      // Extract locale from pathname
      const locale = pathname.split('/')[1] || 'pt'
      router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [user, loading, router, pathname])

  // Loading, or signed out and about to be redirected. Never render nothing:
  // an empty <main> pulls the footer up into view, and pushing it back down
  // when the page arrives is a large layout shift (CLS).
  const placeholder = fallback ?? (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  )

  if (loading || !user) return placeholder

  // A child that suspends (lazy code) keeps the placeholder instead of emptying the page
  return <Suspense fallback={placeholder}>{children}</Suspense>
}
