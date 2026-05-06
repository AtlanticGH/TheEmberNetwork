import { useEffect, useState } from 'react'
import { listActivityLogs } from '../../services/activityLogs'
import { listAdminSummary } from '../../services/admin'

function MiniBars({ values }) {
  const max = Math.max(1, ...values.map((v) => Number(v) || 0))
  return (
    <div className="flex h-24 items-end gap-1">
      {values.map((v, idx) => {
        const h = Math.max(8, Math.round(((Number(v) || 0) / max) * 100))
        return (
          <div key={idx} className="w-2 rounded-full bg-gradient-to-t from-orange-500 to-amber-300" style={{ height: `${h}%` }} title={`${v}`} />
        )
      })}
    </div>
  )
}

export function AdminOverviewPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [logs, setLogs] = useState([])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const [s, l] = await Promise.all([listAdminSummary(), listActivityLogs({ limit: 8 }).catch(() => [])])
        if (!alive) return
        setSummary(s)
        setLogs(l || [])
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load admin overview.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

  if (loading) return <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
  if (error) return <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>

  const trend = [2, 3, 4, 3, 6, 8, 7, 9, 10, 8, 12, 11]

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Overview</p>
      <h2 className="mt-2 text-2xl font-semibold">At a glance</h2>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Submitted applications</p>
          <p className="mt-2 text-3xl font-semibold">{summary?.applications_submitted ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Members</p>
          <p className="mt-2 text-3xl font-semibold">{summary?.members ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Published courses</p>
          <p className="mt-2 text-3xl font-semibold">{summary?.courses ?? 0}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Engagement trend</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Illustrative series — wire to `/api/admin/analytics` or a SQL view when ready.</p>
          <div className="mt-4">
            <MiniBars values={trend} />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Recent audit</p>
          <ul className="mt-4 space-y-3 text-sm">
            {logs.length ? (
              logs.map((r) => (
                <li key={r.id} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{r.action}</span>
                  <span className="text-zinc-500"> · {r.entity_type}</span>
                  <p className="text-xs text-zinc-500">{new Date(r.created_at).toLocaleString()}</p>
                </li>
              ))
            ) : (
              <li className="text-zinc-500">No audit entries yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

