import { useEffect, useMemo, useState } from 'react'
import { getSiteContent, upsertSiteContent } from '../../services/siteContent'

const HOME_HERO_KEY = 'home.hero.v1'

const DEFAULT_HOME_HERO = {
  badge: 'A COMMUNITY OF IGNITION & EMPOWERMENT',
  headline_before: 'Small sparks ignite',
  headline_emphasis: 'big dreams at The Ember Network',
  description:
    'We help aspiring entrepreneurs and early-stage founders transform bold ideas into lasting ventures through mentorship, structured learning, and meaningful connections.',
  cta_primary_label: 'Apply for Membership',
  cta_primary_href: '/apply',
  cta_secondary_label: 'Explore Story',
  cta_secondary_href: '/about',
  background_image:
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{label}</span>
      <div className="mt-2">{children}</div>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
    </label>
  )
}

export function AdminContentPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [value, setValue] = useState(DEFAULT_HOME_HERO)

  const previewBg = useMemo(() => value.background_image || DEFAULT_HOME_HERO.background_image, [value.background_image])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      setNotice('')
      try {
        const row = await getSiteContent(HOME_HERO_KEY)
        if (!alive) return
        setValue((v) => ({ ...v, ...(row?.value || {}) }))
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load site content.')
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Content CMS</p>
        <h2 className="mt-2 text-2xl font-semibold">Website content</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Edit public site copy without deploying code. Changes apply immediately.
        </p>
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

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setSaving(true)
            setError('')
            setNotice('')
            try {
              await upsertSiteContent({ key: HOME_HERO_KEY, value })
              setNotice('Saved.')
            } catch (err) {
              setError(err?.message || 'Unable to save.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <Field label="Home hero badge">
            <input
              value={value.badge}
              onChange={(e) => setValue((v) => ({ ...v, badge: e.target.value }))}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Headline (before emphasis)">
              <input
                value={value.headline_before}
                onChange={(e) => setValue((v) => ({ ...v, headline_before: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </Field>
            <Field label="Headline (emphasis)">
              <input
                value={value.headline_emphasis}
                onChange={(e) => setValue((v) => ({ ...v, headline_emphasis: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={value.description}
              onChange={(e) => setValue((v) => ({ ...v, description: e.target.value }))}
              className="min-h-28 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
            />
          </Field>

          <Field label="Background image URL" hint="Use a full https URL. Prefer 1600–2400px wide images.">
            <input
              value={value.background_image}
              onChange={(e) => setValue((v) => ({ ...v, background_image: e.target.value }))}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Primary CTA label">
              <input
                value={value.cta_primary_label}
                onChange={(e) => setValue((v) => ({ ...v, cta_primary_label: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </Field>
            <Field label="Primary CTA link">
              <input
                value={value.cta_primary_href}
                onChange={(e) => setValue((v) => ({ ...v, cta_primary_href: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Secondary CTA label">
              <input
                value={value.cta_secondary_label}
                onChange={(e) => setValue((v) => ({ ...v, cta_secondary_label: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </Field>
            <Field label="Secondary CTA link">
              <input
                value={value.cta_secondary_href}
                onChange={(e) => setValue((v) => ({ ...v, cta_secondary_href: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <aside className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Preview</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div
              className="relative h-56 bg-cover bg-center"
              style={{ backgroundImage: `url('${previewBg}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-zinc-950/90" />
              <div className="relative p-5">
                <p className="inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur">
                  {value.badge}
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {value.headline_before}{' '}
                  <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-600 bg-clip-text text-transparent">
                    {value.headline_emphasis}
                  </span>
                </p>
                <p className="mt-2 text-xs text-white/90 line-clamp-3">{value.description}</p>
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            This is a lightweight preview. Check the real homepage after saving.
          </p>
        </aside>
      </div>
    </div>
  )
}

