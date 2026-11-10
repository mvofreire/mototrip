'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { AdminService } from '@/lib/services/admin.service'
import { AdminNav } from '@/components/admin/admin-nav'
import { BlogPostEditor } from '@/components/admin/blog-post-editor'

/** /profile/admin/blog/new creates a post; /profile/admin/blog/<id> edits one */
export default function AdminBlogPostPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('admin')
  const [allowed, setAllowed] = useState(false)
  const postId = params.id === 'new' ? null : params.id

  useEffect(() => {
    const init = async () => {
      if (authLoading) return
      const here = `/${locale}/profile/admin/blog/${params.id}`
      if (!user) {
        router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(here)}`)
        return
      }
      const role = await AdminService.getRole()
      if (role !== 'admin' && role !== 'curator') {
        router.push(`/${locale}/profile`)
        return
      }
      setAllowed(true)
    }
    init()
  }, [user, authLoading, router, locale, params.id])

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
      </div>
      <AdminNav />
      <BlogPostEditor key={params.id} postId={postId} />
    </div>
  )
}
