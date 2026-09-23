/* oxlint-disable react/set-state-in-effect, react/only-export-components -- contexto de auth: sincronización con sistema externo (Supabase) y patrón provider+hook */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  fetchCurrentProfile,
  getStoredSession,
  signInWithPassword,
  signOut as supabaseSignOut,
  subscribeToAuth,
} from '@/services/supabase/auth'
import type { Profile } from '@/types'

interface AdminAuthContextValue {
  user: User | null
  profile: Profile | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getStoredSession().then((sessionUser) => {
      if (!active) return
      setUser(sessionUser)
      setLoading(false)
    })
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser)
      if (!nextUser) {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null)
      return
    }
    const next = await fetchCurrentProfile(user.id)
    setProfile(next)
  }, [user])

  useEffect(() => {
    if (user) void refreshProfile()
  }, [user, refreshProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithPassword(email, password)
  }, [])

  const signOut = useCallback(async () => {
    await supabaseSignOut()
  }, [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      profile,
      isAdmin: profile?.role === 'admin',
      loading,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, signIn, signOut, refreshProfile],
  )

  return <AdminAuthContext value={value}>{children}</AdminAuthContext>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth debe usarse dentro de <AdminAuthProvider>')
  return ctx
}