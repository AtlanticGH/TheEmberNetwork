import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getCourse,
  listLessons,
  listModules,
  listMyEnrollments,
  listMyLessonCompletionsForCourse,
  listMyModuleCompletionsForCourse,
} from '../services/db'

function pct(completed, total) {
  if (!total) return 0
  return Math.round((completed * 100) / total)
}

export function CourseDetailsPage() {
  const { courseId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [lessonsByModule, setLessonsByModule] = useState({})
  const [enrolled, setEnrolled] = useState(false)
  const [completions, setCompletions] = useState([])
  const [lessonCompletions, setLessonCompletions] = useState([])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, m, e, completionsList, lessonCompletionsList] = await Promise.all([
        getCourse(courseId),
        listModules(courseId),
        listMyEnrollments(),
        listMyModuleCompletionsForCourse(courseId),
        listMyLessonCompletionsForCourse(courseId),
      ])
      setCourse(c)
      setModules(m)
      setEnrolled((e || []).some((x) => x.course_id === courseId))
      setCompletions(completionsList)
      setLessonCompletions(lessonCompletionsList)

      const lessonsMap = {}
      await Promise.all(
        (m || []).map(async (mod) => {
          lessonsMap[mod.id] = await listLessons(mod.id)
        })
      )
      setLessonsByModule(lessonsMap)
    } catch (err) {
      setError(err?.message || 'Unable to load course.')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    if (!courseId) return
    queueMicrotask(() => {
      refresh()
    })
  }, [courseId, refresh])

  const completedSet = useMemo(() => new Set(completions.map((c) => c.module_id)), [completions])
  const completedLessonsSet = useMemo(() => new Set(lessonCompletions.map((c) => c.lesson_id)), [lessonCompletions])
  const completedCount = completedSet.size
  const totalCount = modules.length
  const percentage = pct(completedCount, totalCount)

  return (
    <main id="page-main" data-component="page-main" className="mx-auto max-w-7xl px-8 pb-20 pt-28 md:px-12 lg:px-10">
      {loading ? (
        <div className="grid gap-4">
          <div className="animate-pulse rounded-[28px] border border-zinc-200 bg-zinc-100/70 p-10 dark:border-zinc-800 dark:bg-zinc-900/40" />
          <div className="animate-pulse rounded-[28px] border border-zinc-200 bg-zinc-100/70 p-10 dark:border-zinc-800 dark:bg-zinc-900/40" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : (
        <>
          <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="relative p-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
              <div className="relative">
            <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Course</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold md:text-4xl">{course?.title}</h1>
                <p className="mt-2 max-w-3xl text-sm text-zinc-600 dark:text-zinc-300">{course?.description}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-500">
                  {course?.instructor ? <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">Instructor: {course.instructor}</span> : null}
                  {course?.duration ? <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">Duration: {course.duration}</span> : null}
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">
                    {percentage}% complete
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/member/courses" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
                  Back to courses
                </Link>
                <Link to="/member" className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-400">
                  Dashboard
                </Link>
              </div>
            </div>
              </div>
            </div>
          </header>

          {!enrolled ? (
            <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              You are not enrolled in this course yet. Go back to courses to enroll.
            </div>
          ) : null}

          <section className="mt-8 rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Modules</p>
                <h2 className="mt-2 text-2xl font-semibold">Lessons & tasks</h2>
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{completedCount}/{totalCount} complete</p>
            </div>

            <div className="mt-6 space-y-3">
              {modules.map((m) => {
                const done = completedSet.has(m.id)
                const lessons = lessonsByModule[m.id] || []
                return (
                  <div key={m.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Module {m.position}</p>
                        <h3 className="mt-1 text-lg font-semibold">{m.title}</h3>
                        {m.description ? (
                          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{m.description}</p>
                        ) : null}
                      </div>
                      <span
                        className={[
                          'inline-flex rounded-full px-4 py-2 text-sm font-semibold',
                          done
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                            : 'border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200',
                        ].join(' ')}
                      >
                        {done ? 'Completed' : 'Not completed'}
                      </span>
                    </div>

                    {lessons.length ? (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Lessons</p>
                        {lessons.map((l) => {
                          const lDone = completedLessonsSet.has(l.id)
                          return (
                            <div key={l.id} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-xs uppercase tracking-[0.14em] text-orange-500">Lesson {l.position}</p>
                                  <Link
                                    to={`/member/courses/${courseId}/lessons/${l.id}`}
                                    className="mt-1 inline-flex text-sm font-semibold text-zinc-900 hover:text-orange-600 hover:underline dark:text-zinc-100 dark:hover:text-orange-300"
                                  >
                                    {l.title}
                                  </Link>
                                  {l.description ? (
                                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{l.description}</p>
                                  ) : null}
                                </div>
                                <span
                                  className={[
                                    'inline-flex rounded-full px-4 py-2 text-xs font-semibold',
                                    lDone
                                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                                      : 'border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200',
                                  ].join(' ')}
                                >
                                  {lDone ? 'Completed' : 'Not completed'}
                                </span>
                              </div>
                              {l.content?.sections?.length ? (
                                <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                                  {l.content.sections.slice(0, 3).map((s, idx) => (
                                    <div key={idx} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/30">
                                      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{s.type || 'content'}</p>
                                      {s.type === 'resource' ? (
                                        <a
                                          className="mt-1 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300"
                                          href={s.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {s.title || s.url || 'Open resource'}
                                        </a>
                                      ) : (
                                        <p className="mt-1 whitespace-pre-wrap">{s.value}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )
                        })}
                      </div>
                    ) : null}

                    {m.content?.sections?.length ? (
                      <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                        {m.content.sections.slice(0, 4).map((s, idx) => (
                          <div key={idx} className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                            <p className="text-xs uppercase tracking-[0.14em] text-orange-500">{s.type || 'content'}</p>
                            <p className="mt-1">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        </>
      )}
    </main>
  )
}

