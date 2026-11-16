'use client'

import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { ProfileForm } from './profile-form'
import { ChangePasswordForm } from './change-password-form'

/** Account tab: profile details, password and sign out (loaded on demand) */
export default function AccountPanel({ onNotice }: { onNotice: (message: string) => void }) {
  const tNav = useTranslations('nav')
  const { signOut } = useAuth()

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <ProfileForm onSaved={onNotice} />
        <ChangePasswordForm />
      </div>
      <Button type="button" variant="ghost" className="text-muted-foreground" onClick={() => signOut()}>
        <LogOut className="mr-2 h-4 w-4" />
        {tNav('signOut')}
      </Button>
    </div>
  )
}
