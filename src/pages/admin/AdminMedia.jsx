import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dialog } from '../../components/ui/Dialog'
import {
  deleteMediaAsset,
  getPublicAssetUrl,
  listMediaAssets,
  updateMediaAsset,
  uploadMediaFile,
} from '../../services/mediaAssets'

function parseTags(raw) {
  return String(raw || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export function AdminMediaPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState('')

  const [openId, setOpenId] = useState('')
  const selected = useMemo(() => items.find((x) => x.id === openId) || null, [items, openId])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMediaAssets({ limit: 200, query })
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load media assets.')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [refresh])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((a) => {
      return (
        String(a.title || '').toLowerCase().includes(q) ||
        String(a.path || '').toLowerCase().includes(q) ||
        String(a.mime_type || '').toLowerCase().includes(q)
      )
    })
  }, [items, query])

  const [edit, setEdit] = useState({ title: '', alt: '', tags: '' })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Media</p>
          <h2 className="mt-2 text-2xl font-semibold">Media manager</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Upload images/PDFs/videos, edit metadata, and copy public URLs for use across the site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30 md:w-64"
            placeholder="Search title/path/type…"
          />
          <button
            type="button"
            onClick={() => refresh()}
            className="h-10 rounded-full border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}

      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Upload</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="file"
            className="w-full text-sm text-zinc-600 file:mr-4 file:rounded-full file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-orange-400 dark:text-zinc-300"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setError('')
              setNotice('')
              setBusy('upload')
              try {
                await uploadMediaFile({ file })
                setNotice('Uploaded.')
                await refresh()
              } catch (err) {
                setError(err?.message || 'Upload failed.')
              } finally {
                setBusy('')
                e.target.value = ''
              }
            }}
            disabled={busy === 'upload'}
          />
          <p className="text-xs text-zinc-500">
            Bucket: <span className="font-semibold">public</span>
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const url = getPublicAssetUrl({ bucket: a.bucket, path: a.path })
            const isImage = String(a.mime_type || '').startsWith('image/')
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setOpenId(a.id)
                  setEdit({
                    title: a.title || '',
                    alt: a.alt || '',
                    tags: (a.tags || []).join(', '),
                  })
                }}
                className="text-left rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-orange-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/40">
                  {isImage ? (
                    <img src={url} alt={a.alt || a.title || 'Media'} className="h-36 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-36 place-content-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                      {a.mime_type || 'file'}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-sm font-semibold line-clamp-1">{a.title || a.path}</p>
                <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{a.path}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {a.size_bytes ? `${Math.round(a.size_bytes / 1024)} KB` : '—'} • {a.created_at ? new Date(a.created_at).toLocaleString() : '—'}
                </p>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
          No assets yet.
        </div>
      )}

      <Dialog
        open={!!selected}
        onClose={() => setOpenId('')}
        title={selected?.title || selected?.path || 'Asset'}
        footer={
          selected ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={busy === 'delete'}
                onClick={async () => {
                  if (!confirm('Delete this asset? This removes it from storage and the database.')) return
                  setBusy('delete')
                  setError('')
                  setNotice('')
                  try {
                    await deleteMediaAsset(selected)
                    setNotice('Deleted.')
                    setOpenId('')
                    await refresh()
                  } catch (err) {
                    setError(err?.message || 'Delete failed.')
                  } finally {
                    setBusy('')
                  }
                }}
                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                {busy === 'delete' ? 'Deleting…' : 'Delete'}
              </button>
              <button
                type="button"
                disabled={busy === 'save'}
                onClick={async () => {
                  setBusy('save')
                  setError('')
                  setNotice('')
                  try {
                    await updateMediaAsset(selected.id, {
                      title: edit.title.trim() || null,
                      alt: edit.alt.trim() || null,
                      tags: parseTags(edit.tags),
                    })
                    setNotice('Saved.')
                    await refresh()
                  } catch (err) {
                    setError(err?.message || 'Save failed.')
                  } finally {
                    setBusy('')
                  }
                }}
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
              >
                {busy === 'save' ? 'Saving…' : 'Save'}
              </button>
            </div>
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-4 text-left">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Public URL</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <code className="break-all text-xs text-zinc-700 dark:text-zinc-200">
                  {getPublicAssetUrl({ bucket: selected.bucket, path: selected.path })}
                </code>
                <button
                  type="button"
                  onClick={async () => {
                    const url = getPublicAssetUrl({ bucket: selected.bucket, path: selected.path })
                    await navigator.clipboard.writeText(url)
                    setNotice('Copied URL.')
                  }}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title</span>
                <input
                  value={edit.title}
                  onChange={(e) => setEdit((v) => ({ ...v, title: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Alt text</span>
                <input
                  value={edit.alt}
                  onChange={(e) => setEdit((v) => ({ ...v, alt: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Tags (comma-separated)</span>
              <input
                value={edit.tags}
                onChange={(e) => setEdit((v) => ({ ...v, tags: e.target.value }))}
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="hero, course, pdf"
              />
            </label>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950/40">
              <div><span className="font-semibold">Bucket:</span> {selected.bucket}</div>
              <div className="mt-1"><span className="font-semibold">Path:</span> {selected.path}</div>
              <div className="mt-1"><span className="font-semibold">Type:</span> {selected.mime_type || '—'}</div>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}

