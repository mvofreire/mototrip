import type { User } from '@supabase/supabase-js'
import { trackEvent } from '@/lib/analytics'

const STORAGE_PREFIX = 'mototrip:auth-tracked:'
/** A sign-in older than this is a session being restored, not a new login */
const FRESH_SIGN_IN_MS = 10 * 60 * 1000
/** A first sign-in this close to account creation/confirmation is the sign-up */
const NEW_ACCOUNT_MS = 2 * 60 * 1000

const time = (value: string | null | undefined) => (value ? Date.parse(value) : NaN)

/** Provider of the identity used in the latest sign-in (email, google…) */
function signInMethod(user: User): string {
  const latest = [...(user.identities ?? [])].sort(
    (a, b) => time(b.last_sign_in_at) - time(a.last_sign_in_at),
  )[0]
  return latest?.provider ?? user.app_metadata?.provider ?? 'unknown'
}

function storageKey(user: User) {
  return `${STORAGE_PREFIX}${user.id}:${user.last_sign_in_at}`
}

/**
 * Mark the user's current sign-in as already handled, so it is not counted as
 * a `login` (e.g. re-entering the password to change it).
 */
export function skipAuthTracking(user: User | null | undefined) {
  if (!user?.last_sign_in_at) return
  try {
    localStorage.setItem(storageKey(user), '1')
  } catch {
    // Storage blocked: the event may be sent, nothing else breaks
  }
}

/**
 * Sends `sign_up` or `login` once per real sign-in. Called whenever the auth
 * state loads a user, which covers every way in: email + password, Google
 * (via /auth/callback) and the email confirmation link.
 *
 * Supabase updates `last_sign_in_at` only when a new session is created (not
 * on token refresh or page loads), so it identifies one sign-in; the key in
 * localStorage keeps it from being sent twice. The very first sign-in of an
 * account happens right when it is created (Google, no confirmation) or
 * confirmed (email link), which is how a sign-up is told apart from a login.
 */
export function trackAuth(user: User) {
  const signedInAt = time(user.last_sign_in_at)
  if (Number.isNaN(signedInAt) || Date.now() - signedInAt > FRESH_SIGN_IN_MS) return

  const key = storageKey(user)
  try {
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
  } catch {
    // No storage (private mode): send it anyway, at worst twice
  }

  const accountReadyAt = time(user.email_confirmed_at ?? user.confirmed_at ?? user.created_at)
  const isNewAccount = Math.abs(signedInAt - accountReadyAt) < NEW_ACCOUNT_MS
  trackEvent(isNewAccount ? 'sign_up' : 'login', { method: signInMethod(user) })
}
