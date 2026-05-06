import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isSuperAdmin } from '../../lib/rbac'

export function SuperAdminRoute({ children }) {
  const { loading, profile } = useAuth()

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
        Loading…
      </div>
    )
  }

  if (!isSuperAdmin(profile?.role)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}
