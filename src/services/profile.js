import { supabase } from '@/lib/supabaseClient'

/**
 * Ensures a `profiles` row exists for the authenticated user.
 *
 * NOTE: In production, this should be handled by the database trigger
 * (`public.handle_new_user()` in `supabase/schema.sql`). This helper is a
 * safe backstop for environments where the trigger wasn't applied yet.
 */
export async function ensureProfile(user) {
  if (!user?.id) throw new Error('Missing user')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Supabase Error:', error.message)
    throw error
  }

  if (data) return data

  const { data: inserted, error: insErr } = await supabase
    .from('profiles')
    .insert({
      user_id: user.id,
      email: user.email || null,
      full_name: user.user_metadata?.full_name || '',
    })
    .select('*')
    .single()

  if (insErr) {
    console.error('Supabase Error:', insErr.message)
    throw insErr
  }

  return inserted
}

