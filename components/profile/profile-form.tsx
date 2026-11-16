'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Name (editable), e-mail and role (read only) */
export function ProfileForm({ onSaved }: { onSaved: (message: string) => void }) {
  const t = useTranslations('account')
  const tRoles = useTranslations('admin.users.roles')
  const { user, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!user) return null
  const unchanged = fullName.trim() === (user.profile?.full_name ?? '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await updateProfile({ full_name: fullName.trim() || null })
      onSaved(t('profileSaved'))
    } catch (err) {
      console.error('Profile update failed', err)
      setError(t('profileSaveFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editTitle')}</CardTitle>
        <CardDescription>{t('editDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName">{t('fullName')}</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              maxLength={80}
              placeholder={t('fullNameProfilePlaceholder')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('emailLabel')}</Label>
            <Input id="email" type="email" value={user.email} readOnly className="bg-muted text-muted-foreground" />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              {t('emailCannotChange')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('roleLabel')}</Label>
            <Input
              id="role"
              type="text"
              value={tRoles(user.profile?.role ?? 'contributor')}
              readOnly
              className="bg-muted text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">{t('roleSystem')}</p>
          </div>

          <Button type="submit" disabled={loading || unchanged} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('saveChanges')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
