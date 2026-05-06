import { supabase } from '@/lib/supabaseClient'

export async function listMembers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, role, status, mentor_user_id, joined_at')
    .order('joined_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function listMentors() {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, role')
    .eq('role', 'mentor')
    .order('full_name', { ascending: true })
  if (error) throw error
  return data || []
}

export async function updateMember(userId, patch) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('user_id', userId)
    .select('user_id, full_name, email, role, status, mentor_user_id, joined_at')
    .single()
  if (error) throw error
  return data
}

