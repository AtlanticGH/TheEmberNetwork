import { useEffect, useMemo, useState } from 'react'
import { createResource, deleteResource, listResources } from '../../services/resources'

export function AdminResourcesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState(null)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listResources({ limit: 200 })
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load resources.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const canCreate = useMemo(() => !!title.trim() && !!file && !busy, [title, file, busy])

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Resources</p>
          <h2 className="mt-2 text-2xl font-semibold">Free downloads</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Upload PDFs/templates for the public Resources page.</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Upload resource</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!canCreate) return
              setBusy(true)
              setError('')
              try {
                await createResource({ title, description, category, file })
                setTitle('')
                setDescription('')
                setCategory('')
                setFile(null)
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create resource.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title *</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Resource title"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Short summary"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Templates / Funding / Pitching"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">File *</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="mt-2 block w-full text-sm"
              />
              {file ? <p className="mt-2 text-xs text-zinc-500">Selected: {file.name}</p> : null}
            </label>
            <button
              type="submit"
              disabled={!canCreate}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
            >
              {busy ? 'Uploading…' : 'Upload'}
            </button>
          </form>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Existing resources</p>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
          ) : items.length ? (
            <div className="mt-4 space-y-3">
              {items.map((r) => (
                <div key={r.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/30">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{r.title}</p>
                      {r.category ? <p className="mt-1 text-xs text-zinc-500">{r.category}</p> : null}
                      {r.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{r.description}</p> : null}
                      {r.download_url ? (
                        <a
                          className="mt-3 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300"
                          href={r.download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm('Delete this resource?')) return
                        setBusy(true)
                        setError('')
                        try {
                          await deleteResource(r)
                          await refresh()
                        } catch (err) {
                          setError(err?.message || 'Unable to delete resource.')
                        } finally {
                          setBusy(false)
                        }
                      }}
                      className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              No resources yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

