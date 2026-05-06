import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getLesson,
  listLessonFiles,
  listLessons,
  listModules,
  listMyEnrollments,
  listMyLessonCompletionsForCourse,
} from '../services/db'
import { getPublicAssetUrl } from '../services/mediaAssets'
import { listAssignments } from '../services/assignments'
import { listMyQuizAttempts, listQuizQuestions, submitQuizAttempt } from '../services/quizzes'

function Block({ block }) {
  const type = block?.type || 'text'
  if (type === 'heading') {
    return <h3 className="text-xl font-semibold">{block?.value}</h3>
  }
  if (type === 'resource') {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Resource</p>
        <a
          className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300"
          href={block?.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {block?.title || block?.url || 'Open resource'}
        </a>
      </div>
    )
  }
  if (type === 'task') {
    return (
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-zinc-800 dark:border-orange-900/40 dark:bg-orange-950/25 dark:text-zinc-100">
        <p className="text-xs uppercase tracking-[0.14em] text-orange-600 dark:text-orange-300">Task</p>
        <p className="mt-2 whitespace-pre-wrap">{block?.value}</p>
      </div>
    )
  }
  return (
    <p className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap">
      {block?.value}
    </p>
  )
}

export function LessonPage() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lesson, setLesson] = useState(null)
  const [files, setFiles] = useState([])
  const [assignments, setAssignments] = useState([])
  const [quiz, setQuiz] = useState([])
  const [answers, setAnswers] = useState({})
  const [quizBusy, setQuizBusy] = useState(false)
  const [quizResult, setQuizResult] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [enrolled, setEnrolled] = useState(false)
  const [completedLessonIds, setCompletedLessonIds] = useState([])
  const [sequence, setSequence] = useState([])

  const sections = useMemo(() => (lesson?.content?.sections && Array.isArray(lesson.content.sections) ? lesson.content.sections : []), [lesson])
  const completedSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds])
  const done = lesson?.id ? completedSet.has(lesson.id) : false

  const { prevId, nextId } = useMemo(() => {
    const idx = sequence.findIndex((id) => String(id) === String(lessonId))
    return {
      prevId: idx > 0 ? sequence[idx - 1] : '',
      nextId: idx >= 0 && idx < sequence.length - 1 ? sequence[idx + 1] : '',
    }
  }, [lessonId, sequence])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [l, e, completions, mods] = await Promise.all([
        getLesson(lessonId),
        listMyEnrollments(),
        listMyLessonCompletionsForCourse(courseId),
        listModules(courseId),
      ])
      // Ensure lesson belongs to the course in URL
      if (String(l?.modules?.course_id) !== String(courseId)) {
        throw new Error('Lesson not found for this course.')
      }
      setLesson(l)
      try {
        const fs = await listLessonFiles(lessonId)
        setFiles(
          (fs || []).map((f) => ({
            ...f,
            download_url: f.file_url || (f.path ? getPublicAssetUrl({ bucket: f.bucket || 'public', path: f.path }) : ''),
          }))
        )
      } catch {
        setFiles([])
      }

      try {
        const as = await listAssignments(lessonId)
        setAssignments(as || [])
      } catch {
        setAssignments([])
      }

      try {
        const qs = await listQuizQuestions(lessonId)
        setQuiz(qs || [])
        setAnswers({})
        setQuizResult(null)
        const at = await listMyQuizAttempts(lessonId, { limit: 10 })
        setAttempts(at || [])
      } catch {
        setQuiz([])
        setAttempts([])
      }
      const isEnrolled = (e || []).some((x) => String(x.course_id) === String(courseId))
      setEnrolled(isEnrolled)

      setCompletedLessonIds((completions || []).map((c) => c.lesson_id))

      // Build the ordered lesson sequence (module position, then lesson position)
      const lessonsMap = {}
      await Promise.all(
        (mods || []).map(async (m) => {
          lessonsMap[m.id] = await listLessons(m.id)
        })
      )
      const ordered = []
      ;(mods || []).forEach((m) => {
        ;(lessonsMap[m.id] || []).forEach((ls) => ordered.push(ls.id))
      })
      setSequence(ordered)
    } catch (err) {
      setError(err?.message || 'Unable to load lesson.')
    } finally {
      setLoading(false)
    }
  }, [courseId, lessonId])

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [refresh])

  return (
    <main id="page-main" data-component="page-main" className="mx-auto max-w-4xl px-8 pb-20 pt-28 md:px-12 lg:px-10">
      {loading ? (
        <div className="grid gap-4">
          <div className="animate-pulse rounded-[28px] border border-zinc-200 bg-zinc-100/70 p-10 dark:border-zinc-800 dark:bg-zinc-900/40" />
          <div className="animate-pulse rounded-[28px] border border-zinc-200 bg-zinc-100/70 p-10 dark:border-zinc-800 dark:bg-zinc-900/40" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : lesson ? (
        <div className="space-y-6">
          <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="relative p-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
              <div className="relative">
            <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Lesson</p>
            <h1 className="mt-3 text-3xl font-semibold md:text-4xl">{lesson.title}</h1>
            {lesson.description ? (
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{lesson.description}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to={`/member/courses/${courseId}`}
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
              >
                Back to course
              </Link>
              {prevId ? (
                <Link
                  to={`/member/courses/${courseId}/lessons/${prevId}`}
                  className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  ← Previous
                </Link>
              ) : null}
              {nextId ? (
                <Link
                  to={`/member/courses/${courseId}/lessons/${nextId}`}
                  className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Next →
                </Link>
              ) : null}
              <button
                type="button"
                disabled
                className={[
                  'rounded-full px-5 py-2 text-sm font-semibold',
                  done
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200',
                ].join(' ')}
              >
                {done ? 'Completed' : 'Not completed'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/member')}
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                Dashboard
              </button>
            </div>
            {!enrolled ? (
              <p className="mt-4 text-sm text-rose-700 dark:text-rose-200">
                You are not enrolled in this course.
              </p>
            ) : null}
              </div>
            </div>
          </header>

          <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            {sections.length ? (
              <div className="space-y-4">
                {sections.map((b, idx) => (
                  <Block key={idx} block={b} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-300">No lesson content yet.</p>
            )}
          </section>

          {files.length ? (
            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Materials</p>
              <h2 className="mt-2 text-xl font-semibold">Downloads</h2>
              <div className="mt-4 space-y-2">
                {files.map((f) => (
                  <div key={f.id} className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{f.title || 'Attachment'}</p>
                      <p className="mt-1 text-xs text-zinc-500">{f.file_type || 'file'}{f.mime_type ? ` • ${f.mime_type}` : ''}</p>
                    </div>
                    {f.download_url ? (
                      <a
                        href={f.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex justify-center rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400"
                      >
                        Download
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {assignments.length ? (
            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Assignments</p>
              <h2 className="mt-2 text-xl font-semibold">Practice</h2>
              <div className="mt-4 space-y-3">
                {assignments.map((a) => (
                  <div key={a.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{a.title}</p>
                    {a.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{a.description}</p> : null}
                    {a.download_url ? (
                      <a
                        href={a.download_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400"
                      >
                        Download assignment
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {quiz.length ? (
            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Quiz</p>
              <h2 className="mt-2 text-xl font-semibold">Check your understanding</h2>
              {attempts.length ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {(() => {
                    const best = Math.max(...attempts.map((a) => Number(a.score || 0)))
                    const total = Math.max(...attempts.map((a) => Number(a.total || 0)))
                    const pct = total ? Math.round((best * 100) / total) : 0
                    const passed = pct >= 70
                    return (
                      <>
                        <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
                          Best: {best}/{total} ({pct}%)
                        </span>
                        <span
                          className={[
                            'rounded-full px-3 py-1 text-xs font-semibold',
                            passed
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                              : 'border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200',
                          ].join(' ')}
                        >
                          {passed ? 'Passed' : 'In progress'}
                        </span>
                        <span className="text-xs text-zinc-500">Attempts: {attempts.length}</span>
                      </>
                    )
                  })()}
                </div>
              ) : null}
              {quizResult ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                  Score: <span className="font-semibold">{quizResult.score}</span> / {quizResult.total}
                </div>
              ) : null}
              {(() => {
                const total = quiz.length
                const answered = Object.keys(answers || {}).length
                const allAnswered = total > 0 && answered >= total
                if (allAnswered) return null
                return (
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
                    Answer all questions to enable submit. ({answered}/{total})
                  </p>
                )
              })()}
              <div className="mt-4 space-y-4">
                {quiz.map((q, idx) => (
                  <div key={q.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Question {idx + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">{q.question}</p>
                    <div className="mt-3 grid gap-2">
                      {(q.options || []).map((o) => {
                        const picked = answers[q.id] === o
                        return (
                          <button
                            key={o}
                            type="button"
                            disabled={quizBusy}
                            onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o }))}
                            className={[
                              'rounded-xl border px-4 py-2 text-left text-sm font-semibold transition disabled:opacity-60',
                              picked
                                ? 'border-orange-400 bg-orange-50 text-orange-700 dark:border-orange-500/60 dark:bg-orange-950/25 dark:text-orange-200'
                                : 'border-zinc-200 bg-white text-zinc-800 hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200',
                            ].join(' ')}
                          >
                            {o}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={(() => {
                    const total = quiz.length
                    const answered = Object.keys(answers || {}).length
                    return quizBusy || !enrolled || total === 0 || answered < total
                  })()}
                  onClick={async () => {
                    setQuizBusy(true)
                    setError('')
                    try {
                      const res = await submitQuizAttempt({ lessonId, answersByQuestionId: answers })
                      setQuizResult({ score: res.score, total: res.total })
                      const at = await listMyQuizAttempts(lessonId, { limit: 10 })
                      setAttempts(at || [])
                    } catch (err) {
                      setError(err?.message || 'Unable to submit quiz.')
                    } finally {
                      setQuizBusy(false)
                    }
                  }}
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {quizBusy ? 'Submitting…' : 'Submit quiz'}
                </button>
                <button
                  type="button"
                  disabled={quizBusy}
                  onClick={() => {
                    setAnswers({})
                    setQuizResult(null)
                  }}
                  className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
                >
                  Reset
                </button>
                {!enrolled ? <p className="text-sm text-zinc-600 dark:text-zinc-300">Enroll to submit the quiz.</p> : null}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  )
}

