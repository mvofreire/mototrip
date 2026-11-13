'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  AlertTriangle,
  ArrowLeft,
  Bold,
  Check,
  Heading2,
  Heading3,
  ImageIcon,
  ImagePlus,
  Italic,
  Lightbulb,
  Link2,
  List,
  ListOrdered,
  Loader2,
  MapPin,
  Quote,
  X,
} from 'lucide-react'
import { BlogAdminService, InvalidImageError, uploadBlogImage, type RouteOption } from '@/lib/services/blog-admin.service'
import { ACCEPTED_IMAGE_TYPES } from '@/lib/images/prepare-image'
import { BLOG_LOCALES, type BlogLocale, type BlogPost } from '@/lib/blog/posts'
import { BlogMarkdown, routeDirective, routeSlugsIn } from '@/lib/blog/markdown'
import type { MarkdownEditorHandle } from '@/components/admin/markdown-editor'
import { RoutePickerDialog } from '@/components/admin/route-picker-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BlogPostStatus } from '@/types/database.types'
import type { RouteWithDetails } from '@/types'
import { cn } from '@/lib/utils'

const MarkdownEditor = dynamic(() => import('@/components/admin/markdown-editor'), {
  ssr: false,
  loading: () => <div className="min-h-[420px] animate-pulse bg-muted/40" />,
})

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DESCRIPTION_MAX = 160

type Content = { title: string; description: string; body_md: string }
type Cover = Pick<RouteOption, 'id' | 'slug' | 'title' | 'thumbnail_url'>

interface EditorState {
  slug: string
  cover: Cover | null
  /** Uploaded cover image; replaces the route cover */
  coverImage: { url: string; credit: string } | null
  /** YYYY-MM-DD or '' */
  date: string
  translations: Partial<Record<BlogLocale, Content>>
}

const emptyContent = (): Content => ({ title: '', description: '', body_md: '' })

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/, '')
}

function fromPost(post: BlogPost): EditorState {
  return {
    slug: post.slug,
    cover: post.cover && post.cover_route_id ? { id: post.cover_route_id, ...post.cover } : null,
    coverImage: post.cover_image_url ? { url: post.cover_image_url, credit: post.cover_image_credit ?? '' } : null,
    date: post.published_at ? post.published_at.slice(0, 10) : '',
    translations: Object.fromEntries(
      post.translations.map((t) => [t.locale, { title: t.title, description: t.description, body_md: t.body_md }]),
    ),
  }
}

