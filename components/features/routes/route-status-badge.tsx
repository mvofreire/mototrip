'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { RouteStatus } from '@/types/database.types'

const STYLES: Record<RouteStatus, { className: string; Icon: typeof Clock }> = {
  pending: { className: 'border-amber-300 text-amber-700 dark:text-amber-400', Icon: Clock },
  approved: { className: 'border-green-300 text-green-700 dark:text-green-400', Icon: CheckCircle2 },
  rejected: { className: 'border-red-300 text-red-700 dark:text-red-400', Icon: XCircle },
}

export function RouteStatusBadge({ status }: { status: RouteStatus }) {
  const t = useTranslations('routeStatus')
  const { className, Icon } = STYLES[status] ?? STYLES.pending
  return (
    <Badge variant="outline" className={`whitespace-nowrap ${className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {t(status)}
    </Badge>
  )
}
