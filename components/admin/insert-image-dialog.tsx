'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import { InvalidImageError, uploadBlogImage } from '@/lib/services/blog-admin.service'
import { ACCEPTED_IMAGE_TYPES } from '@/lib/images/prepare-image'
import { imageMarkdown } from '@/lib/blog/markdown'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Layout = 'text' | 'wide' | 'gallery'

interface Item {
  key: string
  preview: string
  url: string | null
  error: string | null
  alt: string
  caption: string
}

/**
 * Upload one or more images and insert them in the post body at the cursor,
 * with alt text (SEO and screen readers), a caption and a width.
 */
export function InsertImageDialog({
  open,
  files,
  onOpenChange,
  onInsert,
}: {
  open: boolean
  /** Files dropped or pasted into the editor; uploaded as soon as the dialog opens */
  files: File[]
  onOpenChange: (open: boolean) => void
  onInsert: (markdown: string) => void
}) {
  const t = useTranslations('admin.blog.image')
  const tb = useTranslations('admin.blog')
  const [items, setItems] = useState<Item[]>([])
  const [layout, setLayout] = useState<Layout>('text')
  const [dragging, setDragging] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const add = (list: File[], already = items.length) => {
    const images = list.filter((f) => ACCEPTED_IMAGE_TYPES.includes(f.type))
    if (!images.length) return
    const fresh = images.map((f) => ({ key: crypto.randomUUID(), preview: URL.createObjectURL(f), url: null, error: null, alt: '', caption: '' }))
    setItems((prev) => [...prev, ...fresh])
    if (already + fresh.length > 1) setLayout('gallery')
    images.forEach((file, i) => {
      const key = fresh[i].key
      uploadBlogImage(file)
        .then((url) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, url } : it))))
        .catch((e) => {
          console.error(e)
          const error = e instanceof InvalidImageError ? tb('imageInvalid') : tb('imageUploadFailed')
          setItems((prev) => prev.map((it) => (it.key === key ? { ...it, error } : it)))
        })
    })
  }

  // Start fresh each time it opens, with the dropped files if any
  useEffect(() => {
    if (!open) return
    setItems([])
    setLayout('text')
    if (files.length) add(files, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const update = (key: string, patch: Partial<Item>) => setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...patch } : it)))
  const ready = items.filter((it) => it.url)
  const uploading = items.some((it) => !it.url && !it.error)
  const missingAlt = ready.some((it) => !it.alt.trim())

  const layouts: Layout[] = items.length > 1 ? ['gallery', 'text'] : ['text', 'wide']
  const effective = layouts.includes(layout) ? layout : layouts[0]

  const insert = () => {
    const blocks = ready.map((it) => imageMarkdown({ url: it.url!, alt: it.alt, caption: it.caption, wide: effective === 'wide' && ready.length === 1 }))
    // A gallery is images on consecutive lines (one paragraph); otherwise one block each
    onInsert(effective === 'gallery' && blocks.length > 1 ? blocks.join('\n') : blocks.join('\n\n'))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sans normal-case tracking-normal">{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            add(Array.from(e.dataTransfer.files))
          }}
          className={cn(
            'flex w-full flex-col items-center gap-1.5 rounded-lg border-2 border-dashed p-5 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground',
            dragging && 'border-primary bg-primary/5 text-foreground',
          )}
        >
          <Upload className="h-5 w-5" />
          <span className="font-medium">{items.length ? t('addMore') : t('drop')}</span>
          <span className="text-xs">{t('formats')}</span>
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          className="hidden"
          onChange={(e) => {
            add(Array.from(e.target.files ?? []))
            e.target.value = ''
          }}
        />

        {items.length > 0 && (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.key} className="flex gap-3 rounded-lg border p-2.5">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.preview} alt="" className="h-full w-full object-cover" />
                  {!it.url && !it.error && (
                    <div className="absolute inset-0 grid place-items-center bg-background/60">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  {it.error ? (
                    <p className="flex items-start gap-1.5 text-sm text-destructive">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      {it.error}
                    </p>
                  ) : (
                    <>
                      <Input
                        aria-label={t('alt')}
                        placeholder={t('altPlaceholder')}
                        value={it.alt}
                        onChange={(e) => update(it.key, { alt: e.target.value })}
                        className="h-8 text-sm"
                      />
                      <Input
                        aria-label={t('caption')}
                        placeholder={t('captionPlaceholder')}
                        value={it.caption}
                        onChange={(e) => update(it.key, { caption: e.target.value })}
                        className="h-8 text-sm"
                      />
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  aria-label={t('remove')}
                  title={t('remove')}
                  onClick={() => setItems((prev) => prev.filter((x) => x.key !== it.key))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="space-y-1.5">
            <Label>{t('width')}</Label>
            <div className="inline-flex rounded-lg border bg-muted/50 p-0.5" role="group">
              {layouts.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={effective === l}
                  onClick={() => setLayout(l)}
                  className={cn('rounded-md px-3 py-1 text-sm font-medium', effective === l ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground')}
                >
                  {t(`layout.${l}`)}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{t(`layoutHelp.${effective}`)}</p>
          </div>
        )}

        {missingAlt && (
          <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {t('altMissing')}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tb('cancel')}
          </Button>
          <Button disabled={!ready.length || uploading} onClick={insert}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
            {t('insert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
