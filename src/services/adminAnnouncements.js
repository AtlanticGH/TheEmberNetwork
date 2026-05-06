import { supabase } from '@/lib/supabaseClient'

export async function listAnnouncements() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createAnnouncement(payload) {
  const { data, error } = await supabase
    .from('announcements')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function publishAnnouncement(id) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ published_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

