/**
 * Full translation key (namespace.key) for an error thrown by sign-in or
 * sign-up, so users never see raw English Supabase messages.
 */
export function authErrorKey(err: unknown, action: 'signIn' | 'signUp'): string {
  const { code, status } = (err ?? {}) as { code?: string; status?: number }
  switch (code) {
    case 'invalid_credentials':
      return 'account.invalidCredentials'
    case 'email_not_confirmed':
      return 'account.emailNotConfirmed'
    case 'user_already_exists':
    case 'email_exists':
      return 'account.userExists'
    case 'email_address_invalid':
    case 'validation_failed':
      return 'account.invalidEmail'
    case 'weak_password':
      return 'password.weakPassword'
  }
  if (status === 429 || code?.startsWith('over_')) return 'password.rateLimited'
  return action === 'signIn' ? 'account.signInFailed' : 'account.signUpFailed'
}
