import { useEffect, useState } from 'react'
import { createAnnouncement, listAnnouncements, publishAnnouncement } from '../../services/adminAnnouncements'

export function AdminAnnouncementsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [busyId, setBusyId] = useState('')
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAnnouncements()
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load announcements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }))

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Announcements</p>
          <h2 className="mt-2 text-2xl font-semibold">Broadcast updates</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Publishing an announcement automatically creates per-member notifications.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          className="h-fit rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Create announcement</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              if (!form.title.trim() || !form.body.trim()) {
                setError('Title and body are required.')
                return
              }
              setBusyId('create')
              try {
                await createAnnouncement({
                  title: form.title.trim(),
                  body: form.body.trim(),
                  audience: form.audience,
                })
                setForm({ title: '', body: '', audience: 'all' })
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create announcement.')
              } finally {
                setBusyId('')
              }
            }}
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title *</span>
              <input
                value={form.title}
                onChange={update('title')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Audience</span>
              <select
                value={form.audience}
                onChange={update('audience')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              >
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="mentors">Mentors</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Body *</span>
              <textarea
                value={form.body}
                onChange={update('body')}
                className="mt-2 min-h-32 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <button
              type="submit"
              disabled={busyId === 'create'}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
            >
              {busyId === 'create' ? 'Creating…' : 'Create'}
            </button>
          </form>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">History</p>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
          ) : items.length ? (
            <div className="mt-4 space-y-3">
              {items.map((a) => (
                <div key={a.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold">{a.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">
                        {a.audience} • {a.published_at ? 'Published' : 'Draft'} • {new Date(a.created_at).toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3">{a.body}</p>
                    </div>
                    {!a.published_at ? (
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={async () => {
                          setError('')
                          setBusyId(a.id)
                          try {
                            await publishAnnouncement(a.id)
                            await refresh()
                          } catch (err) {
                            setError(err?.message || 'Unable to publish announcement.')
                          } finally {
                            setBusyId('')
                          }
                        }}
                        className="h-fit rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                      >
                        {busyId === a.id ? 'Publishing…' : 'Publish'}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              No announcements yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

