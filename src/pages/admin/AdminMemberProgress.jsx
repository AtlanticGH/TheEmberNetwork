import { useEffect, useMemo, useState } from 'react'
import { requireSupabase } from '../../services/supabaseClient'
import { adminMarkComplete, adminMarkIncomplete } from '../../services/adminProgress'

function Badge({ children, tone = 'zinc' }) {
  const tones = {
    zinc: 'border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200',
    emerald: 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200',
    amber: 'border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200',
  }
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tones[tone] || tones.zinc}`}>{children}</span>
}

export function AdminMemberProgressPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [busyKey, setBusyKey] = useState('')

  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [courseCompletions, setCourseCompletions] = useState([])
  const [moduleCompletions, setModuleCompletions] = useState([])
  const [lessonCompletions, setLessonCompletions] = useState([])

  const userId = profile?.user_id || ''

  const refresh = async () => {
    setLoading(true)
    setError('')
    setProfile(null)
    try {
      const supabase = requireSupabase()
      const trimmed = email.trim()
      if (!trimmed) throw new Error('Enter a member email.')

      const { data: p, error: pErr } = await supabase.from('profiles').select('user_id,email,full_name,role,status').eq('email', trimmed).maybeSingle()
      if (pErr) throw pErr
      if (!p?.user_id) throw new Error('No member found for that email.')
      setProfile(p)

      const [
        { data: es, error: eErr },
        { data: cc, error: ccErr },
        { data: mc, error: mcErr },
        { data: lc, error: lcErr },
      ] = await Promise.all([
        supabase.from('enrollments').select('*').eq('user_id', p.user_id).order('enrolled_at', { ascending: false }),
        supabase.from('course_completions').select('*').eq('user_id', p.user_id),
        supabase.from('module_completions').select('*').eq('user_id', p.user_id),
        supabase.from('lesson_completions').select('*').eq('user_id', p.user_id),
      ])
      if (eErr) throw eErr
      if (ccErr) throw ccErr
      if (mcErr) throw mcErr
      if (lcErr) throw lcErr
      setEnrollments(es || [])
      setCourseCompletions(cc || [])
      setModuleCompletions(mc || [])
      setLessonCompletions(lc || [])

      const courseIds = Array.from(new Set((es || []).map((x) => x.course_id))).filter(Boolean)
      if (!courseIds.length) {
        setCourses([])
        setModules([])
        setLessons([])
        return
      }

      const [{ data: cs, error: cErr }, { data: ms, error: mErr }, { data: ls, error: lErr }] = await Promise.all([
        supabase.from('courses').select('*').in('id', courseIds),
        supabase.from('modules').select('*').in('course_id', courseIds).order('position', { ascending: true }),
        // join lessons → modules to filter by course list
        supabase.from('lessons').select('*, modules!inner(course_id)').in('modules.course_id', courseIds).order('position', { ascending: true }),
      ])
      if (cErr) throw cErr
      if (mErr) throw mErr
      if (lErr) throw lErr
      setCourses(cs || [])
      setModules(ms || [])
      setLessons((ls || []).map((x) => ({ ...x, course_id: x.modules?.course_id })))
    } catch (err) {
      setError(err?.message || 'Unable to load progress.')
    } finally {
      setLoading(false)
    }
  }

  const courseById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses])
  const modulesByCourse = useMemo(() => {
    const map = new Map()
    modules.forEach((m) => {
      const arr = map.get(m.course_id) || []
      arr.push(m)
      map.set(m.course_id, arr)
    })
    return map
  }, [modules])
  const lessonsByModule = useMemo(() => {
    const map = new Map()
    lessons.forEach((l) => {
      const arr = map.get(l.module_id) || []
      arr.push(l)
      map.set(l.module_id, arr)
    })
    return map
  }, [lessons])

  const courseDone = useMemo(() => new Set(courseCompletions.map((x) => x.course_id)), [courseCompletions])
  const moduleDone = useMemo(() => new Set(moduleCompletions.map((x) => x.module_id)), [moduleCompletions])
  const lessonDone = useMemo(() => new Set(lessonCompletions.map((x) => x.lesson_id)), [lessonCompletions])

  const courseCompletionById = useMemo(() => new Map(courseCompletions.map((x) => [x.course_id, x])), [courseCompletions])
  const moduleCompletionById = useMemo(() => new Map(moduleCompletions.map((x) => [x.module_id, x])), [moduleCompletions])
  const lessonCompletionById = useMemo(() => new Map(lessonCompletions.map((x) => [x.lesson_id, x])), [lessonCompletions])

  const actorIds = useMemo(() => {
    const set = new Set()
    ;(courseCompletions || []).forEach((x) => x.marked_by && set.add(x.marked_by))
    ;(moduleCompletions || []).forEach((x) => x.marked_by && set.add(x.marked_by))
    ;(lessonCompletions || []).forEach((x) => x.marked_by && set.add(x.marked_by))
    return Array.from(set)
  }, [courseCompletions, moduleCompletions, lessonCompletions])

  const [actorMap, setActorMap] = useState({})

  const actorIdsKey = useMemo(() => actorIds.join(','), [actorIds])

  useEffect(() => {
    let ignore = false
    const run = async () => {
      if (!actorIds.length) {
        setActorMap({})
        return
      }
      try {
        const supabase = requireSupabase()
        const { data, error } = await supabase.from('profiles').select('user_id,email,full_name').in('user_id', actorIds.slice(0, 50))
        if (error) throw error
        const map = {}
        ;(data || []).forEach((p) => {
          map[p.user_id] = p.full_name || p.email || p.user_id
        })
        if (!ignore) setActorMap(map)
      } catch {
        if (!ignore) setActorMap({})
      }
    }
    queueMicrotask(() => run())
    return () => {
      ignore = true
    }
  }, [actorIdsKey, actorIds])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Member progress</p>
          <h2 className="mt-2 text-2xl font-semibold">Completion overview</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Search a member to view course/module/lesson completion.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
        <form
          className="flex flex-col gap-3 md:flex-row md:items-center"
          onSubmit={(e) => {
            e.preventDefault()
            refresh()
          }}
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30 md:flex-1"
            placeholder="member email…"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'View progress'}
          </button>
        </form>
        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      {profile ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{profile.full_name || profile.email}</p>
              <p className="mt-1 text-xs text-zinc-500">{profile.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={profile.status === 'active' ? 'emerald' : 'amber'}>{profile.status}</Badge>
              <Badge>{profile.role}</Badge>
            </div>
          </div>
        </div>
      ) : null}

      {userId && enrollments.length ? (
        <div className="space-y-4">
          {enrollments.map((e) => {
            const c = courseById.get(e.course_id)
            const ms = modulesByCourse.get(e.course_id) || []
            const cDone = courseDone.has(e.course_id)
            const cMeta = courseCompletionById.get(e.course_id) || null
            return (
              <div key={e.id} className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Course</p>
                    <p className="mt-2 text-xl font-semibold">{c?.title || e.course_id}</p>
                    {c?.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{c.description}</p> : null}
                    {cDone && (cMeta?.marked_at || cMeta?.marked_by) ? (
                      <p className="mt-2 text-xs text-zinc-500">
                        Marked {cMeta?.marked_at ? `on ${new Date(cMeta.marked_at).toLocaleString()}` : ''}
                        {cMeta?.marked_by ? ` by ${actorMap[cMeta.marked_by] || cMeta.marked_by}` : ''}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={cDone ? 'emerald' : 'zinc'}>{cDone ? 'Completed' : 'Not completed'}</Badge>
                    <button
                      type="button"
                      disabled={!userId || busyKey === `course:${e.course_id}`}
                      onClick={async () => {
                        setBusyKey(`course:${e.course_id}`)
                        setError('')
                        try {
                          if (cDone) await adminMarkIncomplete({ userId, type: 'course', id: e.course_id })
                          else await adminMarkComplete({ userId, type: 'course', id: e.course_id })
                          await refresh()
                        } catch (err) {
                          setError(err?.message || 'Unable to update course completion.')
                        } finally {
                          setBusyKey('')
                        }
                      }}
                      className={[
                        'rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-60',
                        cDone ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-emerald-600 hover:bg-emerald-500',
                      ].join(' ')}
                    >
                      {busyKey === `course:${e.course_id}` ? 'Saving…' : cDone ? 'Mark incomplete' : 'Mark complete'}
                    </button>
                    <button
                      type="button"
                      disabled={!userId || busyKey === `course:bulk:${e.course_id}`}
                      onClick={async () => {
                        setBusyKey(`course:bulk:${e.course_id}`)
                        setError('')
                        try {
                          await adminMarkComplete({ userId, type: 'course', id: e.course_id })
                          for (const m of ms) {
                            await adminMarkComplete({ userId, type: 'module', id: m.id })
                            const ls = lessonsByModule.get(m.id) || []
                            for (const l of ls) {
                              await adminMarkComplete({ userId, type: 'lesson', id: l.id })
                            }
                          }
                          await refresh()
                        } catch (err) {
                          setError(err?.message || 'Unable to bulk mark course completion.')
                        } finally {
                          setBusyKey('')
                        }
                      }}
                      className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      {busyKey === `course:bulk:${e.course_id}` ? 'Working…' : 'Bulk complete'}
                    </button>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {ms.map((m) => {
                    const mDone = moduleDone.has(m.id)
                    const mMeta = moduleCompletionById.get(m.id) || null
                    const ls = lessonsByModule.get(m.id) || []
                    return (
                      <div key={m.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Module {m.position}</p>
                            <p className="mt-1 text-sm font-semibold">{m.title}</p>
                            {mDone && (mMeta?.marked_at || mMeta?.marked_by) ? (
                              <p className="mt-1 text-xs text-zinc-500">
                                Marked {mMeta?.marked_at ? `on ${new Date(mMeta.marked_at).toLocaleString()}` : ''}
                                {mMeta?.marked_by ? ` by ${actorMap[mMeta.marked_by] || mMeta.marked_by}` : ''}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone={mDone ? 'emerald' : 'zinc'}>{mDone ? 'Completed' : 'Not completed'}</Badge>
                            <button
                              type="button"
                              disabled={!userId || busyKey === `module:${m.id}`}
                              onClick={async () => {
                                setBusyKey(`module:${m.id}`)
                                setError('')
                                try {
                                  if (mDone) await adminMarkIncomplete({ userId, type: 'module', id: m.id })
                                  else await adminMarkComplete({ userId, type: 'module', id: m.id })
                                  await refresh()
                                } catch (err) {
                                  setError(err?.message || 'Unable to update module completion.')
                                } finally {
                                  setBusyKey('')
                                }
                              }}
                              className={[
                                'rounded-full px-3 py-2 text-xs font-semibold text-white disabled:opacity-60',
                                mDone ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-emerald-600 hover:bg-emerald-500',
                              ].join(' ')}
                            >
                              {busyKey === `module:${m.id}` ? 'Saving…' : mDone ? 'Incomplete' : 'Complete'}
                            </button>
                          </div>
                        </div>
                        {ls.length ? (
                          <div className="mt-3 grid gap-2">
                            {ls.map((l) => {
                              const lDone = lessonDone.has(l.id)
                              const lMeta = lessonCompletionById.get(l.id) || null
                              return (
                                <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/30">
                                  <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-[0.14em] text-orange-500">Lesson {l.position}</p>
                                    <p className="mt-1 text-sm font-semibold">{l.title}</p>
                                    {lDone && (lMeta?.marked_at || lMeta?.marked_by) ? (
                                      <p className="mt-1 text-xs text-zinc-500">
                                        Marked {lMeta?.marked_at ? `on ${new Date(lMeta.marked_at).toLocaleString()}` : ''}
                                        {lMeta?.marked_by ? ` by ${actorMap[lMeta.marked_by] || lMeta.marked_by}` : ''}
                                      </p>
                                    ) : null}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge tone={lDone ? 'emerald' : 'zinc'}>{lDone ? 'Completed' : 'Not completed'}</Badge>
                                    <button
                                      type="button"
                                      disabled={!userId || busyKey === `lesson:${l.id}`}
                                      onClick={async () => {
                                        setBusyKey(`lesson:${l.id}`)
                                        setError('')
                                        try {
                                          if (lDone) await adminMarkIncomplete({ userId, type: 'lesson', id: l.id })
                                          else await adminMarkComplete({ userId, type: 'lesson', id: l.id })
                                          await refresh()
                                        } catch (err) {
                                          setError(err?.message || 'Unable to update lesson completion.')
                                        } finally {
                                          setBusyKey('')
                                        }
                                      }}
                                      className={[
                                        'rounded-full px-3 py-2 text-xs font-semibold text-white disabled:opacity-60',
                                        lDone ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-emerald-600 hover:bg-emerald-500',
                                      ].join(' ')}
                                    >
                                      {busyKey === `lesson:${l.id}` ? 'Saving…' : lDone ? 'Incomplete' : 'Complete'}
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : userId && !loading ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          No enrollments found for this user.
        </div>
      ) : null}
    </div>
  )
}

