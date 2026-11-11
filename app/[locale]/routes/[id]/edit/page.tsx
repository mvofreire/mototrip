'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { SubmitRouteForm } from '@/components/features/routes/submit-route-form'
import { StopsEditor } from '@/components/features/routes/stops-editor'
import { RoutePhotos } from '@/components/features/routes/route-photos'
import { RouteReviewBanner } from '@/components/features/routes/route-review-banner'
import { RouteStatusBadge } from '@/components/features/routes/route-status-badge'
import { CommentsList } from '@/components/features/comments'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { canEditRoute, isStaff } from '@/lib/auth/roles'
import { CuratorReviewEditor } from '@/components/admin/curator-review-editor'
import { RoutesService } from '@/lib/services/routes.service'
import type { RouteWithDetails } from '@/types'

export default function EditRoutePage({ params }: { params: { id: string; locale: string } }) {
  const t = useTranslations('editRoute')
  const { user, loading: authLoading } = useAuth()
  const [route, setRoute] = useState<RouteWithDetails | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'notFound' | 'forbidden'>('loading')
  const [savedMessage, setSavedMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setRoute(await RoutesService.getRouteById(params.id))
      setState('ready')
    } catch {
      setState('notFound')
    }
  }, [params.id])

  useEffect(() => {
    if (!authLoading && user) load()
  }, [authLoading, user, load])

  const allowed = route && canEditRoute(user, route)
  const backHref = `/${params.locale}/routes/${params.id}`

  return (
    <ProtectedRoute>
      <div className="container max-w-3xl py-8 md:py-12">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('backToRoute')}
        </Link>

        {state === 'loading' ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : state === 'notFound' || !route ? (
          <Card className="p-8 text-center text-muted-foreground">{t('notFound')}</Card>
        ) : !allowed ? (
          <Card className="p-8 text-center text-muted-foreground">{t('forbidden')}</Card>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <RouteStatusBadge status={route.status} />
              </div>
              <p className="text-muted-foreground">{route.title}</p>
              <RouteReviewBanner route={route} showEdit={false} />
            </div>

            <section className="space-y-4">
              <SubmitRouteForm
                key={route.updated_at}
                locale={params.locale}
                route={route}
                onSaved={(saved) => {
                  setRoute(saved)
                  setSavedMessage(saved.status === 'pending' && route.status !== 'pending'
                    ? t('savedToReview')
                    : t('saved'))
                }}
              />
              {savedMessage && (
                <p role="status" className="text-sm text-green-600">{savedMessage}</p>
              )}
            </section>

            <StopsEditor route={route} onSaved={() => load()} />

            {/* MotoTrip review: staff only, goes live on save */}
            {isStaff(user) && (
              <CuratorReviewEditor
                routeId={route.id}
                review={route.curator_review}
                onSaved={(review) => setRoute((r) => (r ? { ...r, curator_review: review } : r))}
              />
            )}

            <Card className="p-6">
              <RoutePhotos route={route} onChange={load} />
            </Card>

            <Card className="p-6">
              <CommentsList
                routeId={route.id}
                locale={params.locale}
                routeAuthorId={route.user_id}
                hideForm
              />
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
