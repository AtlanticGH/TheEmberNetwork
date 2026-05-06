import { supabase } from '@/lib/supabaseClient'
import { uploadMyAvatar } from '@/lib/avatars'

export async function updateProfile({
  username,
  avatarFile,
}: {
  username?: string
  avatarFile?: File | null
}) {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) throw new Error('Not authenticated')

  let avatar_path: string | undefined
  if (avatarFile) {
    avatar_path = await uploadMyAvatar(avatarFile)
  }

  const patch: Record<string, any> = {}
  if (typeof username === 'string') patch.username = username.trim() || null
  if (avatar_path) patch.avatar_path = avatar_path

  const { error } = await supabase.from('profiles').update(patch).eq('user_id', user.id)
  if (error) throw error
}

