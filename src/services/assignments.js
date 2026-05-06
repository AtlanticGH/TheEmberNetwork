import { requireSupabase } from './supabaseClient'
import { uploadStorageFile } from './fileUploads'
import { getDownloadUrl } from './mediaAssets'

export async function listAssignments(lessonId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = data || []
  return await Promise.all(
    rows.map(async (a) => ({
      ...a,
      download_url: a.file_url || (a.path ? await getDownloadUrl({ bucket: a.bucket || 'public', path: a.path }) : ''),
    }))
  )
}

export async function createAssignment({ lessonId, title, description, file } = {}) {
  if (!lessonId) throw new Error('Missing lessonId')
  if (!title?.trim()) throw new Error('Title is required')
  const supabase = requireSupabase()

  let upload = null
  if (file) {
    upload = await uploadStorageFile({ file, bucket: 'public', folder: `assignments/${lessonId}` })
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      lesson_id: lessonId,
      title: title.trim(),
      description: description?.trim() || null,
      bucket: upload?.bucket || 'public',
      path: upload?.path || null,
      file_url: null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteAssignment(row) {
  const supabase = requireSupabase()
  if (row?.path) {
    await supabase.storage.from(row.bucket || 'public').remove([row.path]).catch(() => {})
  }
  const { error } = await supabase.from('assignments').delete().eq('id', row.id)
  if (error) throw error
}

