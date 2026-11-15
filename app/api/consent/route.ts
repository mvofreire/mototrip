import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { locales } from '@/i18n'
import { isUuid } from '@/lib/route-url'
import { CONSENT_CATEGORIES } from '@/lib/consent'

/**
 * Proof of cookie consent (GDPR art. 7(1)): the anonymous consent id from the
 * visitor's cookie, what they accepted, the banner revision and when. No IP,
 * user agent or account is stored.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const { consentId, categories, revision, action, locale } = body
  const valid =
    typeof consentId === 'string' &&
    isUuid(consentId) &&
    Array.isArray(categories) &&
    categories.length <= CONSENT_CATEGORIES.length &&
    categories.every((c) => (CONSENT_CATEGORIES as readonly unknown[]).includes(c)) &&
    Number.isInteger(revision) &&
    (action === 'first' || action === 'change') &&
    (locales as readonly unknown[]).includes(locale)
  if (!valid) return NextResponse.json({ error: 'invalid' }, { status: 400 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return NextResponse.json({ error: 'unavailable' }, { status: 503 })
  const supabase = createClient(url, key, { auth: { persistSession: false } })

  const { error } = await supabase.from('consent_logs').insert({
    consent_id: consentId,
    categories,
    revision,
    action,
    locale,
  } as never)
  if (error) {
    console.error('Could not log consent:', error.message)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
