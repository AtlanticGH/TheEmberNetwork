import { useEffect, useMemo, useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import { listMembers, listMentors, updateMember } from '../../services/adminMembers'

export function AdminMembersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState('')
  const [busy, setBusy] = useState(false)
  const [mentors, setMentors] = useState([])

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: 'student',
    status: 'active',
    mentor_user_id: '',
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [data, ms] = await Promise.all([listMembers(), listMentors()])
      setItems(data)
      setMentors(ms)
    } catch (err) {
      setError(err?.message || 'Unable to load members.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((m) => {
      if (!q) return true
      return (
        String(m.full_name || '').toLowerCase().includes(q) ||
        String(m.email || '').toLowerCase().includes(q) ||
        String(m.role || '').toLowerCase().includes(q)
      )
    })
  }, [items, query])

  const selected = useMemo(() => items.find((x) => x.user_id === openId) || null, [items, openId])

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Members</p>
          <h2 className="mt-2 text-2xl font-semibold">Member directory</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Search, assign roles, suspend users, and set mentors.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30 md:w-64"
            placeholder="Search name, email, role…"
          />
          <button
            type="button"
            onClick={() => refresh()}
            className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : filtered.length ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-[1.2fr_0.6fr_0.7fr_1fr] bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:bg-zinc-950/40">
            <div>Member</div>
            <div>Role</div>
            <div>Status</div>
            <div>Joined</div>
          </div>
          {filtered.map((m) => (
            <div key={m.user_id} className="grid grid-cols-[1.2fr_0.6fr_0.7fr_1fr] border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
              <div>
                <p className="text-sm font-semibold">{m.full_name || '—'}</p>
                <p className="mt-1 text-xs text-zinc-500">{m.email || '—'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(m.user_id)
                      setForm({
                        full_name: m.full_name || '',
                        email: m.email || '',
                        role: m.role || 'student',
                        status: m.status || 'active',
                        mentor_user_id: m.mentor_user_id || '',
                      })
                    }}
                    className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setError('')
                      setBusy(true)
                      try {
                        await updateMember(m.user_id, { status: m.status === 'suspended' ? 'active' : 'suspended' })
                        await refresh()
                      } catch (err) {
                        setError(err?.message || 'Unable to update member.')
                      } finally {
                        setBusy(false)
                      }
                    }}
                    disabled={busy}
                    className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    {m.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{m.role}</div>
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{m.status || 'active'}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">{m.joined_at ? new Date(m.joined_at).toLocaleString() : '—'}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          No members found.
        </div>
      )}

      <Dialog
        open={!!selected}
        onClose={() => setOpenId('')}
        title={selected ? `Edit member: ${selected.full_name || selected.email || selected.user_id}` : 'Edit member'}
        footer={
          selected ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">User ID: {selected.user_id}</div>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setError('')
                  setBusy(true)
                  try {
                    await updateMember(selected.user_id, {
                      full_name: form.full_name,
                      role: form.role,
                      status: form.status,
                      mentor_user_id: form.mentor_user_id || null,
                    })
                    await refresh()
                    setOpenId('')
                  } catch (err) {
                    setError(err?.message || 'Unable to save member.')
                  } finally {
                    setBusy(false)
                  }
                }}
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4 text-left">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Full name</span>
                <input
                  value={form.full_name}
                  onChange={(e) => setForm((v) => ({ ...v, full_name: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Email (read-only)</span>
                <input
                  value={form.email}
                  readOnly
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 outline-none dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Role</span>
                <select
                  value={form.role}
                  onChange={(e) => setForm((v) => ({ ...v, role: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                >
                  <option value="student">student</option>
                  <option value="mentor">mentor</option>
                  <option value="staff">staff</option>
                  <option value="admin">admin</option>
                  <option value="super_admin">super_admin</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Status</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm((v) => ({ ...v, status: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                >
                  <option value="active">active</option>
                  <option value="suspended">suspended</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Mentor</span>
                <select
                  value={form.mentor_user_id || ''}
                  onChange={(e) => setForm((v) => ({ ...v, mentor_user_id: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                >
                  <option value="">—</option>
                  {mentors.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.full_name || m.email || m.user_id}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

