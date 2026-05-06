import { supabase } from '@/lib/supabaseClient'

export async function uploadMyAvatar(file: File) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) throw new Error('Not authenticated')

  const safeName = String(file.name || 'avatar').replace(/[^\w.\-]+/g, '-').slice(0, 120)
  const path = `${user.id}/${Date.now()}-${safeName}`

  const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  })
  if (upErr) throw upErr

  return path
}

export async function getAvatarSignedUrl(path: string, expiresInSeconds = 60 * 60) {
  if (!path) return null
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, expiresInSeconds)
  if (error) throw error
  return data?.signedUrl || null
}

