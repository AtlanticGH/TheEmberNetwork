import { useEffect, useState } from 'react'
import { getSiteContent, upsertSiteContent } from '../../services/siteContent'

const SETTINGS_KEY = 'admin.settings.v1'

export function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [orgName, setOrgName] = useState('The Ember Network')
  const [supportEmail, setSupportEmail] = useState('hello@ember.network')

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const row = await getSiteContent(SETTINGS_KEY)
        if (!alive) return
        const v = row?.value || {}
        setOrgName(v.orgName || 'The Ember Network')
        setSupportEmail(v.supportEmail || 'hello@ember.network')
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load settings.')
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
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Settings</p>
      <h2 className="mt-2 text-2xl font-semibold">Branding & contact</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Stored in `site_content` (key `{SETTINGS_KEY}`). Extend with email templates and feature flags.</p>

      {error ? <p className="mt-4 text-sm text-rose-700 dark:text-rose-200">{error}</p> : null}
      {notice ? <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-200">{notice}</p> : null}

      <form
        className="mt-6 max-w-xl space-y-4"
        onSubmit={async (e) => {
          e.preventDefault()
          setSaving(true)
          setError('')
          setNotice('')
          try {
            await upsertSiteContent({
              key: SETTINGS_KEY,
              value: {
                orgName: orgName.trim(),
                supportEmail: supportEmail.trim(),
              },
            })
            setNotice('Settings saved.')
          } catch (err) {
            setError(err?.message || 'Unable to save.')
          } finally {
            setSaving(false)
          }
        }}
      >
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Organization name</label>
          <input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Support email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
