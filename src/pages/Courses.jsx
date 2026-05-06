import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { enrollInCourse, listCourses, listMyCourseProgress, listMyEnrollments } from '../services/db'

function ProgressPill({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-300">
      <span className="h-2 w-2 rounded-full bg-orange-500" />
      {v}% complete
    </span>
  )
}

function Skeleton({ className = '' }) {
  return <div className={['animate-pulse rounded-3xl bg-zinc-200/70 dark:bg-zinc-800/60', className].join(' ')} />
}

export function CoursesPage() {
  const location = useLocation()
  const inMemberShell = location.pathname.startsWith('/member')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [progress, setProgress] = useState([])
  const [enrollingId, setEnrollingId] = useState('')
  const [query, setQuery] = useState('')

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const [c, e, p] = await Promise.all([listCourses(), listMyEnrollments(), listMyCourseProgress()])
      setCourses(c)
      setEnrollments(e)
      setProgress(p)
    } catch (err) {
      setError(err?.message || 'Unable to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      refresh()
    })
  }, [])

  const enrolledCourseIds = useMemo(() => new Set(enrollments.map((e) => e.course_id)), [enrollments])
  const progressByCourse = useMemo(() => {
    const map = new Map()
    progress.forEach((p) => map.set(p.course_id, p))
    return map
  }, [progress])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) => {
      return (
        String(c.title || '').toLowerCase().includes(q) ||
        String(c.description || '').toLowerCase().includes(q) ||
        String(c.instructor || '').toLowerCase().includes(q) ||
        String(c.category || '').toLowerCase().includes(q)
      )
    })
  }, [courses, query])

  const pageClass = inMemberShell ? 'space-y-6' : 'mx-auto max-w-7xl px-8 pb-20 pt-28 md:px-12 lg:px-10'

  return (
    <main id="page-main" data-component="page-main" className={pageClass}>
      <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="relative p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Courses</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Explore learning tracks</h1>
              <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
                Enroll in a track to unlock modules and start tracking progress.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30 md:w-72"
                placeholder="Search courses, instructors, categories…"
              />
              {!inMemberShell ? (
                <Link
                  to="/member"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Dashboard
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : (
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map((c) => {
            const isEnrolled = enrolledCourseIds.has(c.id)
            const p = progressByCourse.get(c.id)
            return (
              <article
                key={c.id}
                className="group rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-orange-500/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 group-hover:text-orange-600 dark:text-zinc-100 dark:group-hover:text-orange-300">
                      {c.title}
                    </h2>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{c.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                      {c.instructor ? <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">Instructor: {c.instructor}</span> : null}
                      {c.duration ? <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">Duration: {c.duration}</span> : null}
                      {c.category ? <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">Category: {c.category}</span> : null}
                      {c.difficulty ? <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">{c.difficulty}</span> : null}
                    </div>
                  </div>
                  {p ? <ProgressPill value={p.percentage} /> : null}
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  {isEnrolled ? (
                    <Link to={`/member/courses/${c.id}`} className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400">
                      Continue learning
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={enrollingId === c.id}
                      onClick={async () => {
                        setEnrollingId(c.id)
                        try {
                          await enrollInCourse(c.id)
                          await refresh()
                        } catch (err) {
                          setError(err?.message || 'Unable to enroll.')
                        } finally {
                          setEnrollingId('')
                        }
                      }}
                      className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {enrollingId === c.id ? 'Enrolling…' : 'Enroll'}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
          {!filtered.length ? (
            <div className="md:col-span-2 rounded-[28px] border border-dashed border-zinc-300 bg-white p-8 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
              No courses match your search.
            </div>
          ) : null}
        </section>
      )}
    </main>
  )
}

