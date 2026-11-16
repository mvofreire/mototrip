'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AvatarStorage } from '@/lib/storage/storage.service'
import { ACCEPTED_IMAGE_TYPES } from '@/lib/images/prepare-image'
import { type AvatarCrop, clampCrop, drawAvatarCrop, exportAvatar } from '@/lib/images/avatar'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const PREVIEW = 480 // canvas pixels behind the 240px preview (2× for retina)

const formatSize = (bytes: number) =>
  bytes >= 1_000_000 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`

/**
 * Pick, frame and save the profile photo. Cropping and the 512px WebP
 * encoding happen on the device, so only a small file is uploaded.
 * Loaded on demand (next/dynamic) when the camera button is first used.
 */
export default function AvatarEditor({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (message: string) => void
}) {
  const t = useTranslations('account')
  const { user, updateProfile } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [image, setImage] = useState<ImageBitmap | null>(null)
  const [original, setOriginal] = useState<{ size: number; w: number; h: number } | null>(null)
  const [crop, setCrop] = useState<AvatarCrop>({ zoom: 1, x: 0, y: 0 })
  const [outputSize, setOutputSize] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const drag = useRef<{ x: number; y: number; crop: AvatarCrop } | null>(null)

  const hasPhoto = !!user?.profile?.avatar_url

  // Start clean every time the dialog opens
  useEffect(() => {
    if (open) return
    setImage((current) => {
      current?.close()
      return null
    })
    setOriginal(null)
    setOutputSize(null)
    setError('')
  }, [open])

  // Draw the preview; the output size estimate waits for a pause in dragging
  useEffect(() => {
    if (!image || !canvasRef.current) return
    const ctx = canvasRef.current.getContext('2d')!
    const frame = requestAnimationFrame(() => drawAvatarCrop(ctx, image, crop, PREVIEW))
    const timer = setTimeout(() => {
      exportAvatar(image, crop).then((b) => setOutputSize(b.size)).catch(() => {})
    }, 250)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [image, crop])

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError('')
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError(t('photoInvalid'))
      return
    }
    try {
      const bitmap = await createImageBitmap(file)
      image?.close()
      setImage(bitmap)
      setOriginal({ size: file.size, w: bitmap.width, h: bitmap.height })
      setCrop({ zoom: 1, x: 0, y: 0 })
    } catch {
      setError(t('photoInvalid'))
    }
  }

  const clamp = (c: AvatarCrop) => (image ? clampCrop(c, image.width, image.height) : c)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, crop }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = drag.current
    if (!start) return
    // A pixel of the preview box is short side / zoom / box width of the image
    const box = e.currentTarget.getBoundingClientRect().width
    const k = 1 / (box * start.crop.zoom)
    setCrop(clamp({ ...start.crop, x: start.crop.x + (e.clientX - start.x) * k, y: start.crop.y + (e.clientY - start.y) * k }))
  }
  const onPointerUp = () => {
    drag.current = null
  }

  const save = async () => {
    if (!user || !image) return
    setBusy(true)
    setError('')
    try {
      const blob = await exportAvatar(image, crop)
      const url = await AvatarStorage.upload(user.id, blob)
      await updateProfile({ avatar_url: url })
      onSaved(t('photoSaved'))
      onOpenChange(false)
    } catch (e) {
      console.error('Avatar upload failed', e)
      setError(t('photoFailed'))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!user) return
    setBusy(true)
    setError('')
    try {
      await updateProfile({ avatar_url: null })
      // The profile no longer points at it: a failed delete only leaves a file behind
      await AvatarStorage.remove(user.id).catch((e) => console.warn('Avatar delete failed', e))
      onSaved(t('photoRemoved'))
      onOpenChange(false)
    } catch (e) {
      console.error('Avatar removal failed', e)
      setError(t('photoFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={busy ? undefined : onOpenChange}>
      <DialogContent className="max-h-[92dvh] gap-5 overflow-y-auto rounded-2xl max-sm:bottom-0 max-sm:rounded-b-none max-sm:top-auto max-sm:translate-y-0 max-sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold uppercase">
            {image ? t('photoAdjust') : t('photoTitle')}
          </DialogTitle>
          <DialogDescription>{image ? t('photoDragHint') : t('photoHint')}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            pick(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        {image ? (
          <>
            <div
              className="relative mx-auto aspect-square w-60 cursor-grab touch-none overflow-hidden rounded-2xl bg-muted active:cursor-grabbing"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <canvas ref={canvasRef} width={PREVIEW} height={PREVIEW} className="h-full w-full" />
              {/* Darkens the corners the round avatar won't show */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(circle at center, transparent 69.5%, rgb(0 0 0 / 0.55) 70%)' }}
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium" id="avatar-zoom">
                {t('photoZoom')}
              </span>
              <Slider
                aria-labelledby="avatar-zoom"
                min={1}
                max={3}
                step={0.01}
                value={[crop.zoom]}
                onValueChange={([zoom]) => setCrop((c) => clamp({ ...c, zoom }))}
              />
            </div>

            {original && (
              <p className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span>
                  {t('photoOriginal')}: <b className="text-foreground">{formatSize(original.size)}</b> · {original.w}×{original.h}
                </span>
                <span>
                  {t('photoUpload')}:{' '}
                  <b className="text-emerald-500 tabular-nums">{outputSize ? formatSize(outputSize) : '…'}</b> · 512×512
                </span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
                {t('photoChange')}
              </Button>
              <Button type="button" disabled={busy} onClick={save}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('photoSave')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center text-muted-foreground transition-colors hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ImagePlus className="h-7 w-7" />
              <span className="font-semibold text-foreground">{t('photoPick')}</span>
              <span className="text-xs">{t('photoTypes')}</span>
            </button>
            {hasPhoto && (
              <Button type="button" variant="ghost" disabled={busy} onClick={remove} className="text-destructive hover:text-destructive">
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                {t('photoRemove')}
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
