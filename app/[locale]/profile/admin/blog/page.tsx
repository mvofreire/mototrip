'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Archive, ExternalLink, Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AdminService } from '@/lib/services/admin.service'
import { BlogAdminService } from '@/lib/services/blog-admin.service'
import { pickTranslation, type BlogPost } from '@/lib/blog/posts'
import { AdminNav } from '@/components/admin/admin-nav'
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
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin')
  const tb = useTranslations('admin.blog')
  const [allowed, setAllowed] = useState(false)
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
    const init = async () => {
      if (authLoading) return
      if (!user) {
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(`/${locale}/profile/admin/blog`)}`)
        return
      }
      const role = await AdminService.getRole()
      if (role !== 'admin' && role !== 'curator') {
        router.push(`/${locale}/profile`)
        return
      }
      setAllowed(true)
      await load()
    }
    init()
  }, [user, authLoading, router, locale, load])

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

  if (authLoading || !allowed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">{t('pageTitle')}</h1>
        <p className="text-muted-foreground">{tb('title')}</p>
      </div>

      <AdminNav />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
              {f === 'all' ? tb('all') : tb(`status.${f}`)} ({counts[f]})
            </Button>
          ))}
        </div>
        <Button asChild>
          <Link href={`/${locale}/profile/admin/blog/new`}>
            <Plus className="mr-2 h-4 w-4" />
            {tb('newPost')}
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative min-w-[200px] max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={tb('search')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Button onClick={load} variant="outline" disabled={loading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          {t('refresh')}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">{tb('columns.title')}</th>
              <th className="p-3 font-medium">{tb('columns.status')}</th>
              <th className="p-3 font-medium">{tb('columns.languages')}</th>
              <th className="p-3 font-medium">{tb('columns.date')}</th>
              <th className="p-3 font-medium">{tb('columns.updated')}</th>
              <th className="p-3 text-right font-medium">{tb('columns.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  {loading ? <RefreshCw className="mx-auto h-5 w-5 animate-spin" /> : tb('empty')}
                </td>
              </tr>
            )}
            {visible.map((post) => {
              const tr = pickTranslation(post, locale)
              return (
                <tr key={post.id} className="border-t align-top">
                  <td className="p-3">
                    <Link href={`/${locale}/profile/admin/blog/${post.id}`} className="font-medium hover:text-primary">
                      {tr?.title ?? post.slug}
                    </Link>
                    <div className="text-xs text-muted-foreground">/blog/{post.slug}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className={STATUS_STYLE[post.status]}>
                      {tb(`status.${post.status}`)}
                    </Badge>
                  </td>
                  <td className="p-3 uppercase text-muted-foreground">
                    {post.translations.map((x) => x.locale).sort().join(' · ')}
                  </td>
                  <td className="whitespace-nowrap p-3">{fmt(post.published_at)}</td>
                  <td className="whitespace-nowrap p-3 text-muted-foreground">{fmt(post.updated_at)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="sm" variant="ghost" title={tb('edit')}>
                        <Link href={`/${locale}/profile/admin/blog/${post.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      {post.status === 'published' && (
                        <Button asChild size="sm" variant="ghost" title={tb('view')}>
                          <a href={`/${locale}/blog/${post.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {post.status === 'published' ? (
                        <Button size="sm" variant="ghost" title={tb('deactivate')} onClick={() => setStatus(post, 'archived')}>
                          <Archive className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          title={post.status === 'archived' ? tb('reactivate') : tb('publish')}
                          onClick={() => setStatus(post, 'published')}
                          disabled={!post.translations.some((x) => x.locale === 'pt')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" title={tb('delete')} onClick={() => setToDelete(post)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
