'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { RoutesService } from '@/lib/services/routes.service'
import type { RouteWithDetails } from '@/types'
import { RouteDetail } from './route-detail'

/**
 * Routes that aren't public (pending/rejected) are invisible to the server
 * render. Their author and staff load them here with their own session.
 */
export function PrivateRouteDetail({ id, locale }: { id: string; locale: string }) {
  const t = useTranslations()
  const { user, loading } = useAuth()
  const [route, setRoute] = useState<RouteWithDetails | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!user) {
      setDone(true)
      return
    }
    RoutesService.getRouteById(id)
      .then(setRoute)
      .catch(() => setRoute(null))
      .finally(() => setDone(true))
  }, [id, user, loading])

  if (!done) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (route) return <RouteDetail route={route} locale={locale} />

  return (
    <div className="container flex items-center justify-center min-h-[600px]">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-gradient-brand flex items-center justify-center">
            <MapPin className="h-12 w-12 text-white" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">{t('route.notFoundTitle')}</h2>
          <p className="text-muted-foreground">{t('route.notFoundDescription')}</p>
        </div>
        <Button asChild className="bg-gradient-brand hover:opacity-90">
          <Link href={`/${locale}`}>{t('notFound.backToHome')}</Link>
        </Button>
      </div>
    </div>
  )
}
