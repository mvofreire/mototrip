'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/auth/auth.service'
import type { AuthUser } from '@/types/auth.types'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { rememberAccountBlock } from '@/lib/auth/account-block'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Resolves with needsConfirmation=true when the user must confirm by email */
  signUp: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async (authUser: User | null) => {
      try {
        // Suspended/banned users may still hold a valid access token for a
        // while: sign them out and let the login page explain why.
        if (authUser) {
          const block = await authService.getAccountBlock()
          if (block) {
            rememberAccountBlock(block)
            await supabase.auth.signOut({ scope: 'local' })
            const locale = window.location.pathname.split('/')[1] || 'pt'
            window.location.replace(`/${locale}/auth/login?blocked=1`)
            return
          }
        }
        const next = authUser ? await authService.toAuthUser(authUser) : null
        if (active) setUser(next)
      } catch (e) {
        console.error('Failed to load user', e)
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }

    // The callback runs while supabase-js holds its auth lock: awaiting any
    // supabase call inside it deadlocks every later request (endless spinners).
    // Keep it synchronous and do the async work after the lock is released.
    // INITIAL_SESSION covers the first load, so no separate getUser() is needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => load(session?.user ?? null), 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
    const user = await authService.getCurrentUser()
    setUser(user)
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const data = await authService.signUp(email, password, fullName)
    // With email confirmation enabled Supabase returns no session yet
    if (!data.session) return { needsConfirmation: true }
    const user = await authService.getCurrentUser()
    setUser(user)
    return { needsConfirmation: false }
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
    // Redirect to home page
    window.location.href = '/'
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
