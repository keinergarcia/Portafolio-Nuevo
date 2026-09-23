import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Profile } from '@/types'

const NO_CONFIG =
  'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'

export async function signInWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured()) throw new Error(NO_CONFIG)
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export async function signOut() {
  if (!isSupabaseConfigured()) return
  await supabase.auth.signOut()
}

export async function getStoredSession(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.user ?? null
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  if (!isSupabaseConfigured()) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => data.subscription.unsubscribe()
}

export async function fetchCurrentProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) return null
  return data as unknown as Profile
}