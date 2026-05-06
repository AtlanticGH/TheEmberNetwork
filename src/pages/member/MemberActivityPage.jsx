import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { listMyMilestones, listMyNotifications } from '../../services/db'

export function MemberActivityPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notifications, setNotifications] = useState([])
  const [milestones, setMilestones] = useState([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [n, m] = await Promise.all([listMyNotifications({ limit: 50 }), listMyMilestones()])
      setNotifications(n || [])
      setMilestones(m || [])
    } catch (err) {
      setError(err?.message || 'Unable to load activity.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [refresh])

  const items = useMemo(() => {
    const rows = []
    notifications.forEach((n) => {
      rows.push({
        id: `n-${n.id}`,
        title: n.title,
        body: n.body,
        ts: n.created_at,
        tone: 'notify',
      })
    })
    milestones.forEach((m) => {
      rows.push({
        id: `m-${m.id}`,
        title: `Milestone: ${m.title}`,
        body: `Status: ${m.status}`,
        ts: m.created_at,
        tone: 'milestone',
      })
    })
    return rows
      .filter((x) => x.ts)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 40)
  }, [notifications, milestones])

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="relative p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Activity</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your history</h1>
            <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
              Notifications, milestones, and progress signals in one place for {user?.email || 'your account'}.
            </p>
            <div className="mt-5">
              <Link
                to="/member"
                className="inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
              >
                Back to overview
              </Link>
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : (
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          {items.length ? (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {items.map((it) => (
                <li key={it.id} className="py-4">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{it.title}</p>
                  {it.body ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{it.body}</p> : null}
                  <p className="mt-2 text-xs text-zinc-500">{new Date(it.ts).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">No activity yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
