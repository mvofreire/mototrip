'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { canEditRoute, isStaff } from '@/lib/auth/roles'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  ACCEPTED_PHOTO_TYPES,
  InvalidPhotoError,
  PhotosService,
} from '@/lib/services/photos.service'
import type { RouteWithDetails } from '@/types'

/**
 * Photo gallery of a route. The route's author and admins can add and
 * remove photos; the first photo becomes the cover of the route page.
 */
export function RoutePhotos({
  route,
  onChange,
}: {
  route: RouteWithDetails
  /** Called after an upload/removal; defaults to refreshing the page */
  onChange?: () => void | Promise<void>
}) {
  const t = useTranslations('route')
  const { user } = useAuth()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const photos = [...(route.photos ?? [])].sort((a, b) => a.order_index - b.order_index)
  const canEdit = canEditRoute(user, route)
  // Authors' new photos go through review again
  const sendsToReview = canEdit && !isStaff(user) && route.status === 'approved'
  const changed = () => (onChange ? onChange() : router.refresh())

  if (photos.length === 0 && !canEdit) return null

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length || !user) return
    setError(null)
    setBusy('upload')
    try {
      let order = photos.length
      for (const file of Array.from(files)) {
        await PhotosService.upload(route.id, user.id, file, order++)
      }
      await changed()
    } catch (e) {
      setError(e instanceof InvalidPhotoError ? t('invalidFile') : t('uploadFailed'))
    } finally {
      setBusy(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleRemove = async (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId)
    if (!photo) return
    setError(null)
    setBusy(photoId)
    try {
      await PhotosService.remove(photo)
      await changed()
    } catch {
      setError(t('uploadFailed'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold">{t('photos')}</h2>
        {canEdit && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_PHOTO_TYPES.join(',')}
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              variant="outline"
              size="sm"
              disabled={busy !== null}
              onClick={() => inputRef.current?.click()}
            >
              {busy === 'upload' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              {busy === 'upload' ? t('uploading') : t('addPhoto')}
            </Button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {canEdit && <p className="text-xs text-muted-foreground">{t('coverHint')}</p>}
      {sendsToReview && (
        <p className="text-xs text-amber-600 dark:text-amber-500">{t('photosSendToReview')}</p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? route.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              {canEdit && (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  aria-label={t('removePhoto')}
                  title={t('removePhoto')}
                  disabled={busy !== null}
                  onClick={() => handleRemove(photo.id)}
                  className="absolute right-2 top-2 h-8 w-8 opacity-90"
                >
                  {busy === photo.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
