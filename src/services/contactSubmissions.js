import { isSupabaseConfigured, requireSupabase } from './supabaseClient'

export async function submitContact(payload) {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase is not configured.' }
  }
  const supabase = requireSupabase()
  const row = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    subject: payload.subject,
    message: payload.message,
  }
  const { data, error } = await supabase.from('contact_submissions').insert(row).select('id, created_at').single()
  if (error) throw error
  return { ok: true, data }
}

