import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { queryClient } from '@/lib/queryClient'

export function useRealtime() {
  useEffect(() => {
    const channel = supabase
      .channel('realtime-db')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['profile'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        queryClient.invalidateQueries({ queryKey: ['teams'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])
}