export function BlogPostEditor({ postId }: { postId: string | null }) {
  const router = useRouter()
  const locale = useLocale()
  const tb = useTranslations('admin.blog')
  const languageName = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: 'language' })
    return (l: string) => {
      const name = names.of(l) ?? l
      return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1)
    }
  }, [locale])

  const [loading, setLoading] = useState(!!postId)
  const [notFound, setNotFound] = useState(false)
  const [state, setState] = useState<EditorState>({ slug: '', cover: null, coverImage: null, date: '', translations: { pt: emptyContent() } })
  const [saved, setSaved] = useState<string>(JSON.stringify(state))
  const [status, setStatus] = useState<BlogPostStatus>('draft')
  const [slugLocked, setSlugLocked] = useState(false)
  const [slugTouched, setSlugTouched] = useState(!!postId)
  const [savedLocales, setSavedLocales] = useState<BlogLocale[]>([])
  const [active, setActive] = useState<BlogLocale>('pt')
  const [mobileView, setMobileView] = useState<'write' | 'preview'>('write')
  const [picker, setPicker] = useState<'route' | 'cover' | null>(null)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState<'cover' | 'body' | null>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const bodyInput = useRef<HTMLInputElement>(null)
  const editor = useRef<MarkdownEditorHandle | null>(null)

  // ------------------------------------------------------------------ load
  useEffect(() => {
    if (!postId) return
    ;(async () => {
      try {
        const post = await BlogAdminService.getPost(postId)
        if (!post) return setNotFound(true)
        const s = fromPost(post)
        setState(s)
        setSaved(JSON.stringify(s))
        setStatus(post.status)
        setSlugLocked(post.status !== 'draft')
        setSavedLocales(post.translations.map((t) => t.locale))
        setActive(post.translations.some((t) => t.locale === 'pt') ? 'pt' : post.translations[0]?.locale ?? 'pt')
      } catch (e) {
        console.error(e)
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [postId])

  const dirty = JSON.stringify(state) !== saved

  // Warn before closing the tab with unsaved changes
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // ---------------------------------------------------------------- fields
  const content = state.translations[active] ?? emptyContent()
  const languages = BLOG_LOCALES.filter((l) => state.translations[l])
  const missingLanguages = BLOG_LOCALES.filter((l) => !state.translations[l])

  const setContent = useCallback(
    (patch: Partial<Content>) =>
      setState((s) => {
        const next = { ...(s.translations[active] ?? emptyContent()), ...patch }
        const updated = { ...s, translations: { ...s.translations, [active]: next } }
        // A new post takes its slug from the Portuguese title until the slug is edited
        if (active === 'pt' && patch.title !== undefined && !slugTouched) updated.slug = slugify(patch.title)
        return updated
      }),
    [active, slugTouched],
  )
  const onBodyChange = useCallback((body_md: string) => setContent({ body_md }), [setContent])

  const addLanguage = (l: BlogLocale) => {
    setState((s) => ({ ...s, translations: { ...s.translations, [l]: emptyContent() } }))
    setActive(l)
  }
  const removeLanguage = (l: BlogLocale) => {
    if (!window.confirm(tb('removeLanguageConfirm', { language: languageName(l) }))) return
    setState((s) => {
      const translations = { ...s.translations }
      delete translations[l]
      return { ...s, translations }
    })
    setActive(languages.find((x) => x !== l) ?? 'pt')
  }

  // --------------------------------------------------------------- preview
  const [previewBody, setPreviewBody] = useState(content.body_md)
  useEffect(() => {
    const id = window.setTimeout(() => setPreviewBody(content.body_md), 300)
    return () => window.clearTimeout(id)
  }, [content.body_md])

  const [routeCache, setRouteCache] = useState<Map<string, RouteWithDetails | null>>(new Map())
  const allSlugs = useMemo(
    () => Array.from(new Set(languages.flatMap((l) => routeSlugsIn(state.translations[l]?.body_md ?? '')))),
    [languages, state.translations],
  )
  useEffect(() => {
    const unknown = allSlugs.filter((s) => !routeCache.has(s))
    if (!unknown.length) return
    const id = window.setTimeout(async () => {
      try {
        const found = await BlogAdminService.routesForPreview(unknown)
        setRouteCache((prev) => {
          const next = new Map(prev)
          unknown.forEach((s) => next.set(s, found.find((r) => r.slug === s) ?? null))
          return next
        })
      } catch (e) {
        console.error(e)
      }
    }, 400)
    return () => window.clearTimeout(id)
  }, [allSlugs, routeCache])

  const previewRoutes = useMemo(() => {
    const m = new Map<string, RouteWithDetails>()
    routeCache.forEach((r, s) => r && m.set(s, r))
    return m
  }, [routeCache])
  const missingSlugs = allSlugs.filter((s) => routeCache.get(s) === null)

  // ------------------------------------------------------------ validation
  const slugError = !SLUG_RE.test(state.slug) ? tb('slugInvalid') : null
  const pt = state.translations.pt
  const canPublish = !!pt?.title.trim() && !!pt?.body_md.trim()

  // ------------------------------------------------------------------ save
  const save = async (nextStatus: BlogPostStatus) => {
    setError(null)
    if (slugError) return setError(slugError)
    if (nextStatus === 'published' && !canPublish) return setError(tb('needsPortuguese'))
    setSaving(true)
    try {
      if (await BlogAdminService.isSlugTaken(state.slug, postId)) {
        setError(tb('slugTaken'))
        return
      }
      const removed = savedLocales.filter((l) => !state.translations[l])
      const id = await BlogAdminService.savePost(postId, {
        slug: state.slug,
        status: nextStatus,
        cover_route_id: state.coverImage ? null : state.cover?.id ?? null,
        cover_image_url: state.coverImage?.url ?? null,
        cover_image_credit: state.coverImage?.credit ?? null,
        published_at: state.date ? `${state.date}T12:00:00Z` : null,
        translations: [
          ...languages.map((l) => ({ locale: l, ...(state.translations[l] as Content) })),
          ...removed.map((l) => ({ locale: l, ...emptyContent() })),
        ],
      })
      setSaved(JSON.stringify(state))
      setStatus(nextStatus)
      setSavedLocales(languages.filter((l) => state.translations[l]?.title.trim()))
      if (nextStatus !== 'draft') setSlugLocked(true)
      setJustSaved(true)
      window.setTimeout(() => setJustSaved(false), 2000)
      if (!postId) router.replace(`/${locale}/profile/admin/blog/${id}`)
    } catch (e) {
      console.error(e)
      setError(tb('errorSave', { message: (e as { message?: string })?.message ?? '' }))
    } finally {
      setSaving(false)
    }
  }

  const leave = (e: React.MouseEvent) => {
    if (dirty && !window.confirm(tb('unsaved'))) e.preventDefault()
  }

  const onPick = (r: RouteOption) => {
    if (picker === 'cover') setState((s) => ({ ...s, cover: r, coverImage: null }))
    else editor.current?.insertBlock(routeDirective(r.slug))
    setPicker(null)
    // The dialog gives focus back to its trigger when it closes; keep typing in the editor
    if (picker === 'route') window.setTimeout(() => editor.current?.focus(), 50)
  }

  // ---------------------------------------------------------------- images
  const upload = async (file: File | undefined, target: 'cover' | 'body') => {
    if (!file) return
    setError(null)
    setUploading(target)
    try {
      const url = await uploadBlogImage(file)
      if (target === 'cover') {
        setState((s) => ({ ...s, cover: null, coverImage: { url, credit: '' } }))
      } else {
        editor.current?.insertBlock(`![${tb('imageAltPlaceholder')}](${url})`)
        window.setTimeout(() => editor.current?.focus(), 50)
      }
    } catch (e) {
      console.error(e)
      setError(e instanceof InvalidImageError ? tb('imageInvalid') : tb('imageUploadFailed'))
    } finally {
      setUploading(null)
    }
  }

  // ------------------------------------------------------------------- UI
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (notFound) return <p className="py-16 text-center text-muted-foreground">{tb('errorLoad')}</p>

  const tools = [
    { icon: Bold, label: tb('toolbar.bold'), run: () => editor.current?.wrap('**', '**', tb('textPlaceholder')) },
    { icon: Italic, label: tb('toolbar.italic'), run: () => editor.current?.wrap('_', '_', tb('textPlaceholder')) },
    { icon: Heading2, label: tb('toolbar.heading'), run: () => editor.current?.prefixLines('## ') },
    { icon: Heading3, label: tb('toolbar.subheading'), run: () => editor.current?.prefixLines('### ') },
    { icon: List, label: tb('toolbar.list'), run: () => editor.current?.prefixLines('- ') },
    { icon: ListOrdered, label: tb('toolbar.numbered'), run: () => editor.current?.prefixLines('1. ') },
    { icon: Quote, label: tb('toolbar.quote'), run: () => editor.current?.prefixLines('> ') },
    { icon: Link2, label: tb('toolbar.link'), run: () => editor.current?.wrap('[', '](https://)', 'link') },
    { icon: Lightbulb, label: tb('toolbar.tip'), run: () => editor.current?.insertBlock(`:::tip\n${tb('tipPlaceholder')}\n:::`) },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href={`/${locale}/profile/admin/blog`} onClick={leave} className="mb-1 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {tb('back')}
          </Link>
          <h2 className="flex items-center gap-3 text-2xl font-bold">
            {postId ? tb('editTitle') : tb('newTitle')}
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{tb(`status.${status}`)}</span>
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {justSaved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" /> {tb('saved')}
            </span>
          )}
          {status === 'published' && postId && (
            <Button variant="ghost" asChild>
              <a href={`/${locale}/blog/${state.slug}`} target="_blank" rel="noreferrer">{tb('view')}</a>
            </Button>
          )}
          <Button variant="outline" disabled={saving} onClick={() => save(status)}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === 'draft' ? tb('saveDraft') : tb('save')}
          </Button>
          {status === 'published' ? (
            <Button variant="outline" disabled={saving} onClick={() => save('archived')}>
              {tb('deactivate')}
            </Button>
          ) : (
            <Button disabled={saving || !canPublish} onClick={() => save('published')}>
              {status === 'archived' ? tb('reactivate') : tb('publish')}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {missingSlugs.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-amber-400/50 bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {tb('missingRoutes', { slugs: missingSlugs.join(', ') })}
        </div>
      )}

      {/* Post settings */}
      <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="slug">{tb('slug')}</Label>
          <Input
            id="slug"
            value={state.slug}
            disabled={slugLocked}
            onChange={(e) => {
              setSlugTouched(true)
              setState((s) => ({ ...s, slug: e.target.value.toLowerCase() }))
            }}
            className={cn(state.slug && slugError && 'border-destructive')}
          />
          <p className="text-xs text-muted-foreground">
            {slugLocked ? tb('slugLocked') : state.slug && slugError ? slugError : tb('slugHelp', { slug: state.slug || '…' })}
          </p>
        </div>
        <div className="space-y-1.5">
          <Label>{tb('cover')}</Label>
          {state.coverImage ? (
            <div className="space-y-2 rounded-md border p-1.5">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={state.coverImage.url} alt="" className="h-9 w-14 shrink-0 rounded object-cover" />
                <span className="min-w-0 flex-1 truncate text-sm">{tb('coverImage')}</span>
                <Button size="sm" variant="ghost" disabled={!!uploading} onClick={() => coverInput.current?.click()}>
                  {uploading === 'cover' ? <Loader2 className="h-4 w-4 animate-spin" /> : tb('changeImage')}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" title={tb('removeCover')} onClick={() => setState((s) => ({ ...s, coverImage: null }))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                aria-label={tb('coverCredit')}
                placeholder={tb('coverCreditPlaceholder')}
                maxLength={200}
                value={state.coverImage.credit}
                onChange={(e) => setState((s) => (s.coverImage ? { ...s, coverImage: { ...s.coverImage, credit: e.target.value } } : s))}
                className="h-8 text-sm"
              />
            </div>
          ) : state.cover ? (
            <div className="flex items-center gap-2 rounded-md border p-1.5">
              {state.cover.thumbnail_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={state.cover.thumbnail_url} alt="" className="h-9 w-14 shrink-0 rounded object-cover" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm">{state.cover.title}</span>
              <Button size="sm" variant="ghost" onClick={() => setPicker('cover')}>{tb('changeRoute')}</Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" title={tb('removeCover')} onClick={() => setState((s) => ({ ...s, cover: null }))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start" onClick={() => setPicker('cover')}>
                <MapPin className="mr-2 h-4 w-4" /> {tb('chooseRoute')}
              </Button>
              <Button variant="outline" className="justify-start" disabled={!!uploading} onClick={() => coverInput.current?.click()}>
                {uploading === 'cover' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                {tb('uploadImage')}
              </Button>
            </div>
          )}
          <input
            ref={coverInput}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={(e) => {
              upload(e.target.files?.[0], 'cover')
              e.target.value = ''
            }}
          />
          <p className="text-xs text-muted-foreground">{tb('coverHelp')}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">{tb('date')}</Label>
          <Input id="date" type="date" value={state.date} onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))} />
          <p className="text-xs text-muted-foreground">{tb('dateHelp')}</p>
        </div>
      </div>

      {/* Languages */}
      <div className="flex flex-wrap items-center gap-2 border-b">
        {languages.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setActive(l)}
            className={cn(
              '-mb-px border-b-2 px-3 py-2 text-sm font-medium',
              active === l ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {languageName(l)}
            {!state.translations[l]?.title.trim() && <span className="ml-1 text-amber-600">•</span>}
          </button>
        ))}
        {missingLanguages.length > 0 && (
          <select
            aria-label={tb('addLanguage')}
            value=""
            onChange={(e) => e.target.value && addLanguage(e.target.value as BlogLocale)}
            className="ml-2 h-8 rounded-md border bg-background px-2 text-sm text-muted-foreground"
          >
            <option value="">+ {tb('addLanguage')}</option>
            {missingLanguages.map((l) => (
              <option key={l} value={l}>{languageName(l)}</option>
            ))}
          </select>
        )}
        {languages.length > 1 && (
          <Button size="sm" variant="ghost" className="ml-auto text-muted-foreground" onClick={() => removeLanguage(active)}>
            {tb('removeLanguage')}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">{tb('fieldTitle')}</Label>
          <Input id="title" value={content.title} onChange={(e) => setContent({ title: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <Label htmlFor="description">{tb('fieldDescription')}</Label>
            <span className={cn('text-xs text-muted-foreground', content.description.length > DESCRIPTION_MAX && 'text-amber-600')}>
              {content.description.length}/{DESCRIPTION_MAX}
            </span>
          </div>
          <Textarea id="description" rows={2} value={content.description} onChange={(e) => setContent({ description: e.target.value })} />
        </div>
      </div>

      {/* Write / preview toggle on small screens */}
      <div className="flex gap-1 lg:hidden">
        {(['write', 'preview'] as const).map((v) => (
          <Button key={v} size="sm" variant={mobileView === v ? 'default' : 'outline'} onClick={() => setMobileView(v)}>
            {v === 'write' ? tb('write') : tb('preview')}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-lg border', mobileView !== 'write' && 'hidden lg:flex')}>
          <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
            {tools.map(({ icon: Icon, label, run }) => (
              <Button key={label} type="button" size="icon" variant="ghost" className="h-8 w-8" title={label} aria-label={label} onClick={run}>
                <Icon className="h-4 w-4" />
              </Button>
            ))}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              title={tb('toolbar.image')}
              aria-label={tb('toolbar.image')}
              disabled={!!uploading}
              onClick={() => bodyInput.current?.click()}
            >
              {uploading === 'body' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </Button>
            <input
              ref={bodyInput}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              className="hidden"
              onChange={(e) => {
                upload(e.target.files?.[0], 'body')
                e.target.value = ''
              }}
            />
            <Button type="button" size="sm" variant="secondary" className="ml-auto h-8" onClick={() => setPicker('route')}>
              <MapPin className="mr-1.5 h-4 w-4" /> {tb('toolbar.route')}
            </Button>
          </div>
          <div className="h-[65vh] min-h-[420px]">
            <MarkdownEditor key={active} value={content.body_md} onChange={onBodyChange} placeholder={tb('bodyPlaceholder')} editorRef={editor} />
          </div>
        </div>

        <div className={cn('min-w-0 overflow-y-auto rounded-lg border p-6 lg:h-[calc(65vh+41px)]', mobileView !== 'preview' && 'hidden lg:block')}>
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{tb('preview')}</p>
          {content.title && <h1 className="mb-3 text-3xl font-bold leading-tight tracking-tight">{content.title}</h1>}
          {content.description && <p className="mb-6 text-muted-foreground">{content.description}</p>}
          {previewBody.trim() ? (
            <BlogMarkdown
              markdown={previewBody}
              locale={active}
              routes={previewRoutes}
              renderMissingRoute={(slug) =>
                routeCache.has(slug) ? (
                  <div className="mx-auto max-w-md rounded-lg border-2 border-dashed border-amber-400 p-4 text-sm text-amber-700">
                    {tb('missingRouteCard', { slug })}
                  </div>
                ) : (
                  <div className="mx-auto h-40 max-w-md animate-pulse rounded-lg bg-muted" />
                )
              }
            />
          ) : (
            <p className="text-sm text-muted-foreground">{tb('emptyPreview')}</p>
          )}
        </div>
      </div>

      <RoutePickerDialog
        open={!!picker}
        title={picker === 'cover' ? tb('pickerCoverTitle') : tb('pickerTitle')}
        onOpenChange={(o) => !o && setPicker(null)}
        onPick={onPick}
      />
    </div>
  )
}
