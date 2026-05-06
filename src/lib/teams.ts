import { supabase } from '@/lib/supabaseClient'

export type Team = {
  id: string
  name: string
  owner_user_id: string
  created_at: string
}

export async function listMyTeams(): Promise<Team[]> {
  const { data, error } = await supabase.from('teams').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []) as Team[]
}

export async function createTeam(name: string): Promise<Team> {
  const trimmed = String(name || '').trim()
  if (!trimmed) throw new Error('Team name is required.')

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr) throw userErr
  if (!user) throw new Error('Not authenticated')

  // Membership is auto-created via DB trigger (see supabase/teams.sql).
  const { data, error } = await supabase
    .from('teams')
    .insert({ name: trimmed, owner_user_id: user.id })
    .select('*')
    .single()

  if (error) throw error
  return data as Team
}

export async function listTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('team_id, user_id, role, created_at, profiles:profiles(full_name,email,username,avatar_path)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function addTeamMember({
  teamId,
  userId,
  role = 'member',
}: {
  teamId: string
  userId: string
  role?: 'member' | 'admin'
}) {
  const { error } = await supabase.from('team_members').insert({ team_id: teamId, user_id: userId, role })
  if (error) throw error
}

