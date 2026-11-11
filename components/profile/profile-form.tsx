'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/use-auth'
import { authService } from '@/lib/auth/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, User, Mail, Calendar, Shield } from 'lucide-react'

export function ProfileForm() {
  const t = useTranslations('account')
  const tRoles = useTranslations('admin.users.roles')
  const locale = useLocale()
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.profile?.full_name || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      await authService.updateProfile(user.id, { full_name: fullName })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Profile update failed', err)
      setError(t('profileSaveFailed'))
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Alert>
        <AlertDescription>{t('loadingProfile')}</AlertDescription>
      </Alert>
    )
  }

  const profile = user.profile
  const roleLabel = tRoles(profile?.role ?? 'contributor')

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gradient-brand flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{profile?.full_name || t('noName')}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={profile?.role === 'contributor' ? 'secondary' : 'default'}>
                  <Shield className="h-3 w-3 mr-1" />
                  {roleLabel}
                </Badge>
                {profile?.created_at && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('memberSince', { date: new Date(profile.created_at).toLocaleDateString(locale) })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Edit Profile Form */}
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

            {success && (
              <Alert>
                <AlertDescription>{t('profileSaved')}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder={t('fullNameProfilePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">{t('emailCannotChange')}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">{t('roleLabel')}</Label>
              <Input
                id="role"
                type="text"
                value={roleLabel}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">{t('roleSystem')}</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>{t('statsTitle')}</CardTitle>
          <CardDescription>{t('statsDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">{t('statsRoutesCreated')}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">{t('statsRoutesSaved')}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">{t('statsReviews')}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
