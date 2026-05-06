import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) return null

      // This project uses `profiles.user_id` as the PK (see supabase/schema.sql)
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
      if (error) throw error
      return data
    },
  })
}

