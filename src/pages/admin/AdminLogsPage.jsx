import { useEffect, useState } from 'react'
import { listActivityLogs } from '../../services/activityLogs'

export function AdminLogsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rows, setRows] = useState([])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listActivityLogs({ limit: 200 })
        if (!alive) return
        setRows(data)
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load activity logs.')
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

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Audit</p>
      <h2 className="mt-2 text-2xl font-semibold">Activity logs</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Immutable-style trail of admin actions (extend server triggers for full coverage).</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-[0.14em] text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="bg-white dark:bg-zinc-900/40">
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{r.action}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                    {r.entity_type} {r.entity_id ? `· ${r.entity_id}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{r.actor_user_id ? String(r.actor_user_id).slice(0, 8) : '—'}…</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  No log entries yet. Approve or update an application after running `platform_cms_v2.sql`.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
