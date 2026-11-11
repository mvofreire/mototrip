'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { passwordErrorKey } from '@/lib/auth/password-errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle } from 'lucide-react'

interface ForgotPasswordFormProps {
  locale: string
}

export function ForgotPasswordForm({ locale }: ForgotPasswordFormProps) {
  const t = useTranslations('password')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await resetPassword(email.trim())
      setSuccess(true)
    } catch (err) {
      setError(t(passwordErrorKey(err)))
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    // Same message whether or not the account exists, so the form can't be
    // used to find out who is registered
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{t('sent')}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/${locale}/auth/login`}>{t('backToLogin')}</Link>
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

      <div className="space-y-2">
        <Label htmlFor="email">{t('emailLabel')}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('sendLink')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
          {t('backToLogin')}
        </Link>
      </p>
    </form>
  )
}
