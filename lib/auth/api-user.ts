import { createClient } from '@supabase/supabase-js'
import type { UserRole } from '@/types/auth.types'

export interface ApiUser {
  id: string
  role: UserRole
}

/**
 * The signed-in user of an API request, from its `Authorization: Bearer`
 * access token. The role comes from the database, never from the client.
 */
export async function getApiUser(request: Request): Promise<ApiUser | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!url || !anonKey || !token) return null

  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: auth } = await supabase.auth.getUser(token)
  if (!auth?.user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .maybeSingle()

  return { id: auth.user.id, role: (profile?.role as UserRole | undefined) ?? 'contributor' }
}
