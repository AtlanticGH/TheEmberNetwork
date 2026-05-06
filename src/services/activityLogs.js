import { supabase } from '@/lib/supabaseClient'

export async function listActivityLogs({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, actor_user_id, action, entity_type, entity_id, metadata_json, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function logActivity({ action, entityType, entityId, metadata } = {}) {
  const { data: u } = await supabase.auth.getUser()
  const uid = u?.user?.id
  const { error } = await supabase.from('activity_logs').insert({
    actor_user_id: uid,
    action: action || 'unknown',
    entity_type: entityType || 'unknown',
    entity_id: entityId ? String(entityId) : null,
    metadata_json: metadata || {},
  })
  if (error) throw error
  return { ok: true }
}
