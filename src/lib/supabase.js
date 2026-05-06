import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export function getSupabaseConfigError() {
  return 'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
}

// We intentionally do NOT crash the marketing site if Supabase isn't configured yet.
// Instead, we throw a friendly error only when code paths actually need Supabase.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function requireSupabase() {
  if (!supabase) throw new Error(getSupabaseConfigError())
  return supabase
}

export async function testSupabaseConnection() {
  try {
    const supabase = requireSupabase()
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    if (error) {
      console.error('Supabase connection error:', error)
      return { ok: false, error }
    }
    console.log('Supabase connected:', data)
    return { ok: true, data }
  } catch (e) {
    console.error('Supabase connection error:', e)
    return { ok: false, error: e }
  }
}

// Optional auth helpers (generic; app may enforce its own signup rules elsewhere)
export const signIn = (email, password) => requireSupabase().auth.signInWithPassword({ email, password })
export const signUp = (email, password) => requireSupabase().auth.signUp({ email, password })
export const signOut = () => requireSupabase().auth.signOut()

