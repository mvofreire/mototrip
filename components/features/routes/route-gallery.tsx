'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type GalleryPhoto = { id: string; url: string; caption: string | null }

/**
 * Full-screen photo viewer. Swipe on phones (CSS scroll snap, no JS
 * gestures), arrows and keyboard on desktop. Only mounted while open, so it
 * costs nothing on page load.
 */
export function RouteGallery({
  photos,
  title,
  index,
  onClose,
}: {
  photos: GalleryPhoto[]
  title: string
  /** Photo to open on, or null when closed */
  index: number | null
  onClose: () => void
}) {
  const t = useTranslations('route')
  const track = useRef<HTMLDivElement>(null)
  // No Dialog.Trigger here, so focus goes back to the tapped thumbnail by hand
  const opener = useRef<HTMLElement | null>(null)
  const [current, setCurrent] = useState(index ?? 0)
  const open = index !== null

  // Jump to the photo that was tapped, without animating through the others
  useEffect(() => {
    if (index === null) return
    setCurrent(index)
    requestAnimationFrame(() => {
      const el = track.current
      if (el) el.scrollTo({ left: index * el.clientWidth, behavior: 'auto' })
    })
  }, [index])

  const goTo = useCallback(
    (i: number) => {
      const el = track.current
      if (!el) return
      const next = Math.max(0, Math.min(photos.length - 1, i))
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' })
    },
    [photos.length],
  )

  const onScroll = () => {
    const el = track.current
    if (!el || !el.clientWidth) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== current) setCurrent(i)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo(current + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo(current - 1)
    }
  }

  const photo = photos[current]
  const many = photos.length > 1

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-black data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onKeyDown={onKeyDown}
          onOpenAutoFocus={() => {
            opener.current = document.activeElement as HTMLElement | null
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            opener.current?.focus()
          }}
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col text-white outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0"
        >
          <DialogPrimitive.Title className="sr-only">{t('galleryTitle', { title })}</DialogPrimitive.Title>

          <div className="flex items-center gap-3 px-3 pb-2 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-6">
            <span className="text-sm font-semibold tabular-nums" aria-live="polite">
              {current + 1} / {photos.length}
            </span>
            <DialogPrimitive.Close
              aria-label={t('closeGallery')}
              className="ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <X className="h-5 w-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          <div className="relative min-h-0 flex-1">
            <div
              ref={track}
              onScroll={onScroll}
              className="flex h-full snap-x snap-mandatory overflow-x-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {photos.map((p, i) => (
                <figure key={p.id} className="relative h-full w-full shrink-0 snap-center snap-always">
                  {/* Only the open photo and its neighbours are fetched */}
                  {Math.abs(i - current) <= 1 && (
                    <Image
                      src={p.url}
                      alt={p.caption ?? title}
                      fill
                      sizes="100vw"
                      quality={80}
                      className="object-contain"
                    />
                  )}
                </figure>
              ))}
            </div>

            {many && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  disabled={current === 0}
                  aria-label={t('previousPhoto')}
                  className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-0 sm:flex"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  disabled={current === photos.length - 1}
                  aria-label={t('nextPhoto')}
                  className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 backdrop-blur transition-colors hover:bg-white/20 disabled:opacity-0 sm:flex"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden />
                </button>
              </>
            )}
          </div>

          <div className="min-h-[3.5rem] px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 text-center text-sm text-white/80">
            {photo?.caption}
            {many && photos.length <= 12 && (
              <div className="mt-2 flex justify-center gap-1.5" aria-hidden>
                {photos.map((p, i) => (
                  <span
                    key={p.id}
                    className={cn('h-1.5 rounded-full bg-white transition-all', i === current ? 'w-4' : 'w-1.5 opacity-40')}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
