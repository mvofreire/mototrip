'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/lib/auth/auth.service'
import { passwordErrorKey } from '@/lib/auth/password-errors'
import { NewPasswordFields, newPasswordProblem } from '@/components/auth/new-password-fields'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, KeyRound, Loader2 } from 'lucide-react'

/**
 * Change the password from the profile. Accounts that already have one must
 * type the current password; Google-only accounts can set a first one.
 */
export function ChangePasswordForm() {
  const t = useTranslations('password')
  const locale = useLocale()
  const { user } = useAuth()
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    authService.hasPassword().then(setHasPassword).catch(() => setHasPassword(true))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    const problem = newPasswordProblem(password, confirmation)
    if (problem) {
      setError(t(problem))
      return
    }

    setSaving(true)
    try {
      await authService.changePassword(password, hasPassword ? current : undefined)
      setCurrent('')
      setPassword('')
      setConfirmation('')
      setHasPassword(true)
      setSuccess(true)
    } catch (err) {
      setError(t(passwordErrorKey(err)))
    } finally {
      setSaving(false)
    }
  }

  if (!user || hasPassword === null) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          {hasPassword ? t('changeTitle') : t('setTitle')}
        </CardTitle>
        <CardDescription>
          {hasPassword ? t('changeDescription') : t('setDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{t('changeDone')}</AlertDescription>
            </Alert>
          )}

          <input type="email" name="email" autoComplete="username" value={user.email} readOnly hidden />

          {hasPassword && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="current-password">{t('currentPassword')}</Label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-xs text-primary hover:underline"
                >
                  {t('forgotLink')}
                </Link>
              </div>
              <Input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                disabled={saving}
              />
            </div>
          )}

          <NewPasswordFields
            password={password}
            confirmation={confirmation}
            onPasswordChange={setPassword}
            onConfirmationChange={setConfirmation}
            disabled={saving}
          />

          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {hasPassword ? t('submitChange') : t('submitSet')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
