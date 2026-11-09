'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Ban, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { AccountBlock } from '@/types/auth.types'

/** Explains to a suspended/banned user why they cannot sign in */
export function AccountBlockedNotice({ block }: { block: Partial<AccountBlock> }) {
  const t = useTranslations('accountBlocked')
  const locale = useLocale()
  const suspended = block.status === 'suspended'
  const until = block.until
    ? new Date(block.until).toLocaleString(locale, { dateStyle: 'long', timeStyle: 'short' })
    : null

  return (
    <Alert variant="destructive">
      <AlertDescription className="space-y-1">
        <p className="flex items-center gap-2 font-semibold">
          {suspended ? <Clock className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
          {suspended ? t('suspendedTitle') : block.status === 'banned' ? t('bannedTitle') : t('genericTitle')}
        </p>
        {suspended && until && <p>{t('suspendedUntil', { until })}</p>}
        {block.reason && <p>{t('reason', { reason: block.reason })}</p>}
        <p className="text-xs opacity-80">{t('contact')}</p>
      </AlertDescription>
    </Alert>
  )
}
