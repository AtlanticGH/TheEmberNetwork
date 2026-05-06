import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { listResources } from '../services/resources'

export function ResourcesPage() {
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])

  const faqs = [
    {
      q: 'How often do mentorship sessions happen?',
      a: 'Most members have weekly accountability check-ins and monthly deep-dive mentor sessions.',
    },
    {
      q: 'Can beginners join TEN?',
      a: 'Yes. TEN supports both idea-stage founders and early-stage entrepreneurs with structured pathways.',
    },
    {
      q: 'Where should I start?',
      a: 'Start from the Join page application. We review your stage and recommend your first mentorship track.',
    },
  ]

  useEffect(() => {
    let ignore = false
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await listResources({ limit: 200 })
        if (!ignore) setItems(data)
      } catch (err) {
        if (!ignore) setError(err?.message || 'Unable to load resources.')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    queueMicrotask(() => run())
    return () => {
      ignore = true
    }
  }, [])

  const categories = useMemo(() => {
    const set = new Set()
    ;(items || []).forEach((r) => {
      const c = String(r.category || '').trim()
      if (c) set.add(c)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <section
        id="home-gateway"
        className="relative"
        data-bg="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80"
      >
        <div
          id="home-gateway-bg"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/60 to-zinc-950/80" />
        <div className="relative mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100 backdrop-blur">
            Resources
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-white md:text-6xl">Practical guides for purposeful growth</h1>
          <p className="mt-5 max-w-2xl text-sm text-zinc-100/90 md:text-base">
            Explore actionable playbooks, templates, and mentorship notes to help you move from idea to measurable progress.
          </p>
        </div>
      </section>

      <section id="featured-resources" className="mx-auto max-w-7xl px-8 py-14 md:px-12 lg:px-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-400">Featured Resources</p>
          <h2 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-white md:text-4xl">Learn, apply, and grow consistently</h2>
        </div>
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <div className="animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100/70 p-10 dark:border-zinc-800 dark:bg-zinc-900/40" />
            <div className="animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100/70 p-10 dark:border-zinc-800 dark:bg-zinc-900/40" />
            <div className="animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100/70 p-10 dark:border-zinc-800 dark:bg-zinc-900/40" />
          </div>
        ) : items.length ? (
          <div className="space-y-6">
            {categories.length ? (
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <span key={c} className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200">
                    {c}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((r) => (
                <article key={r.id} className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/70">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{r.title}</h3>
                  {r.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{r.description}</p> : null}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    {r.category ? <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{r.category}</span> : <span />}
                    {r.download_url ? (
                      <a
                        href={r.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
                      >
                        Download
                      </a>
                    ) : (
                      <Link to="/apply" className="inline-flex rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
                        Learn more
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            No resources published yet.
          </div>
        )}
      </section>

      <section id="resource-faqs" className="mx-auto max-w-7xl px-8 pb-20 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-400">FAQs</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">Common questions</h2>
          <div className="mt-5 space-y-3">
            {faqs.map((f, idx) => {
              const isOpen = open === idx
              return (
                <div key={f.q} className="rounded-xl border border-zinc-800 bg-zinc-900">
                  <button
                    type="button"
                    aria-expanded={isOpen ? 'true' : 'false'}
                    onClick={() => setOpen((v) => (v === idx ? null : idx))}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-zinc-200"
                  >
                    {f.q} <span>{isOpen ? '–' : '+'}</span>
                  </button>
                  {isOpen ? (
                    <div className="border-t border-zinc-800 px-4 py-3 text-sm text-zinc-300">{f.a}</div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </main>
  )
}

