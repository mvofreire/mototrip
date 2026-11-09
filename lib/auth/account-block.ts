import type { AccountBlock } from '@/types/auth.types'

/**
 * A suspended/banned user is signed out and sent to the login page, which
 * explains why. The details travel in sessionStorage (never in the URL).
 */
const KEY = 'mototrip:account-block'

export function rememberAccountBlock(block: AccountBlock) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(block))
  } catch {}
}

/** Reads the stored block once, then forgets it */
export function takeAccountBlock(): AccountBlock | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    return raw ? (JSON.parse(raw) as AccountBlock) : null
  } catch {
    return null
  }
}

/** Supabase Auth answers "User is banned" (code user_banned) while banned_until is set */
export function isBannedError(error: unknown): boolean {
  const e = error as { code?: string; message?: string } | string | null
  const text = typeof e === 'string' ? e : `${e?.code ?? ''} ${e?.message ?? ''}`
  return /banned/i.test(text)
}
