import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getAvatarSignedUrl } from '@/lib/avatars'
import { Sidebar } from '../components/dashboard/Sidebar'
import { Header } from '../components/dashboard/Header'
import { ProfileCard } from '../components/dashboard/ProfileCard'
import { TeamList } from '../components/dashboard/TeamList'
import { useProfile } from '@/hooks/useProfile'
import { useTeams } from '@/hooks/useTeams'
import { useRealtime } from '@/hooks/useRealtime'

type ProfileRow = {
  user_id: string
  email: string | null
  full_name: string
  username: string | null
  avatar_path: string | null
  role: string | null
  status: string | null
}

type TeamMembershipRow = {
  team_id: string
  role: 'owner' | 'admin' | 'member'
  teams: { id: string; name: string; owner_user_id: string; created_at: string } | null
}

function Skeleton({ className = '' }) {
  return <div className={['animate-pulse rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/60', className].join(' ')} />
}

export function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const next = useMemo(() => params.get('next') || '/', [params])

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: profile, isLoading: loading, error: profileErr } = useProfile()
  const { data: teams = [], isLoading: teamsLoading, error: teamsErr } = useTeams()
  const [avatarUrl, setAvatarUrl] = useState<string>('')

  useRealtime()

  const displayName = profile?.username ? `@${profile.username}` : profile?.full_name || 'Dashboard'
  const displayEmail = profile?.email || '—'
  const roleLabel = profile?.role || 'user'

  useEffect(() => {
    let alive = true
    const avatarPath = String((profile as any)?.avatar_path || '')
    if (!avatarPath) {
      setAvatarUrl('')
      return
    }
    getAvatarSignedUrl(avatarPath)
      .then((url) => {
        if (alive) setAvatarUrl(String(url || ''))
      })
      .catch(() => {
        if (alive) setAvatarUrl('')
      })
    return () => {
      alive = false
    }
  }, [profile])

  // If user is logged out, React Query will return null profile; redirect to /auth.
  useEffect(() => {
    if (loading) return
    if (!profile) {
      navigate(`/auth?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
    }
  }, [loading, profile, navigate, location.pathname, location.search])

  const error = (profileErr as any)?.message || (teamsErr as any)?.message || ''
  const isLoading = loading || teamsLoading

  return (
    <main id="page-main" data-component="page-main" className="mx-auto max-w-7xl px-8 pb-20 pt-28 md:px-12 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="min-w-0 space-y-6">
          <Header
            onOpenSidebar={() => setSidebarOpen(true)}
            avatarUrl={avatarUrl}
            name={displayName}
            email={displayEmail}
            onLogout={async () => {
              try {
                await supabase.auth.signOut()
              } finally {
                navigate(`/auth?next=${encodeURIComponent(next)}`, { replace: true })
              }
            }}
          />

          {isLoading ? (
            <div className="grid gap-6">
              <Skeleton className="h-44" />
              <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-56" />
                <Skeleton className="h-56" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              <ProfileCard
                avatarUrl={avatarUrl}
                username={profile?.username || ''}
                fullName={profile?.full_name || ''}
                email={profile?.email || ''}
                role={roleLabel}
              />
              <TeamList memberships={((teams || []) as unknown) as TeamMembershipRow[]} />
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

