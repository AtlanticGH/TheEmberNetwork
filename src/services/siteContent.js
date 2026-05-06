import { requireSupabase } from './supabaseClient'

// Simple client-side CMS accessor.
// - Public reads are allowed via RLS (anon/auth)
// - Writes require staff/admin

export async function getSiteContent(key) {
  const supabase = requireSupabase()
  const { data, error } = await supabase.from('site_content').select('key,value,updated_at').eq('key', key).maybeSingle()
  if (error) throw error
  return data || null
}

export async function upsertSiteContent({ key, value }) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_by: (await supabase.auth.getUser()).data?.user?.id || null }, { onConflict: 'key' })
    .select('key,value,updated_at')
    .single()
  if (error) throw error
  return data
}

