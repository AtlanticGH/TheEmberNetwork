import { supabase } from './supabase'

export async function getProfile() {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()

  if (userErr) {
    console.error('Profile fetch error:', userErr.message)
    return null
  }

  if (!user) return null

  // This project uses `profiles.user_id` as the primary key (see `supabase/schema.sql`).
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()

  if (error) {
    console.error('Profile fetch error:', error.message)
    return null
  }

  return data
}

