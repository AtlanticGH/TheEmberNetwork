import { supabase } from '@/lib/supabaseClient'

const DEFAULT_BUCKET = 'public'

function sanitizeFilename(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 120) || 'file'
}

export function getPublicAssetUrl({ bucket = DEFAULT_BUCKET, path }) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data?.publicUrl || ''
}

export async function getDownloadUrl({ bucket = DEFAULT_BUCKET, path, expiresIn = 120 } = {}) {
  if (!path) return ''
  if (bucket === 'public') return getPublicAssetUrl({ bucket, path })
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data?.signedUrl || ''
}

export async function listMediaAssets({ limit = 100, query = '' } = {}) {
  let q = supabase
    .from('media_assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(500, limit)))

  const needle = query.trim()
  if (needle) {
    // basic search across title/path (case-insensitive)
    q = q.or(`title.ilike.%${needle}%,path.ilike.%${needle}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function uploadMediaFile({ file, folder = 'uploads', title = '', alt = '', tags = [] } = {}) {
  if (!file) throw new Error('Missing file')

  const ext = sanitizeFilename(file.name).split('.').pop()
  const base = sanitizeFilename(file.name).replace(/\.[^.]+$/, '')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const path = `${folder}/${stamp}-${base}${ext ? `.${ext}` : ''}`

  const { error: upErr } = await supabase.storage.from(DEFAULT_BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  })
  if (upErr) throw upErr

  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      bucket: DEFAULT_BUCKET,
      path,
      mime_type: file.type || null,
      size_bytes: typeof file.size === 'number' ? file.size : null,
      title: title || file.name,
      alt: alt || null,
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
    })
    .select('*')
    .single()
  if (error) throw error

  return data
}

export async function updateMediaAsset(id, patch) {
  const { data, error } = await supabase
    .from('media_assets')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function deleteMediaAsset(asset) {
  const bucket = asset.bucket || DEFAULT_BUCKET
  const path = asset.path
  if (!path) throw new Error('Missing asset path')

  // Delete storage object first (RLS protected), then remove row.
  const { error: rmErr } = await supabase.storage.from(bucket).remove([path])
  if (rmErr) throw rmErr

  const { error } = await supabase.from('media_assets').delete().eq('id', asset.id)
  if (error) throw error
}

