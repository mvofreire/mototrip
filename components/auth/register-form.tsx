'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { NewPasswordFields, newPasswordProblem } from '@/components/auth/new-password-fields'
import { authErrorKey } from '@/lib/auth/auth-errors'

interface RegisterFormProps {
  locale: string
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const t = useTranslations('account')
  const tp = useTranslations('password')
  const tRoot = useTranslations()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const problem = newPasswordProblem(password, confirmPassword)
    if (problem) {
      setError(tp(problem))
      return
    }

    setLoading(true)

    try {
      const { needsConfirmation } = await signUp(email.trim(), password, fullName.trim())
      if (needsConfirmation) {
        setConfirmationSentTo(email)
      } else {
        router.push(`/${locale}`)
      }
    } catch (err) {
      setError(tRoot(authErrorKey(err, 'signUp')))
    } finally {
      setLoading(false)
    }
  }

  if (confirmationSentTo) {
    return (
      <div className="space-y-4 text-center">
        <Alert>
          <AlertDescription>
            {t.rich('confirmationSent', {
              email: confirmationSentTo,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </AlertDescription>
        </Alert>
        <p className="text-sm text-muted-foreground">
          {t.rich('notReceived', {
            link: (chunks) => (
              <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
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

      <GoogleSignInButton onError={setError} />

      <div className="space-y-2">
        <Label htmlFor="fullName">{t('fullName')}</Label>
        <Input
          id="fullName"
          type="text"
          autoComplete="name"
          placeholder={t('fullNamePlaceholder')}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

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

      <NewPasswordFields
        password={password}
        confirmation={confirmPassword}
        onPasswordChange={setPassword}
        onConfirmationChange={setConfirmPassword}
        disabled={loading}
        label={t('passwordLabel')}
        confirmationLabel={t('confirmPassword')}
      />

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('createAccount')}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {t('haveAccount')}{' '}
        <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
          {t('signInLink')}
        </Link>
      </p>
    </form>
  )
}
