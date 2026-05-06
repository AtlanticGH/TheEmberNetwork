import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export function getSupabaseConfigError() {
  return 'Supabase is not configured. Set VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY) in your env.'
}

export function requireSupabase() {
  if (!isSupabaseConfigured) {
    throw new Error(getSupabaseConfigError())
  }
  return supabase
}

// We intentionally do NOT crash the marketing site if Supabase isn't configured yet.
// Instead, we throw a friendly error only when code paths actually need Supabase.
export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

