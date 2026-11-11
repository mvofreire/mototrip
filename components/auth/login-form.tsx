'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { safeRedirectPath } from '@/lib/auth/redirects'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { AccountBlockedNotice } from '@/components/auth/account-blocked-notice'
import { isBannedError, takeAccountBlock } from '@/lib/auth/account-block'
import { authErrorKey } from '@/lib/auth/auth-errors'
import type { AccountBlock } from '@/types/auth.types'

/** Where to go after login: the ?redirect= param when it is an internal path. */
function getSafeRedirect(locale: string) {
  return safeRedirectPath(new URLSearchParams(window.location.search).get('redirect'), locale)
}

interface LoginFormProps {
  locale: string
}

export function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations('account')
  const tp = useTranslations('password')
  const tRoot = useTranslations()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Set when a suspended/banned user was signed out or Supabase refused the login
  const [block, setBlock] = useState<Partial<AccountBlock> | null>(null)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('blocked')) {
      setBlock(takeAccountBlock() ?? {})
    }
  }, [])
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBlock(null)
    setLoading(true)

    try {
      await signIn(email, password)
      router.push(getSafeRedirect(locale))
    } catch (err) {
      if (isBannedError(err)) setBlock({})
      else setError(tRoot(authErrorKey(err, 'signIn')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {block && <AccountBlockedNotice block={block} />}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <GoogleSignInButton onError={(msg) => (isBannedError(msg) ? setBlock({}) : setError(msg))} />

      <div className="space-y-2">
        <Label htmlFor="email">{tp('emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={tp('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('passwordLabel')}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <Link 
          href={`/${locale}/auth/forgot-password`}
          className="text-primary hover:underline"
        >
          {tp('forgotLink')}
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('signIn')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/auth/register`} className="text-primary hover:underline">
          {t('createAccountLink')}
        </Link>
      </p>
    </form>
  )
}
