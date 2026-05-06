import { requireSupabase } from './supabaseClient'

function sanitizeFilename(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 120) || 'file'
}

function inferFileType(mime, name) {
  const m = String(mime || '').toLowerCase()
  if (m.includes('pdf')) return 'pdf'
  if (m.includes('word') || m.includes('msword')) return 'doc'
  if (m.startsWith('image/')) return 'image'
  const ext = String(name || '').toLowerCase().split('.').pop()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'doc' || ext === 'docx') return 'doc'
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return 'image'
  return 'file'
}

export function validateUploadFile(file, { maxBytes = 25 * 1024 * 1024 } = {}) {
  if (!file) throw new Error('Missing file')
  const size = typeof file.size === 'number' ? file.size : 0
  if (size <= 0) throw new Error('Empty file')
  if (size > maxBytes) throw new Error(`File too large (max ${(maxBytes / (1024 * 1024)).toFixed(0)}MB)`)

  const mime = String(file.type || '').toLowerCase()
  const name = String(file.name || '')
  const ext = name.toLowerCase().split('.').pop()
  const allowedExt = new Set(['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'webp', 'gif'])
  const allowedMime = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
  ]

  if (mime && !allowedMime.includes(mime) && !mime.startsWith('image/')) {
    throw new Error('Unsupported file type')
  }
  if (ext && !allowedExt.has(ext)) {
    throw new Error('Unsupported file extension')
  }
}

export async function uploadStorageFile({ file, bucket = 'public', folder = 'uploads' } = {}) {
  validateUploadFile(file)
  const supabase = requireSupabase()

  const ext = sanitizeFilename(file.name).split('.').pop()
  const base = sanitizeFilename(file.name).replace(/\.[^.]+$/, '')
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const path = `${folder}/${stamp}-${base}${ext ? `.${ext}` : ''}`

  const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  })
  if (upErr) throw upErr

  return {
    bucket,
    path,
    mime_type: file.type || null,
    size_bytes: typeof file.size === 'number' ? file.size : null,
    file_type: inferFileType(file.type, file.name),
  }
}

