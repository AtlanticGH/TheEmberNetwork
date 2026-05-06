import { requireSupabase } from './supabaseClient'

export async function listCmsContentRows({ includeDrafts = false } = {}) {
  const supabase = requireSupabase()
  let q = supabase.from('cms_content').select('*').order('page_key').order('section_key')
  if (!includeDrafts) q = q.eq('published', true)
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function upsertCmsContentRow(row) {
  const supabase = requireSupabase()
  const { data: u } = await supabase.auth.getUser()
  const payload = {
    page_key: row.page_key,
    section_key: row.section_key,
    title: row.title ?? null,
    body: row.body ?? null,
    media_url: row.media_url ?? null,
    published: !!row.published,
    updated_by: u?.user?.id || null,
  }
  const { data, error } = await supabase
    .from('cms_content')
    .upsert(payload, { onConflict: 'page_key,section_key' })
    .select('*')
    .single()
  if (error) throw error
  return data
}
