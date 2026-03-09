'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '@/lib/auth/auth.service'
import type { AuthUser } from '@/types/auth.types'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    authService.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser()
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
    const user = await authService.getCurrentUser()
    setUser(user)
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    await authService.signUp(email, password, fullName)
    const user = await authService.getCurrentUser()
    setUser(user)
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
