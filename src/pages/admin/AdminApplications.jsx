import { useEffect, useMemo, useState } from 'react'
import { approveApplication, rejectApplication, updateApplication, updateApplicationStatus, listApplications } from '../../services/admin'
import { Dialog } from '../../components/ui/Dialog'

const STATUSES = ['submitted', 'waitlist', 'approved', 'rejected']

export function AdminApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('submitted')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState('')
  const [openId, setOpenId] = useState('')
  const [notesDraft, setNotesDraft] = useState('')
  const [decisionOpen, setDecisionOpen] = useState(false)
  const [decisionKind, setDecisionKind] = useState('') // 'approve' | 'reject'
  const [decisionId, setDecisionId] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listApplications()
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      refresh()
    })
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((a) => {
      if (filter && a.status !== filter) return false
      if (!q) return true
      return (
        String(a.full_name || '').toLowerCase().includes(q) ||
        String(a.email || '').toLowerCase().includes(q) ||
        String(a.phone || '').toLowerCase().includes(q)
      )
    })
  }, [items, filter, query])

  const selected = useMemo(() => items.find((x) => x.id === openId) || null, [items, openId])
  const decisionItem = useMemo(() => items.find((x) => x.id === decisionId) || null, [items, decisionId])

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Applications</p>
          <h2 className="mt-2 text-2xl font-semibold">Review applicants</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Approve, reject, or waitlist. Approving creates an account and emails login credentials automatically.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30 md:w-64"
            placeholder="Search name, email, phone…"
          />
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                filter === s
                  ? 'bg-orange-500 text-white'
                  : 'border border-zinc-300 text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
          <button
            type="button"
            onClick={() => refresh()}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">Loading…</div>
      ) : error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : filtered.length ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div className="grid grid-cols-[1.2fr_1fr_0.8fr_1fr] gap-0 bg-zinc-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:bg-zinc-950/40">
            <div>Applicant</div>
            <div>Interest</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>
          {filtered.map((a) => (
            <div key={a.id} className="grid grid-cols-[1.2fr_1fr_0.8fr_1fr] gap-0 border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
              <div>
                <p className="text-sm font-semibold">{a.full_name}</p>
                <p className="mt-1 text-xs text-zinc-500">{a.email}{a.phone ? ` • ${a.phone}` : ''}</p>
                {a.message ? <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{a.message}</p> : null}
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">{a.interest_role || '—'}</div>
              <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{a.status}</div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(a.id)
                    setNotesDraft(a.notes || '')
                  }}
                  className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Details
                </button>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={async () => {
                    setDecisionKind('approve')
                    setDecisionId(a.id)
                    setDecisionOpen(true)
                  }}
                  className="rounded-full bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={async () => {
                    setBusyId(a.id)
                    try {
                      await updateApplicationStatus(a.id, 'waitlist')
                      await refresh()
                    } catch (err) {
                      setError(err?.message || 'Unable to update application.')
                    } finally {
                      setBusyId('')
                    }
                  }}
                  className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Waitlist
                </button>
                <button
                  type="button"
                  disabled={busyId === a.id}
                  onClick={async () => {
                    setDecisionKind('reject')
                    setDecisionId(a.id)
                    setRejectionReason(a.rejection_reason || '')
                    setDecisionOpen(true)
                  }}
                  className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          No applications in this status.
        </div>
      )}

      <Dialog
        open={!!selected}
        onClose={() => setOpenId('')}
        title={selected ? `Application: ${selected.full_name}` : 'Application'}
        footer={
          selected ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">
                Status: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{selected.status}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busyId === selected.id}
                  onClick={async () => {
                    setBusyId(selected.id)
                    setError('')
                    try {
                      await updateApplication(selected.id, { notes: notesDraft })
                      await refresh()
                    } catch (err) {
                      setError(err?.message || 'Unable to save notes.')
                    } finally {
                      setBusyId('')
                    }
                  }}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
                >
                  {busyId === selected.id ? 'Saving…' : 'Save notes'}
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-5 text-left">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Contact</p>
                <p className="mt-2 text-sm font-semibold">{selected.email}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{selected.phone || '—'}</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Interest</p>
                <p className="mt-2 text-sm font-semibold">{selected.interest_role || '—'}</p>
                <p className="mt-1 text-xs text-zinc-500">Submitted: {selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</p>
              </div>
            </div>

            {selected.message ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Message</p>
                <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">{selected.message}</p>
              </div>
            ) : null}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Internal notes</p>
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                className="mt-2 min-h-28 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Add internal review notes…"
              />
            </div>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={decisionOpen}
        onClose={() => {
          if (busyId) return
          setDecisionOpen(false)
          setDecisionKind('')
          setDecisionId('')
        }}
        title={decisionKind === 'reject' ? 'Reject application' : 'Approve application'}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              disabled={!!busyId}
              onClick={() => {
                setDecisionOpen(false)
                setDecisionKind('')
                setDecisionId('')
              }}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!!busyId || !decisionId}
              onClick={async () => {
                if (!decisionId) return
                setBusyId(decisionId)
                setError('')
                try {
                  if (decisionKind === 'reject') {
                    await rejectApplication(decisionId, { rejectionReason })
                  } else {
                    await approveApplication(decisionId)
                  }
                  setDecisionOpen(false)
                  setDecisionKind('')
                  setDecisionId('')
                  await refresh()
                } catch (err) {
                  setError(err?.message || 'Unable to update application.')
                } finally {
                  setBusyId('')
                }
              }}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60',
                decisionKind === 'reject' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500',
              ].join(' ')}
            >
              {busyId ? 'Working…' : decisionKind === 'reject' ? 'Reject & email' : 'Approve & email'}
            </button>
          </div>
        }
      >
        {decisionItem ? (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              Applicant: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{decisionItem.full_name}</span> • {decisionItem.email}
            </p>
            {decisionKind === 'approve' ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                This will create a new user account with a secure temporary password and email credentials to the applicant.
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                  This will mark the application as rejected and email the applicant.
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Rejection reason (optional)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    rows={4}
                    placeholder="Add a short reason to include in the email…"
                  />
                </div>
              </>
            )}
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

