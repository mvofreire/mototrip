'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { safeRedirectPath } from '@/lib/auth/redirects'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'

/**
 * Landing page after Google sign-in. supabase-js reads the session from the
 * URL on load (detectSessionInUrl); once the auth context has the user we send
 * them on to where they started. Provider errors (e.g. the user cancelled)
 * arrive as error/error_description in the query or the hash.
 */
function readProviderError(): string | null {
  const query = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const code = query.get('error') || hash.get('error')
  if (!code) return null
  return query.get('error_description') || hash.get('error_description') || code
}

export default function AuthCallbackPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('oauth')
  const { user, loading } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const providerError = readProviderError()
    if (providerError) {
      setError(providerError)
      return
    }
    if (loading) return

    if (user) {
      const redirect = new URLSearchParams(window.location.search).get('redirect')
      router.replace(safeRedirectPath(redirect, params.locale))
    } else {
      setError(t('callbackFailed'))
    }
  }, [user, loading, router, params.locale, t])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4 text-center">
          {error ? (
            <>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Link href={`/${params.locale}/auth/login`} className="text-sm text-primary hover:underline">
                {t('backToLogin')}
              </Link>
            </>
          ) : (
            <p className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('signingIn')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
