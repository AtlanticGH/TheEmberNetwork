import { supabase } from '@/lib/supabaseClient'

export async function getAdminCourse(courseId) {
  const { data, error } = await supabase.from('courses').select('*').eq('id', courseId).single()
  if (error) throw error
  return data
}

export async function listCourseModules(courseId) {
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('position', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createModule({ course_id, title, description }) {
  const { data: existing, error: countErr } = await supabase
    .from('modules')
    .select('id', { count: 'exact', head: true })
    .eq('course_id', course_id)
  if (countErr) throw countErr
  const position = (existing?.length ? existing.length : 0) + 1
  const { data, error } = await supabase
    .from('modules')
    .insert({ course_id, title, description, position })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateModule(moduleId, patch) {
  const { data, error } = await supabase
    .from('modules')
    .update(patch)
    .eq('id', moduleId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteModule(moduleId) {
  const { error } = await supabase.from('modules').delete().eq('id', moduleId)
  if (error) throw error
}

export async function reorderModules(courseId, orderedModuleIds) {
  // Avoid unique(course_id, position) conflicts by moving to a temp range first.
  for (let i = 0; i < orderedModuleIds.length; i += 1) {
    const id = orderedModuleIds[i]
    const { error } = await supabase.from('modules').update({ position: 1000 + i + 1 }).eq('id', id).eq('course_id', courseId)
    if (error) throw error
  }
  for (let i = 0; i < orderedModuleIds.length; i += 1) {
    const id = orderedModuleIds[i]
    const { error } = await supabase.from('modules').update({ position: i + 1 }).eq('id', id).eq('course_id', courseId)
    if (error) throw error
  }
}

export async function listModuleLessons(moduleId) {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('position', { ascending: true })
  if (error) throw error
  return data || []
}

export async function createLesson({ module_id, title, description }) {
  const { data: existing, error: countErr } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .eq('module_id', module_id)
  if (countErr) throw countErr
  const position = (existing?.length ? existing.length : 0) + 1
  const { data, error } = await supabase
    .from('lessons')
    .insert({ module_id, title, description, position, status: 'draft' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateLesson(lessonId, patch) {
  const { data, error } = await supabase
    .from('lessons')
    .update(patch)
    .eq('id', lessonId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function publishLesson(lessonId) {
  return await updateLesson(lessonId, { status: 'published', published_at: new Date().toISOString() })
}

export async function unpublishLesson(lessonId) {
  return await updateLesson(lessonId, { status: 'draft', published_at: null })
}

export async function deleteLesson(lessonId) {
  const { error } = await supabase.from('lessons').delete().eq('id', lessonId)
  if (error) throw error
}

export async function reorderLessons(moduleId, orderedLessonIds) {
  for (let i = 0; i < orderedLessonIds.length; i += 1) {
    const id = orderedLessonIds[i]
    const { error } = await supabase.from('lessons').update({ position: 1000 + i + 1 }).eq('id', id).eq('module_id', moduleId)
    if (error) throw error
  }
  for (let i = 0; i < orderedLessonIds.length; i += 1) {
    const id = orderedLessonIds[i]
    const { error } = await supabase.from('lessons').update({ position: i + 1 }).eq('id', id).eq('module_id', moduleId)
    if (error) throw error
  }
}

