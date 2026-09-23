import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey)

const PLACEHOLDER_URL = 'https://placeholder.supabase.co'

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || PLACEHOLDER_URL,
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)