'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Archive, ExternalLink, Eye, MoreHorizontal, Pencil, Plus, RefreshCw, Search, SearchCheck, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BlogAdminService } from '@/lib/services/blog-admin.service'
import { coverOf, pickTranslation, type BlogPost } from '@/lib/blog/posts'
import { seoChecks } from '@/lib/blog/seo'
import { AdminPageHeader } from '@/components/admin/admin-shell'
import { FilterChip } from '@/components/admin/filter-chip'
import { SeoScore } from '@/components/admin/seo-score'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { BlogPostStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

type Filter = BlogPostStatus | 'all'
const FILTERS: Filter[] = ['all', 'published', 'draft', 'archived']

const STATUS_STYLE: Record<BlogPostStatus, string> = {
  published: 'border-green-600/40 bg-green-600/10 text-green-700 dark:text-green-400',
  draft: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  archived: 'border-border bg-muted text-muted-foreground',
}

export default function AdminBlogPage() {
  const locale = useLocale()
  const t = useTranslations('admin')
  const tb = useTranslations('admin.blog')
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [toDelete, setToDelete] = useState<BlogPost | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setPosts(await BlogAdminService.listPosts())
    } catch (e) {
      console.error('Error loading posts:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: posts.length, published: 0, draft: 0, archived: 0 }
    posts.forEach((p) => c[p.status]++)
    return c
  }, [posts])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return posts
      .filter((p) => filter === 'all' || p.status === filter)
      .filter((p) => !q || p.slug.includes(q) || p.translations.some((tr) => tr.title.toLowerCase().includes(q)))
  }, [posts, filter, search])

  const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso)) : '—')

  const setStatus = async (post: BlogPost, status: BlogPostStatus) => {
    try {
      await BlogAdminService.setStatus(post.id, status)
      await load()
    } catch (e) {
      console.error(e)
      alert(tb('errorAction'))
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await BlogAdminService.deletePost(toDelete.id)
      setPosts((prev) => prev.filter((p) => p.id !== toDelete.id))
    } catch (e) {
      console.error(e)
      alert(tb('errorAction'))
    } finally {
      setToDelete(null)
    }
  }

  return (
    <div>
      <AdminPageHeader title={t('shell.blog')} description={tb('title')}>
        <Button onClick={load} variant="outline" size="icon" disabled={loading} aria-label={t('refresh')} title={t('refresh')}>
          <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
        </Button>
        {/* The global "primary button" fix only covers <button>, so the link gets the color itself */}
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href={`/${locale}/profile/admin/blog/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {tb('newPost')}
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <FilterChip key={f} active={filter === f} count={counts[f]} onClick={() => setFilter(f)}>
            {f === 'all' ? tb('all') : tb(`status.${f}`)}
          </FilterChip>
        ))}
        <div className="relative ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={tb('search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">{tb('columns.title')}</th>
              <th className="p-3 font-medium">{tb('columns.status')}</th>
              <th className="hidden p-3 font-medium xl:table-cell">{tb('columns.languages')}</th>
              <th className="p-3 font-medium">{tb('columns.seo')}</th>
              <th className="hidden whitespace-nowrap p-3 font-medium lg:table-cell">{tb('columns.date')}</th>
              <th className="hidden whitespace-nowrap p-3 font-medium 2xl:table-cell">{tb('columns.updated')}</th>
              <th className="w-[52px] p-3">
                <span className="sr-only">{tb('columns.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  {loading ? <RefreshCw className="mx-auto h-5 w-5 animate-spin" /> : tb('empty')}
                </td>
              </tr>
            )}
            {visible.map((post) => {
              const tr = pickTranslation(post, locale)
              const cover = coverOf(post)
              const seoTr = post.translations.find((x) => x.locale === 'pt') ?? post.translations[0]
              return (
                <tr key={post.id} className="border-t align-middle">
                  <td className="w-full max-w-0 p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/${locale}/profile/admin/blog/${post.id}`} className="block truncate font-medium hover:text-primary">
                          {tr?.title ?? post.slug}
                        </Link>
                        <div className="truncate text-xs text-muted-foreground">/blog/{post.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={STATUS_STYLE[post.status]}>
                      {tb(`status.${post.status}`)}
                    </Badge>
                  </td>
                  <td className="hidden whitespace-nowrap p-3 uppercase text-muted-foreground xl:table-cell">
                    {post.translations.map((x) => x.locale).sort().join(' · ')}
                  </td>
                  <td className="p-3">
                    {seoTr && (
                      <Link href={`/${locale}/profile/admin/blog/${post.id}?tab=seo`} title={tb('seo.scoreTitle')}>
                        <SeoScore score={seoChecks(seoTr, post.slug).score} size="sm" />
                      </Link>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap p-3 lg:table-cell">{fmt(post.published_at)}</td>
                  <td className="hidden whitespace-nowrap p-3 text-muted-foreground 2xl:table-cell">{fmt(post.updated_at)}</td>
                  <td className="p-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={tb('columns.actions')}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/profile/admin/blog/${post.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {tb('edit')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/${locale}/profile/admin/blog/${post.id}?tab=seo`}>
                            <SearchCheck className="mr-2 h-4 w-4" />
                            {tb('editSeo')}
                          </Link>
                        </DropdownMenuItem>
                        {post.status === 'published' && (
                          <DropdownMenuItem asChild>
                            <a href={`/${locale}/blog/${post.slug}`} target="_blank" rel="noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {tb('view')}
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {post.status === 'published' ? (
                          <DropdownMenuItem onSelect={() => setStatus(post, 'archived')}>
                            <Archive className="mr-2 h-4 w-4" />
                            {tb('deactivate')}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onSelect={() => setStatus(post, 'published')}
                            disabled={!post.translations.some((x) => x.locale === 'pt')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {post.status === 'archived' ? tb('reactivate') : tb('publish')}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setToDelete(post)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {tb('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tb('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {tb('deleteDescription', { title: toDelete ? pickTranslation(toDelete, locale)?.title ?? toDelete.slug : '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tb('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {tb('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
