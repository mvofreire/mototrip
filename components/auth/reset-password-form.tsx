'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/lib/auth/auth.service'
import { passwordErrorKey } from '@/lib/auth/password-errors'
import { NewPasswordFields, newPasswordProblem } from '@/components/auth/new-password-fields'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'

interface ResetPasswordFormProps {
  locale: string
}

/**
 * Landing page of the reset email. supabase-js turns the link's tokens into a
 * session on load (detectSessionInUrl); an expired or reused link arrives as
 * #error=...&error_code=otp_expired instead, and then there is no session.
 */
export function ResetPasswordForm({ locale }: ResetPasswordFormProps) {
  const t = useTranslations('password')
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [linkError, setLinkError] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1))
    const query = new URLSearchParams(window.location.search)
    if (hash.get('error') || query.get('error')) setLinkError(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const problem = newPasswordProblem(password, confirmation)
    if (problem) {
      setError(t(problem))
      return
    }

    setSaving(true)
    try {
      await authService.updatePassword(password)
      setSuccess(true)
      setTimeout(() => router.replace(`/${locale}/profile`), 2000)
    } catch (err) {
      setError(t(passwordErrorKey(err)))
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>{t('resetDone')}</AlertDescription>
      </Alert>
    )
  }

  if (!linkError && authLoading) {
    return (
      <p className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('checkingLink')}
      </p>
    )
  }

  if (linkError || !user) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{t('linkInvalid')}</AlertDescription>
        </Alert>
        <Button asChild className="w-full">
          <Link href={`/${locale}/auth/forgot-password`}>{t('requestNew')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lets password managers save the new password under the right account */}
      <input type="email" name="email" autoComplete="username" value={user.email} readOnly hidden />

      <NewPasswordFields
        password={password}
        confirmation={confirmation}
        onPasswordChange={setPassword}
        onConfirmationChange={setConfirmation}
        disabled={saving}
      />

      <Button type="submit" className="w-full" disabled={saving}>
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('submitReset')}
      </Button>
    </form>
  )
}
