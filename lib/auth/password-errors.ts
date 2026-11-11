/**
 * Translation key (in the `password` namespace) for an error thrown by a
 * Supabase password call, so users never see raw English API messages.
 */
export function passwordErrorKey(err: unknown): string {
  const { code, status } = (err ?? {}) as { code?: string; status?: number }
  switch (code) {
    case 'invalid_credentials':
      return 'wrongCurrent'
    case 'same_password':
      return 'samePassword'
    case 'weak_password':
      return 'weakPassword'
  }
  if (status === 429 || code?.startsWith('over_')) return 'rateLimited'
  return 'genericError'
}
