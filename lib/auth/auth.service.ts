import { supabase } from '@/lib/supabase/client'
import type { AuthUser, Profile } from '@/types/auth.types'

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
        },
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

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

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

  // Reset password (request)
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
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
