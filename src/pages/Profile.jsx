import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { updateMyProfile } from '../services/db'

function InitialsAvatar({ name, email }) {
  const initials = useMemo(() => {
    const base = (name || email || 'Member').trim()
    const parts = base.split(/\s+/).filter(Boolean)
    const a = (parts[0]?.[0] || 'M').toUpperCase()
    const b = (parts[1]?.[0] || parts[0]?.[1] || 'E').toUpperCase()
    return `${a}${b}`
  }, [name, email])

  return (
    <div className="grid h-16 w-16 place-content-center rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 text-sm font-bold text-white shadow-glow ring-2 ring-white/60 dark:ring-zinc-950/60">
      {initials}
    </div>
  )
}

export function ProfilePage() {
  const location = useLocation()
  const inMemberShell = location.pathname.startsWith('/member')

  const { profile, refreshProfile, user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [goals, setGoals] = useState('')

  useEffect(() => {
    queueMicrotask(() => {
      setFullName(profile?.full_name || '')
      setBio(profile?.bio || '')
      setPhone(profile?.phone || '')
      setCountry(profile?.country || '')
      setGoals(profile?.goals || '')
    })
  }, [profile])

  const joinedAtLabel = useMemo(() => {
    const raw = profile?.joined_at
    if (!raw) return '—'
    try {
      return new Date(raw).toLocaleDateString()
    } catch {
      return '—'
    }
  }, [profile?.joined_at])

  const memberId = user?.id ? String(user.id).slice(0, 8).toUpperCase() : '—'
  const statusLabel = profile?.status === 'suspended' ? 'Suspended' : 'Active'

  const pageClass = inMemberShell ? 'space-y-6' : 'mx-auto max-w-7xl px-8 pb-20 pt-28 md:px-12 lg:px-10'

  return (
    <main id="page-main" data-component="page-main" className={pageClass}>
      <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="relative p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              {profile?.profile_image_url ? (
                <img
                  src={profile.profile_image_url}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-orange-200 dark:ring-orange-900/40"
                  loading="lazy"
                />
              ) : (
                <InitialsAvatar name={profile?.full_name} email={user?.email} />
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Profile</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{profile?.full_name || 'Your details'}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/30">
                    Status: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{statusLabel}</span>
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/30">
                    Member ID: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{memberId}</span>
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/30">
                    Email: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{user?.email || '—'}</span>
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/30">
                    Joined: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{joinedAtLabel}</span>
                  </span>
                </div>
                <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
                  Keep your profile up to date so mentors can personalize your support.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {!inMemberShell ? (
                <>
                  <Link
                    to="/member"
                    className="inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/member/courses"
                    className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
                  >
                    Courses
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-3xl rounded-[28px] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            setNotice('')
            if (!fullName.trim()) {
              setError('Full name is required.')
              return
            }
            setSaving(true)
            try {
              await updateMyProfile({
                full_name: fullName.trim(),
                bio: bio.trim(),
                phone: phone.trim(),
                country: country.trim(),
                goals: goals.trim(),
              })
              await refreshProfile()
              setNotice('Profile updated.')
            } catch (err) {
              setError(err?.message || 'Unable to save profile.')
            } finally {
              setSaving(false)
            }
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Full name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Email</label>
              <input
                value={user?.email || ''}
                readOnly
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 outline-none dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
              placeholder="Tell us what you’re building and what support you want."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                placeholder="+233…"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Country</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                placeholder="Ghana"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Goals</label>
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="mt-2 min-h-24 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
              placeholder="What do you want to achieve in the next 30–90 days?"
            />
          </div>

          <div className="grid gap-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Pro tips</p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-300 space-y-1">
              <li>- Add a clear bio so mentors can tailor support.</li>
              <li>- Keep your goals measurable (30/60/90-day outcomes).</li>
            </ul>
          </div>

          {notice ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              {notice}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </main>
  )
}

