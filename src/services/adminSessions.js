import { supabase } from '@/lib/supabaseClient'

export async function listSessions() {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .gte('starts_at', now)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createSession(payload) {
  const { data, error } = await supabase
    .from('sessions')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error
  return data
}

