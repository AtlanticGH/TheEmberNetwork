import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type ProtectedRouteProps = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthed, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthed) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash)
    return <Navigate to={`/auth?next=${next}`} replace />
  }

  return children
}

