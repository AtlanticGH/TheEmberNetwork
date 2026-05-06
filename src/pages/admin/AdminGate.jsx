import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { isStaffRole } from '../../lib/rbac'
import { AdminLayout } from '../../router/lazyPages'
import { AdminLoginPage } from './AdminLogin'

export function AdminGate() {
  const { loading, isAuthed, profile, refreshProfile } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthed) return
    if (profile) return
    queueMicrotask(() => {
      refreshProfile().catch(() => {})
    })
  }, [isAuthed, profile, refreshProfile])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-8 pb-16 pt-28 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
        </div>
      </div>
    )
  }

  // If a logged-in non-staff user tries /admin, send them back to their dashboard.
  if (isAuthed && profile && !isStaffRole(profile?.role)) {
    return <Navigate to="/member" replace />
  }

  // If unauthenticated, show the admin-only login page at /admin (no public links anywhere).
  if (!isAuthed) {
    return <AdminLoginPage />
  }

  // If the user is authenticated but profile hasn't resolved yet, show a small loader.
  if (!profile) {
    return (
      <div className="mx-auto max-w-7xl px-8 pb-16 pt-28 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading profile…</p>
        </div>
      </div>
    )
  }

  // If staff, render the admin shell + nested routes.
  if (isStaffRole(profile?.role)) return <AdminLayout />

  // Fallback: keep behavior predictable.
  const next = encodeURIComponent(location.pathname + location.search + location.hash)
  return <Navigate to={`/login?next=${next}`} replace />
}

