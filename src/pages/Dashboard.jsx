import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { listCourses, listMyCourseProgress, listMyEnrollments, listMyMilestones, listMyNotifications, listMyUpcomingSessions } from '../services/db'

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
      <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" style={{ width: `${v}%` }} />
    </div>
  )
}

function useCountUp(value, { durationMs = 650 } = {}) {
  const [shown, setShown] = useState(() => Number(value) || 0)

  useEffect(() => {
    const target = Number(value) || 0
    const start = performance.now()
    const from = Number(shown) || 0
    let raf = 0

    const tick = (now) => {
      const t = Math.min(1, (now - start) / Math.max(1, durationMs))
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (target - from) * eased
      setShown(next)
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return shown
}

function InitialsAvatar({ name, email }) {
  const initials = useMemo(() => {
    const base = (name || email || 'Member').trim()
    const parts = base.split(/\s+/).filter(Boolean)
    const a = (parts[0]?.[0] || 'M').toUpperCase()
    const b = (parts[1]?.[0] || parts[0]?.[1] || 'E').toUpperCase()
    return `${a}${b}`
  }, [name, email])

  return (
    <div className="grid h-14 w-14 place-content-center rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 text-sm font-bold text-white shadow-glow ring-2 ring-white/60 dark:ring-zinc-950/60">
      {initials}
    </div>
  )
}

function Skeleton({ className = '' }) {
  return <div className={['animate-pulse rounded-2xl bg-zinc-200/70 dark:bg-zinc-800/60', className].join(' ')} />
}

function StatCard({ label, value, sublabel, tone = 'orange', icon }) {
  const toneClass =
    tone === 'emerald'
      ? 'from-emerald-500/10 via-emerald-400/5 to-transparent border-emerald-200/60 dark:border-emerald-900/40'
      : tone === 'zinc'
        ? 'from-zinc-500/10 via-zinc-400/5 to-transparent border-zinc-200/60 dark:border-zinc-800'
        : 'from-orange-500/10 via-amber-400/5 to-transparent border-orange-200/60 dark:border-orange-900/40'

  return (
    <div className={['group rounded-3xl border bg-gradient-to-br p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md', toneClass].join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{value}</p>
          {sublabel ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{sublabel}</p> : null}
        </div>
        <div className="grid h-10 w-10 place-content-center rounded-2xl border border-zinc-200 bg-white/70 text-zinc-700 shadow-sm transition group-hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200">
          <span className="text-base">{icon}</span>
        </div>
      </div>
    </div>
  )
}

function MemberNav({ onNavigate }) {
  return (
    <div className="grid gap-2">
      <Link
        to="/member"
        onClick={() => onNavigate?.()}
        className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100"
      >
        Overview
      </Link>
      <Link
        to="/member/courses"
        onClick={() => onNavigate?.()}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200"
      >
        Courses
      </Link>
      <Link
        to="/member/profile"
        onClick={() => onNavigate?.()}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200"
      >
        Profile
      </Link>
      <Link
        to="/member/activity"
        onClick={() => onNavigate?.()}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200"
      >
        Activity
      </Link>
    </div>
  )
}

function SparkBars({ values = [] }) {
  const max = Math.max(1, ...values.map((v) => Number(v) || 0))
  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((v, idx) => {
        const h = Math.max(6, Math.round(((Number(v) || 0) / max) * 100))
        return (
          <div
            key={idx}
            className="w-2 rounded-full bg-gradient-to-t from-orange-500 to-amber-300 opacity-80"
            style={{ height: `${h}%` }}
            title={`${v}`}
          />
        )
      })}
    </div>
  )
}

function TimelineItem({ title, meta, body, tone = 'zinc' }) {
  const dot =
    tone === 'orange'
      ? 'bg-orange-500'
      : tone === 'emerald'
        ? 'bg-emerald-500'
        : 'bg-zinc-400 dark:bg-zinc-600'
  return (
    <div className="grid grid-cols-[18px_1fr] gap-3">
      <div className="flex flex-col items-center">
        <div className={['mt-1 h-2.5 w-2.5 rounded-full', dot].join(' ')} />
        <div className="mt-2 w-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="pb-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
          {meta ? <p className="text-xs text-zinc-500">{meta}</p> : null}
        </div>
        {body ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{body}</p> : null}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const location = useLocation()
  const inMemberShell = location.pathname.startsWith('/member')
  const { profile, user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [progress, setProgress] = useState([])
  const [milestones, setMilestones] = useState([])
  const [notifications, setNotifications] = useState([])
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    let alive = true
    const run = async () => {
      setLoading(true)
      setError('')
      try {
        const [c, e, p, m, n, s] = await Promise.all([
          listCourses(),
          listMyEnrollments(),
          listMyCourseProgress(),
          listMyMilestones(),
          listMyNotifications({ limit: 6 }),
          listMyUpcomingSessions({ limit: 5 }),
        ])
        if (!alive) return
        setCourses(c)
        setEnrollments(e)
        setProgress(p)
        setMilestones(m)
        setNotifications(n)
        setSessions(s)
        await refreshProfile()
      } catch (err) {
        if (!alive) return
        setError(err?.message || 'Unable to load your dashboard right now.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [refreshProfile])

  const courseById = useMemo(() => {
    const map = new Map()
    courses.forEach((c) => map.set(c.id, c))
    return map
  }, [courses])

  const progressByCourse = useMemo(() => {
    const map = new Map()
    progress.forEach((p) => map.set(p.course_id, p))
    return map
  }, [progress])

  const enrolledCourses = useMemo(() => {
    return enrollments
      .map((e) => ({ enrollment: e, course: courseById.get(e.course_id) }))
      .filter((x) => x.course)
  }, [enrollments, courseById])

  const name = profile?.full_name || user?.email || 'Member'

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

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

  const overallPct = useMemo(() => {
    if (!progress.length) return 0
    const vals = progress.map((p) => Number(p.percentage) || 0)
    return Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length))
  }, [progress])

  const monthlyActivityBars = useMemo(() => {
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    const bucket = new Map(months.map((m) => [m, 0]))
    const add = (iso) => {
      if (!iso) return
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (bucket.has(k)) bucket.set(k, (bucket.get(k) || 0) + 1)
    }
    notifications.forEach((n) => add(n.created_at))
    milestones.forEach((m) => add(m.created_at))
    return months.map((m) => bucket.get(m) || 0)
  }, [notifications, milestones])

  const activityItems = useMemo(() => {
    const items = []
    notifications.slice(0, 6).forEach((n) => {
      items.push({
        id: `n:${n.id}`,
        tone: 'orange',
        title: n.title || 'Notification',
        body: n.body || '',
        ts: n.created_at,
      })
    })
    milestones.slice(0, 6).forEach((m) => {
      items.push({
        id: `m:${m.id}`,
        tone: m.status === 'completed' ? 'emerald' : 'zinc',
        title: `Milestone: ${m.title}`,
        body: m.status ? `Status: ${String(m.status).replace('_', ' ')}` : '',
        ts: m.created_at,
      })
    })
    return items
      .filter((x) => x.ts)
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
      .slice(0, 10)
  }, [notifications, milestones])

  const statActiveCourses = useCountUp(enrolledCourses.length)
  const statOverallPct = useCountUp(overallPct)
  const statNotifs = useCountUp(notifications.length)

  const outerMainClass = inMemberShell
    ? 'pb-8'
    : 'mx-auto max-w-7xl px-8 pb-20 pt-28 md:px-12 lg:px-10'

  return (
    <main id="page-main" data-component="page-main" className={outerMainClass}>
      <div className={inMemberShell ? 'space-y-6' : 'grid gap-6 lg:grid-cols-[280px_1fr]'}>
        {!inMemberShell ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center gap-4">
                {profile?.profile_image_url ? (
                  <img
                    src={profile.profile_image_url}
                    alt="Profile"
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-orange-200 dark:ring-orange-900/40"
                    loading="lazy"
                  />
                ) : (
                  <InitialsAvatar name={profile?.full_name} email={user?.email} />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{name}</p>
                  <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{user?.email || '—'}</p>
                </div>
              </div>
              <div className="mt-5">
                <MemberNav />
              </div>
            </div>
          </aside>
        ) : null}

        <section className="min-w-0 space-y-6">
          <div className="flex items-center justify-between gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-200"
              title="Open menu"
            >
              Menu
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-200"
                title="Notifications"
              >
                Alerts ({notifications.length})
              </button>
              <Link
                to="/member/profile"
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
                title="Open profile"
              >
                Profile
              </Link>
            </div>
          </div>

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
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Member Dashboard</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">Welcome back, {name}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                      <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/30">
                        Status: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{statusLabel}</span>
                      </span>
                      <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/30">
                        Member ID: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{memberId}</span>
                      </span>
                      <span className="rounded-full border border-zinc-200 bg-white/70 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950/30">
                        Joined: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{joinedAtLabel}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/member/courses"
                    className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-orange-400 active:scale-[0.99]"
                    title="Browse available courses"
                  >
                    Browse courses
                  </Link>
                  <Link
                    to="/member/profile"
                    className="inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                    title="Edit your profile"
                  >
                    Edit profile
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-28 rounded-3xl" />
              <Skeleton className="h-48 rounded-3xl md:col-span-2" />
              <Skeleton className="h-48 rounded-3xl" />
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Active courses"
                  value={Math.round(statActiveCourses)}
                  sublabel="Currently enrolled"
                  icon="📚"
                />
                <StatCard
                  label="Overall progress"
                  value={`${Math.round(statOverallPct)}%`}
                  sublabel="Across enrolled courses"
                  icon="📈"
                  tone="emerald"
                />
                <StatCard
                  label="Notifications"
                  value={Math.round(statNotifs)}
                  sublabel="Latest updates"
                  icon="🔔"
                  tone="zinc"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Your courses</p>
                      <h2 className="mt-2 text-2xl font-semibold">Enrolled programs</h2>
                      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                        Jump back into a program and track progress with quick visual indicators.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Monthly activity</p>
                      <div className="mt-2">
                        <SparkBars values={monthlyActivityBars} />
                      </div>
                    </div>
                  </div>

                  {enrolledCourses.length ? (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {enrolledCourses.map(({ enrollment, course }) => {
                        const p = progressByCourse.get(course.id)
                        const pct = p?.percentage ?? 0
                        return (
                          <Link
                            key={enrollment.id}
                            to={`/member/courses/${course.id}`}
                            className="group rounded-3xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-orange-500/60"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Progress</p>
                                <h3 className="mt-2 text-lg font-semibold text-zinc-900 group-hover:text-orange-600 dark:text-zinc-100 dark:group-hover:text-orange-300 line-clamp-2">
                                  {course.title}
                                </h3>
                              </div>
                              <div className="grid h-10 w-10 place-content-center rounded-2xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                                {pct}%
                              </div>
                            </div>
                            <p className="mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{course.description}</p>
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-xs text-zinc-500">
                                <span>{p?.completed_modules ?? 0}/{p?.total_modules ?? 0} modules</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">Continue →</span>
                              </div>
                              <ProgressBar value={pct} />
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-3xl border border-dashed border-zinc-300 p-7 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                      You’re not enrolled in any courses yet. Browse courses to get started.
                    </div>
                  )}
                </section>

                <aside className="space-y-6">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Mentorship</p>
                        <h2 className="mt-2 text-2xl font-semibold">Upcoming sessions</h2>
                      </div>
                      <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
                        {sessions.length}
                      </span>
                    </div>

                    {sessions.length ? (
                      <div className="mt-5 space-y-3">
                        {sessions.map((row) => (
                          <div key={row.session?.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-950/40">
                            <p className="text-sm font-semibold">{row.session?.title}</p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {new Date(row.session?.starts_at).toLocaleString()} • {row.status}
                            </p>
                            {row.session?.meeting_url ? (
                              <a className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300" href={row.session.meeting_url}>
                                Open meeting
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                        No upcoming sessions yet.
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Recent activity</p>
                    <h2 className="mt-2 text-2xl font-semibold">Timeline</h2>
                    <div className="mt-5">
                      {activityItems.length ? (
                        <div>
                          {activityItems.map((it) => (
                            <TimelineItem
                              key={it.id}
                              title={it.title}
                              body={it.body}
                              meta={it.ts ? new Date(it.ts).toLocaleString() : ''}
                              tone={it.tone}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                          No recent activity yet.
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </section>
      </div>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-black/60 px-4 py-8 lg:hidden"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMobileNavOpen(false)
          }}
        >
          <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Dashboard navigation</p>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
              >
                Close
              </button>
            </div>
            <div className="mt-2">
              <MemberNav onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        </div>
      ) : null}

      {notifOpen ? (
        <div className="fixed inset-x-0 bottom-4 z-[85] mx-auto w-[min(720px,calc(100%-2rem))] rounded-3xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Notifications</p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Latest updates for your account.</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifOpen(false)}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
            >
              Close
            </button>
          </div>
          <div className="mt-4 max-h-56 space-y-2 overflow-auto pr-1">
            {notifications.length ? (
              notifications.slice(0, 12).map((n) => (
                <div key={n.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-sm font-semibold">{n.title}</p>
                  {n.body ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{n.body}</p> : null}
                  <p className="mt-2 text-xs text-zinc-500">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                No notifications yet.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </main>
  )
}

