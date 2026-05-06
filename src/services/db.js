import { requireSupabase } from './supabaseClient'

export async function getMyProfile() {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

export async function updateMyProfile(patch) {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function listCourses() {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getCourse(courseId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single()

  if (error) throw error
  return data
}

export async function listModules(courseId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('position', { ascending: true })

  if (error) throw error
  return data || []
}

export async function listLessons(moduleId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('module_id', moduleId)
    .order('position', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getLesson(lessonId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('lessons')
    .select('*, modules!inner(course_id)')
    .eq('id', lessonId)
    .single()
  if (error) throw error
  return data
}

export async function listLessonFiles(lessonId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('lesson_files')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function listMyLessonCompletionsForCourse(courseId) {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return []

  // Find lessons for course by joining modules → lessons.
  const { data: lessons, error: lessonsErr } = await supabase
    .from('lessons')
    .select('id, modules!inner(course_id)')
    .eq('modules.course_id', courseId)

  if (lessonsErr) throw lessonsErr
  const lessonIds = (lessons || []).map((l) => l.id)
  if (!lessonIds.length) return []

  const { data, error } = await supabase
    .from('lesson_completions')
    .select('*')
    .eq('user_id', user.id)
    .in('lesson_id', lessonIds)

  if (error) throw error
  return data || []
}

export async function completeLesson(lessonId) {
  void lessonId
  throw new Error('Members cannot mark lessons complete. Completion is controlled by admins.')
}

export async function uncompleteLesson(lessonId) {
  void lessonId
  throw new Error('Members cannot mark lessons incomplete. Completion is controlled by admins.')
}

export async function listMyEnrollments() {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return []

  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .eq('user_id', user.id)
    .order('enrolled_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function enrollInCourse(courseId) {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('enrollments')
    .insert({ user_id: user.id, course_id: courseId })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function listMyCourseProgress() {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return []

  const { data, error } = await supabase
    .from('course_progress')
    .select('*')
    .eq('user_id', user.id)

  if (error) throw error
  return data || []
}

export async function listMyModuleCompletionsForCourse(courseId) {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return []

  const { data: modules, error: modulesErr } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId)

  if (modulesErr) throw modulesErr
  const moduleIds = (modules || []).map((m) => m.id)
  if (!moduleIds.length) return []

  const { data, error } = await supabase
    .from('module_completions')
    .select('*')
    .eq('user_id', user.id)
    .in('module_id', moduleIds)

  if (error) throw error
  return data || []
}

export async function completeModule(moduleId) {
  void moduleId
  throw new Error('Members cannot mark modules complete. Completion is controlled by admins.')
}

export async function uncompleteModule(moduleId) {
  void moduleId
  throw new Error('Members cannot mark modules incomplete. Completion is controlled by admins.')
}

export async function listMyMilestones() {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return []

  const { data, error } = await supabase
    .from('mentorship_milestones')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function listMyNotifications({ limit = 10 } = {}) {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function markNotificationRead(notificationId) {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function listMyUpcomingSessions({ limit = 5 } = {}) {
  const supabase = requireSupabase()
  const { data: { user }, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) return []

  // Member sessions are those where they are an attendee.
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('session_attendees')
    .select('status, sessions(*)')
    .eq('user_id', user.id)
    .gte('sessions.starts_at', now)
    .order('sessions.starts_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data || []).map((row) => ({ status: row.status, session: row.sessions }))
}

