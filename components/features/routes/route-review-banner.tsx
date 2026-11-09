'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Clock, Pencil, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { canEditRoute } from '@/lib/auth/roles'
import type { RouteWithDetails } from '@/types'
import { cn } from '@/lib/utils'

/**
 * Shown on the route page to its author and to staff: an "Edit" button, plus
 * the review status while the route is not public (pending / rejected + reason).
 */
export function RouteReviewBanner({
  route,
  showEdit = true,
}: {
  route: RouteWithDetails
  showEdit?: boolean
}) {
  const t = useTranslations('routeStatus')
  const locale = useLocale()
  const { user } = useAuth()

  if (!canEditRoute(user, route)) return null

  const pending = route.status === 'pending'
  const rejected = route.status === 'rejected'

  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4',
        pending && 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
        rejected && 'border-red-300 bg-red-50 dark:bg-red-950/30',
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {pending && <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
        {rejected && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />}
        <div className="min-w-0 space-y-1">
          {pending && (
            <>
              <p className="font-medium">{t('pendingTitle')}</p>
              <p className="text-sm text-muted-foreground">{t('pendingDescription')}</p>
            </>
          )}
          {rejected && (
            <>
              <p className="font-medium">{t('rejectedTitle')}</p>
              {route.review_note && (
                <p className="whitespace-pre-line break-words text-sm">
                  <span className="text-muted-foreground">{t('reason')}: </span>
                  {route.review_note}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{t('rejectedDescription')}</p>
            </>
          )}
          {route.status === 'approved' && (
            <p className="text-sm text-muted-foreground">{t('approvedOwnerHint')}</p>
          )}
        </div>
      </div>
      {showEdit && (
        <Button asChild size="sm" variant={route.status === 'approved' ? 'outline' : 'default'}>
          <Link href={`/${locale}/routes/${route.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            {t('edit')}
          </Link>
        </Button>
      )}
    </div>
  )
}
