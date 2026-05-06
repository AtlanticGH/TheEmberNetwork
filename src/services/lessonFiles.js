import { requireSupabase } from './supabaseClient'
import { uploadStorageFile } from './fileUploads'
import { getDownloadUrl } from './mediaAssets'

export async function listLessonFiles(lessonId) {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from('lesson_files')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  const rows = data || []
  return await Promise.all(
    rows.map(async (f) => ({
      ...f,
      download_url: f.file_url || (f.path ? await getDownloadUrl({ bucket: f.bucket || 'public', path: f.path }) : ''),
    }))
  )
}

export async function uploadLessonFile({ lessonId, title, file } = {}) {
  if (!lessonId) throw new Error('Missing lessonId')
  const supabase = requireSupabase()
  const upload = await uploadStorageFile({ file, bucket: 'public', folder: `lesson-files/${lessonId}` })

  const { data, error } = await supabase
    .from('lesson_files')
    .insert({
      lesson_id: lessonId,
      title: title?.trim() || file?.name || null,
      bucket: upload.bucket,
      path: upload.path,
      mime_type: upload.mime_type,
      size_bytes: upload.size_bytes,
      file_type: upload.file_type,
      position: 1,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteLessonFile(row) {
  const supabase = requireSupabase()
  if (row?.path) {
    await supabase.storage.from(row.bucket || 'public').remove([row.path]).catch(() => {})
  }
  const { error } = await supabase.from('lesson_files').delete().eq('id', row.id)
  if (error) throw error
}

