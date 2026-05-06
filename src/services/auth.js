import { requireSupabase } from './supabaseClient'
import { isSupabaseConfigured } from './supabaseClient'

export async function signUpWithEmail({ email, password, fullName }) {
  // Public signup is intentionally disabled. Accounts are created only after an approved application.
  // Keep the signature for backwards-compatibility with any older UI that might still call it.
  void email
  void password
  void fullName
  throw new Error('Public sign up is disabled. Please apply for membership to join The Ember Network.')
}

export async function signInWithEmail({ email, password }) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const supabase = requireSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!isSupabaseConfigured) return
  const supabase = requireSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function sendPasswordReset(email) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const supabase = requireSupabase()
  const redirectTo = `${window.location.origin}/login`
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
  return data
}

export async function updateMyPassword(newPassword) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')
  const supabase = requireSupabase()
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
    data: { force_password_reset: false },
  })
  if (error) throw error
  return data
}

