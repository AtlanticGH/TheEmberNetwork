import { supabase } from '@/lib/supabaseClient'
import { uploadStorageFile } from './fileUploads'
import { getPublicAssetUrl } from './mediaAssets'

export async function listResources({ limit = 200 } = {}) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(500, limit)))
  if (error) throw error
  return (data || []).map((r) => ({
    ...r,
    download_url: r.file_url || (r.path ? getPublicAssetUrl({ bucket: r.bucket || 'public', path: r.path }) : ''),
  }))
}

export async function createResource({ title, description, category, file, file_url } = {}) {
  if (!title?.trim()) throw new Error('Title is required')

  let upload = null
  if (file) {
    upload = await uploadStorageFile({ file, bucket: 'public', folder: 'resources' })
  }

  const { data, error } = await supabase
    .from('resources')
    .insert({
      title: title.trim(),
      description: (description || '').trim() || null,
      category: (category || '').trim() || null,
      bucket: upload?.bucket || 'public',
      path: upload?.path || null,
      file_url: file_url ? String(file_url).trim() : null,
      mime_type: upload?.mime_type || null,
      size_bytes: upload?.size_bytes || null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteResource(resource) {
  if (resource?.path) {
    await supabase.storage.from(resource.bucket || 'public').remove([resource.path]).catch(() => {})
  }
  const { error } = await supabase.from('resources').delete().eq('id', resource.id)
  if (error) throw error
}

