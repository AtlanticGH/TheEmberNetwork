import { requireSupabase } from './supabaseClient'

export async function listAdminCourses() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createCourse(payload) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('courses')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCourse(id, patch) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('courses')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteCourse(id) {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  if (error) throw error
}

