import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

/**
 * Called by the admin after a post is saved, published, deactivated or
 * deleted, so the change shows on the site right away instead of after the
 * hourly revalidation. Only staff (admin or curator) may call it: the
 * Supabase session token is checked with is_staff().
 */
export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: isStaff, error } = await supabase.rpc('is_staff')
  if (error || isStaff !== true) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  revalidatePath('/[locale]/blog', 'page')
  revalidatePath('/[locale]/blog/[slug]', 'page')
  revalidatePath('/sitemap.xml')
  return NextResponse.json({ revalidated: true })
}
