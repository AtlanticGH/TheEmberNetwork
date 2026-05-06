import { supabase } from '@/lib/supabaseClient'

export async function listAdminCourses() {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createCourse(payload) {
  const { data, error } = await supabase
    .from('courses')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCourse(id, patch) {
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
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
  if (error) throw error
}

