'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const MIN_PASSWORD_LENGTH = 8

/** Translation key for the first problem with a new password, or null */
export function newPasswordProblem(password: string, confirmation: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return 'tooShort'
  if (password !== confirmation) return 'mismatch'
  return null
}

interface NewPasswordFieldsProps {
  password: string
  confirmation: string
  onPasswordChange: (value: string) => void
  onConfirmationChange: (value: string) => void
  disabled?: boolean
  /** Defaults to "New password" / "Confirm new password" */
  label?: string
  confirmationLabel?: string
}

/** "New password" + "Confirm new password" inputs shared by reset and change */
export function NewPasswordFields({
  password,
  confirmation,
  onPasswordChange,
  onConfirmationChange,
  disabled,
  label,
  confirmationLabel,
}: NewPasswordFieldsProps) {
  const t = useTranslations('password')

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="new-password">{label ?? t('newPassword')}</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">{t('minLength')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">{confirmationLabel ?? t('confirmPassword')}</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmation}
          onChange={(e) => onConfirmationChange(e.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
          disabled={disabled}
        />
      </div>
    </>
  )
}
