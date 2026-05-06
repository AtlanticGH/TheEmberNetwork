import { useEffect, useMemo, useState } from 'react'
import { createSession, listSessions } from '../../services/adminSessions'

export function AdminSessionsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    starts_at: '',
    ends_at: '',
    meeting_url: '',
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listSessions()
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load sessions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const canCreate = useMemo(() => !!form.title.trim() && !!form.starts_at, [form.title, form.starts_at])
  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }))

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Sessions</p>
          <h2 className="mt-2 text-2xl font-semibold">Mentorship sessions</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Create upcoming sessions; attendees can be added next.</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Create session</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              if (!canCreate) return
              setBusy(true)
              try {
                await createSession({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  starts_at: new Date(form.starts_at).toISOString(),
                  ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
                  meeting_url: form.meeting_url.trim() || null,
                })
                setForm({ title: '', description: '', starts_at: '', ends_at: '', meeting_url: '' })
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create session.')
              } finally {
                setBusy(false)
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
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Starts at *</span>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={update('starts_at')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Ends at</span>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={update('ends_at')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Meeting URL</span>
              <input
                value={form.meeting_url}
                onChange={update('meeting_url')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={form.description}
                onChange={update('description')}
                className="mt-2 min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </label>
            <button
              type="submit"
              disabled={!canCreate || busy}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create'}
            </button>
          </form>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Upcoming</p>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
          ) : items.length ? (
            <div className="mt-4 space-y-3">
              {items.map((s) => (
                <div key={s.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{new Date(s.starts_at).toLocaleString()}</p>
                  {s.meeting_url ? (
                    <a className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300" href={s.meeting_url}>
                      Open meeting
                    </a>
                  ) : null}
                  {s.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{s.description}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              No sessions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

