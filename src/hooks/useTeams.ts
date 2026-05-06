import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser()
      if (userErr) throw userErr
      if (!user) return []

      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, role, teams(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
  })
}

