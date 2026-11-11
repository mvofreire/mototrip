import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { AccountBlock, AuthUser, Profile } from '@/types/auth.types'
import { authRedirectUrl, currentLocale } from '@/lib/auth/redirects'

// Readable profile columns (email is intentionally not granted to clients)
const PROFILE_COLUMNS = 'id, full_name, avatar_url, role, created_at, updated_at'

export const authService = {
  // Sign up with email and password
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          // Read by the Supabase auth email templates to pick the language
          locale: currentLocale(),
        },
        // Where the confirmation link lands (otherwise Supabase's Site URL)
        emailRedirectTo: authRedirectUrl(''),
      },
    })

    if (error) throw error
    return data
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  // Sign in (or sign up) with Google. Leaves the page; the session is picked up
  // on /auth/callback, which then sends the user to `redirect`.
  async signInWithGoogle(redirect?: string | null) {
    const callback = authRedirectUrl('/auth/callback')
    const redirectTo = redirect
      ? `${callback}?redirect=${encodeURIComponent(redirect)}`
      : callback

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // Let people with several Google accounts pick one
        queryParams: { prompt: 'select_account' },
      },
    })

    if (error) throw error
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user (validates the session with the auth server)
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user ? this.toAuthUser(user) : null
  },

  // Attach the profile row to an auth user
  async toAuthUser(user: User): Promise<AuthUser> {
    const { data: profile } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email!,
      // email is not readable from profiles (column privileges); take it from auth
      profile: profile ? ({ ...(profile as object), email: user.email! } as Profile) : null,
    }
  },

  // Suspension / ban of the signed-in user (null when active or signed out)
  async getAccountBlock(): Promise<AccountBlock | null> {
    const { data, error } = await (supabase as any).rpc('my_account_status')
    if (error) return null
    const row = (data as any[])?.[0]
    if (!row || row.status === 'active') return null
    return { status: row.status, until: row.suspended_until ?? null, reason: row.reason ?? null }
  },

  // Reset password (request)
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirectUrl('/auth/reset-password'),
    })

    if (error) throw error
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  },

  // Change the signed-in user's password. Users who already have one must
  // confirm it first; Google-only users (no password yet) just set one.
  async changePassword(newPassword: string, currentPassword?: string) {
    if (currentPassword !== undefined) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Not signed in')
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (error) throw error
    }
    await this.updatePassword(newPassword)
  },

  // Whether the signed-in user signs in with email + password (vs Google only)
  async hasPassword(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    return !!user?.identities?.some((identity) => identity.provider === 'email')
  },

  // Keep user_metadata.locale on the language the user browses in: the auth
  // email templates (confirm signup, reset password) read it. Covers Google
  // sign-ups and accounts created before the locale was stored.
  async syncLocale(user: User) {
    const locale = currentLocale()
    if (user.user_metadata?.locale === locale) return
    const { error } = await supabase.auth.updateUser({ data: { locale } })
    if (error) console.warn('Could not save the user locale', error.message)
  },

  // Update profile
  async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'full_name' | 'avatar_url'>>,
  ) {
    const { data, error } = await (supabase as any)
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single()

    if (error) throw error
    return data as Profile
  },
}
