import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Dialog } from '../../components/ui/Dialog'
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  getAdminCourse,
  listCourseModules,
  listModuleLessons,
  publishLesson,
  reorderLessons,
  reorderModules,
  unpublishLesson,
  updateLesson,
  updateModule,
} from '../../services/adminCourseBuilder'
import { getPublicAssetUrl, listMediaAssets } from '../../services/mediaAssets'
import { deleteLessonFile, listLessonFiles, uploadLessonFile } from '../../services/lessonFiles'
import { createAssignment, deleteAssignment, listAssignments } from '../../services/assignments'
import { createQuizQuestion, deleteQuizQuestion, listQuizQuestions } from '../../services/quizzes'
import { adminMarkComplete, adminMarkIncomplete } from '../../services/adminProgress'
import { supabase } from '@/lib/supabaseClient'

function IconButton({ children, ...props }) {
  return (
    <button
      type="button"
      className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminCourseEditorPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [lessonsByModule, setLessonsByModule] = useState({})
  const [busy, setBusy] = useState('')

  const [moduleForm, setModuleForm] = useState({ title: '', description: '' })

  const [contentLesson, setContentLesson] = useState(null)
  const [sectionsDraft, setSectionsDraft] = useState([])
  const [assetQuery, setAssetQuery] = useState('')
  const [assets, setAssets] = useState([])

  const [filesLesson, setFilesLesson] = useState(null)
  const [files, setFiles] = useState([])
  const [fileTitle, setFileTitle] = useState('')
  const [fileObj, setFileObj] = useState(null)

  const [assignmentLesson, setAssignmentLesson] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', file: null })

  const [quizLesson, setQuizLesson] = useState(null)
  const [quizItems, setQuizItems] = useState([])
  const [quizForm, setQuizForm] = useState({ question: '', optionsText: '', correctAnswer: '' })

  const [progressOpen, setProgressOpen] = useState(false)
  const [progressType, setProgressType] = useState('lesson') // lesson | module | course
  const [progressTargetId, setProgressTargetId] = useState('')
  const [progressTargetTitle, setProgressTargetTitle] = useState('')
  const [targetUserEmail, setTargetUserEmail] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [c, ms] = await Promise.all([getAdminCourse(courseId), listCourseModules(courseId)])
      setCourse(c)
      setModules(ms)
      const lessonPairs = await Promise.all(ms.map(async (m) => [m.id, await listModuleLessons(m.id)]))
      const map = {}
      lessonPairs.forEach(([id, ls]) => {
        map[id] = ls
      })
      setLessonsByModule(map)
    } catch (err) {
      setError(err?.message || 'Unable to load course builder.')
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [refresh])

  const totalLessons = useMemo(() => Object.values(lessonsByModule).reduce((acc, ls) => acc + (ls?.length || 0), 0), [lessonsByModule])
  const filteredAssets = useMemo(() => {
    const q = assetQuery.trim().toLowerCase()
    if (!q) return assets
    return assets.filter((a) => String(a.title || a.path || '').toLowerCase().includes(q))
  }, [assets, assetQuery])

  if (loading) return <p className="text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
  if (error) return <p className="text-sm text-rose-700 dark:text-rose-200">{error}</p>
  if (!course) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Course Builder</p>
          <h2 className="mt-2 text-2xl font-semibold">{course.title}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            {modules.length} modules • {totalLessons} lessons • {course.published ? 'Published' : 'Draft'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/courses"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
          >
            Back to courses
          </Link>
          <button
            type="button"
            onClick={() => {
              setProgressType('course')
              setProgressTargetId(course.id)
              setProgressTargetTitle(course.title)
              setTargetUserEmail('')
              setProgressOpen(true)
            }}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
          >
            Progress
          </button>
          <button
            type="button"
            onClick={() => navigate(`/member/courses/${course.id}`)}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400"
          >
            View as member
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Add module</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              if (!moduleForm.title.trim()) return
              setBusy('module:create')
              try {
                await createModule({ course_id: course.id, title: moduleForm.title.trim(), description: moduleForm.description.trim() })
                setModuleForm({ title: '', description: '' })
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create module.')
              } finally {
                setBusy('')
              }
            }}
          >
            <input
              value={moduleForm.title}
              onChange={(e) => setModuleForm((v) => ({ ...v, title: e.target.value }))}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              placeholder="Module title"
            />
            <textarea
              value={moduleForm.description}
              onChange={(e) => setModuleForm((v) => ({ ...v, description: e.target.value }))}
              className="min-h-20 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              placeholder="Module description (optional)"
            />
            <button
              type="submit"
              disabled={busy === 'module:create'}
              className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:opacity-60"
            >
              {busy === 'module:create' ? 'Creating…' : 'Create module'}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {modules.length ? (
            modules.map((m, idx) => (
              <ModuleCard
                key={m.id}
                module={m}
                lessons={lessonsByModule[m.id] || []}
                busy={busy}
                onBusy={setBusy}
                onError={setError}
                onRefresh={refresh}
                onEditLessonContent={async (lesson) => {
                  setError('')
                  setContentLesson(lesson)
                  setSectionsDraft(Array.isArray(lesson?.content?.sections) ? lesson.content.sections : [])
                  setAssetQuery('')
                  try {
                    const data = await listMediaAssets({ limit: 100 })
                    setAssets(data)
                  } catch {
                    setAssets([])
                  }
                }}
                onEditLessonFiles={async (lesson) => {
                  setError('')
                  setFilesLesson(lesson)
                  setFileTitle('')
                  setFileObj(null)
                  try {
                    const data = await listLessonFiles(lesson.id)
                    setFiles(data)
                  } catch (err) {
                    setFiles([])
                    setError(err?.message || 'Unable to load lesson files.')
                  }
                }}
                onEditLessonAssignments={async (lesson) => {
                  setError('')
                  setAssignmentLesson(lesson)
                  setAssignmentForm({ title: '', description: '', file: null })
                  try {
                    const data = await listAssignments(lesson.id)
                    setAssignments(data)
                  } catch (err) {
                    setAssignments([])
                    setError(err?.message || 'Unable to load assignments.')
                  }
                }}
                onEditLessonQuiz={async (lesson) => {
                  setError('')
                  setQuizLesson(lesson)
                  setQuizForm({ question: '', optionsText: '', correctAnswer: '' })
                  try {
                    const data = await listQuizQuestions(lesson.id)
                    setQuizItems(data)
                  } catch (err) {
                    setQuizItems([])
                    setError(err?.message || 'Unable to load quiz.')
                  }
                }}
                onOpenProgress={({ type, id, title }) => {
                  setProgressType(type)
                  setProgressTargetId(id)
                  setProgressTargetTitle(title || '')
                  setTargetUserEmail('')
                  setProgressOpen(true)
                }}
                onMove={async (dir) => {
                  const next = modules.slice()
                  const i = idx
                  const j = dir === 'up' ? i - 1 : i + 1
                  if (j < 0 || j >= next.length) return
                  ;[next[i], next[j]] = [next[j], next[i]]
                  setBusy('modules:reorder')
                  try {
                    await reorderModules(course.id, next.map((x) => x.id))
                    await refresh()
                  } catch (err) {
                    setError(err?.message || 'Unable to reorder modules.')
                  } finally {
                    setBusy('')
                  }
                }}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300">
              No modules yet. Create your first module to start building lessons.
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={!!contentLesson}
        onClose={() => setContentLesson(null)}
        title={contentLesson ? `Lesson content: ${contentLesson.title}` : 'Lesson content'}
        footer={
          contentLesson ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">
                Blocks: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{sectionsDraft.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSectionsDraft((v) => v.concat({ type: 'text', value: '' }))}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  + Text
                </button>
                <button
                  type="button"
                  onClick={() => setSectionsDraft((v) => v.concat({ type: 'task', value: '' }))}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  + Task
                </button>
                <button
                  type="button"
                  onClick={() => setSectionsDraft((v) => v.concat({ type: 'heading', value: '' }))}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  + Heading
                </button>
                <button
                  type="button"
                  disabled={busy === `lesson:content:${contentLesson.id}`}
                  onClick={async () => {
                    setBusy(`lesson:content:${contentLesson.id}`)
                    setError('')
                    try {
                      await updateLesson(contentLesson.id, { content: { sections: sectionsDraft } })
                      await refresh()
                      setContentLesson(null)
                    } catch (err) {
                      setError(err?.message || 'Unable to save lesson content.')
                    } finally {
                      setBusy('')
                    }
                  }}
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {busy === `lesson:content:${contentLesson.id}` ? 'Saving…' : 'Save content'}
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {contentLesson ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-3">
              {sectionsDraft.length ? (
                sectionsDraft.map((s, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{s.type || 'block'}</span>
                        <select
                          value={s.type || 'text'}
                          onChange={(e) =>
                            setSectionsDraft((v) =>
                              v.map((x, i) => (i === idx ? { ...x, type: e.target.value } : x))
                            )
                          }
                          className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-200"
                        >
                          <option value="heading">heading</option>
                          <option value="text">text</option>
                          <option value="task">task</option>
                          <option value="resource">resource</option>
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <IconButton
                          disabled={idx === 0}
                          onClick={() =>
                            setSectionsDraft((v) => {
                              const next = v.slice()
                              ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
                              return next
                            })
                          }
                        >
                          ↑
                        </IconButton>
                        <IconButton
                          disabled={idx === sectionsDraft.length - 1}
                          onClick={() =>
                            setSectionsDraft((v) => {
                              const next = v.slice()
                              ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
                              return next
                            })
                          }
                        >
                          ↓
                        </IconButton>
                        <button
                          type="button"
                          onClick={() => setSectionsDraft((v) => v.filter((_, i) => i !== idx))}
                          className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {s.type === 'resource' ? (
                      <div className="mt-3 space-y-2">
                        <input
                          value={s.title || ''}
                          onChange={(e) =>
                            setSectionsDraft((v) => v.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                          }
                          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                          placeholder="Resource title"
                        />
                        <input
                          value={s.url || ''}
                          onChange={(e) =>
                            setSectionsDraft((v) => v.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))
                          }
                          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                          placeholder="https://..."
                        />
                      </div>
                    ) : (
                      <textarea
                        value={s.value || ''}
                        onChange={(e) =>
                          setSectionsDraft((v) => v.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x)))
                        }
                        className="mt-3 min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                        placeholder="Write content…"
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                  No blocks yet. Add Text/Task/Heading from the footer buttons.
                </div>
              )}
            </div>

            <aside className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Attach media as resource</p>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Pick an asset and it will insert a <span className="font-semibold">resource</span> block.
              </p>
              <input
                value={assetQuery}
                onChange={(e) => setAssetQuery(e.target.value)}
                className="mt-4 h-10 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Search uploaded media…"
              />
              <div className="mt-4 max-h-[40vh] space-y-2 overflow-auto pr-1">
                {filteredAssets.map((a) => {
                  const url = getPublicAssetUrl({ bucket: a.bucket, path: a.path })
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() =>
                        setSectionsDraft((v) =>
                          v.concat({
                            type: 'resource',
                            title: a.title || a.path,
                            url,
                            asset_id: a.id,
                            bucket: a.bucket,
                            path: a.path,
                          })
                        )
                      }
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-left text-sm hover:border-orange-400 dark:border-zinc-800 dark:bg-zinc-950/40"
                    >
                      <p className="font-semibold line-clamp-1">{a.title || a.path}</p>
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{a.path}</p>
                    </button>
                  )
                })}
                {!filteredAssets.length ? (
                  <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                    No media found. Upload assets in <Link className="text-orange-600 hover:underline dark:text-orange-300" to="/admin/media">Media</Link>.
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={!!filesLesson}
        onClose={() => setFilesLesson(null)}
        title={filesLesson ? `Lesson materials: ${filesLesson.title}` : 'Lesson materials'}
        footer={
          filesLesson ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">
                Files: <span className="font-semibold text-zinc-700 dark:text-zinc-200">{files.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy === `lesson:files:${filesLesson.id}` || !fileObj}
                  onClick={async () => {
                    if (!fileObj) return
                    setBusy(`lesson:files:${filesLesson.id}`)
                    setError('')
                    try {
                      await uploadLessonFile({ lessonId: filesLesson.id, title: fileTitle, file: fileObj })
                      const data = await listLessonFiles(filesLesson.id)
                      setFiles(data)
                      setFileTitle('')
                      setFileObj(null)
                    } catch (err) {
                      setError(err?.message || 'Unable to upload file.')
                    } finally {
                      setBusy('')
                    }
                  }}
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {busy === `lesson:files:${filesLesson.id}` ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </div>
          ) : null
        }
      >
        {filesLesson ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[1fr_1.2fr]">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">File title (optional)</label>
                <input
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="e.g., Workbook PDF"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Upload file</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,application/pdf"
                  onChange={(e) => setFileObj(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-sm"
                />
                {fileObj ? <p className="mt-2 text-xs text-zinc-500">Selected: {fileObj.name}</p> : null}
              </div>
            </div>

            {files.length ? (
              <div className="space-y-2">
                {files.map((f) => (
                  <div key={f.id} className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/30 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{f.title || f.path}</p>
                      <p className="mt-1 text-xs text-zinc-500">{f.file_type || 'file'}{f.mime_type ? ` • ${f.mime_type}` : ''}{f.size_bytes ? ` • ${(f.size_bytes / (1024 * 1024)).toFixed(1)}MB` : ''}</p>
                      {f.download_url ? (
                        <a className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300" href={f.download_url} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm('Delete this file?')) return
                        setBusy(`lesson:file:delete:${f.id}`)
                        setError('')
                        try {
                          await deleteLessonFile(f)
                          const data = await listLessonFiles(filesLesson.id)
                          setFiles(data)
                        } catch (err) {
                          setError(err?.message || 'Unable to delete file.')
                        } finally {
                          setBusy('')
                        }
                      }}
                      className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                No files yet.
              </div>
            )}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={!!assignmentLesson}
        onClose={() => setAssignmentLesson(null)}
        title={assignmentLesson ? `Assignments: ${assignmentLesson.title}` : 'Assignments'}
        footer={null}
      >
        {assignmentLesson ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Add assignment</p>
              <form
                className="mt-3 grid gap-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!assignmentForm.title.trim()) return
                  setBusy(`lesson:assignment:create:${assignmentLesson.id}`)
                  setError('')
                  try {
                    await createAssignment({
                      lessonId: assignmentLesson.id,
                      title: assignmentForm.title,
                      description: assignmentForm.description,
                      file: assignmentForm.file,
                    })
                    setAssignmentForm({ title: '', description: '', file: null })
                    const data = await listAssignments(assignmentLesson.id)
                    setAssignments(data)
                  } catch (err) {
                    setError(err?.message || 'Unable to create assignment.')
                  } finally {
                    setBusy('')
                  }
                }}
              >
                <input
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm((v) => ({ ...v, title: e.target.value }))}
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Assignment title *"
                />
                <textarea
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm((v) => ({ ...v, description: e.target.value }))}
                  className="min-h-20 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Instructions (optional)"
                />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif,application/pdf"
                  onChange={(e) => setAssignmentForm((v) => ({ ...v, file: e.target.files?.[0] || null }))}
                  className="block w-full text-sm"
                />
                <button
                  type="submit"
                  disabled={busy === `lesson:assignment:create:${assignmentLesson.id}`}
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {busy === `lesson:assignment:create:${assignmentLesson.id}` ? 'Saving…' : 'Add assignment'}
                </button>
              </form>
            </div>

            {assignments.length ? (
              <div className="space-y-2">
                {assignments.map((a) => (
                  <div key={a.id} className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/30 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{a.title}</p>
                      {a.description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap">{a.description}</p> : null}
                      {a.download_url ? (
                        <a className="mt-2 inline-flex text-sm font-semibold text-orange-600 hover:underline dark:text-orange-300" href={a.download_url} target="_blank" rel="noopener noreferrer">
                          Open attachment
                        </a>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={async () => {
                        if (!confirm('Delete this assignment?')) return
                        setBusy(`lesson:assignment:delete:${a.id}`)
                        setError('')
                        try {
                          await deleteAssignment(a)
                          const data = await listAssignments(assignmentLesson.id)
                          setAssignments(data)
                        } catch (err) {
                          setError(err?.message || 'Unable to delete assignment.')
                        } finally {
                          setBusy('')
                        }
                      }}
                      className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                No assignments yet.
              </div>
            )}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={!!quizLesson}
        onClose={() => setQuizLesson(null)}
        title={quizLesson ? `Quiz: ${quizLesson.title}` : 'Quiz'}
        footer={null}
      >
        {quizLesson ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Add question</p>
              <form
                className="mt-3 grid gap-2"
                onSubmit={async (e) => {
                  e.preventDefault()
                  setBusy(`lesson:quiz:create:${quizLesson.id}`)
                  setError('')
                  try {
                    const opts = quizForm.optionsText
                      .split('\n')
                      .map((x) => x.trim())
                      .filter(Boolean)
                    await createQuizQuestion({
                      lessonId: quizLesson.id,
                      question: quizForm.question,
                      options: opts,
                      correctAnswer: quizForm.correctAnswer,
                    })
                    setQuizForm({ question: '', optionsText: '', correctAnswer: '' })
                    const data = await listQuizQuestions(quizLesson.id)
                    setQuizItems(data)
                  } catch (err) {
                    setError(err?.message || 'Unable to create question.')
                  } finally {
                    setBusy('')
                  }
                }}
              >
                <textarea
                  value={quizForm.question}
                  onChange={(e) => setQuizForm((v) => ({ ...v, question: e.target.value }))}
                  className="min-h-20 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Question *"
                />
                <textarea
                  value={quizForm.optionsText}
                  onChange={(e) => setQuizForm((v) => ({ ...v, optionsText: e.target.value }))}
                  className="min-h-24 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder={'Options (one per line)\nOption A\nOption B'}
                />
                <input
                  value={quizForm.correctAnswer}
                  onChange={(e) => setQuizForm((v) => ({ ...v, correctAnswer: e.target.value }))}
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Correct answer (must match one option)"
                />
                <button
                  type="submit"
                  disabled={busy === `lesson:quiz:create:${quizLesson.id}`}
                  className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
                >
                  {busy === `lesson:quiz:create:${quizLesson.id}` ? 'Saving…' : 'Add question'}
                </button>
              </form>
            </div>

            {quizItems.length ? (
              <div className="space-y-2">
                {quizItems.map((q, idx) => (
                  <div key={q.id} className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Question {idx + 1}</p>
                        <p className="mt-1 text-sm font-semibold whitespace-pre-wrap">{q.question}</p>
                        <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-200">
                          {(q.options || []).map((o) => (
                            <li key={o} className={o === q.correct_answer ? 'font-semibold text-emerald-700 dark:text-emerald-200' : ''}>
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          if (!confirm('Delete this question?')) return
                          setBusy(`lesson:quiz:delete:${q.id}`)
                          setError('')
                          try {
                            await deleteQuizQuestion(q)
                            const data = await listQuizQuestions(quizLesson.id)
                            setQuizItems(data)
                          } catch (err) {
                            setError(err?.message || 'Unable to delete question.')
                          } finally {
                            setBusy('')
                          }
                        }}
                        className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                No quiz questions yet.
              </div>
            )}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={progressOpen}
        onClose={() => setProgressOpen(false)}
        title="Mark completion for a member"
        footer={null}
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200">
            Target: <span className="font-semibold">{progressType}</span> •{' '}
            <span className="font-semibold">{progressTargetTitle || progressTargetId || '—'}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Member email</label>
            <input
              value={targetUserEmail}
              onChange={(e) => setTargetUserEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              placeholder="member@example.com"
            />
            <p className="mt-2 text-xs text-zinc-500">Only staff can mark completion. Members can only view status.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {progressType === 'course' ? (
              <button
                type="button"
                disabled={!targetUserEmail.trim() || busy === 'progress:bulk'}
                onClick={async () => {
                  setBusy('progress:bulk')
                  setError('')
                  try {
                    const { data, error: uErr } = await supabase
                      .from('profiles')
                      .select('user_id')
                      .eq('email', targetUserEmail.trim())
                      .maybeSingle()
                    if (uErr) throw uErr
                    if (!data?.user_id) throw new Error('User not found for that email.')

                    // Mark course + all modules + all lessons
                    await adminMarkComplete({ userId: data.user_id, type: 'course', id: progressTargetId })
                    for (const m of modules) {
                      await adminMarkComplete({ userId: data.user_id, type: 'module', id: m.id })
                      const ls = lessonsByModule[m.id] || []
                      for (const l of ls) {
                        await adminMarkComplete({ userId: data.user_id, type: 'lesson', id: l.id })
                      }
                    }
                    setProgressOpen(false)
                  } catch (err) {
                    setError(err?.message || 'Unable to bulk mark course complete.')
                  } finally {
                    setBusy('')
                  }
                }}
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                {busy === 'progress:bulk' ? 'Working…' : 'Mark entire course complete (bulk)'}
              </button>
            ) : null}
            {progressType === 'course' ? (
              <button
                type="button"
                disabled={!targetUserEmail.trim() || busy === 'progress:bulk-incomplete'}
                onClick={async () => {
                  setBusy('progress:bulk-incomplete')
                  setError('')
                  try {
                    const { data, error: uErr } = await supabase
                      .from('profiles')
                      .select('user_id')
                      .eq('email', targetUserEmail.trim())
                      .maybeSingle()
                    if (uErr) throw uErr
                    if (!data?.user_id) throw new Error('User not found for that email.')

                    // Mark course + all modules + all lessons incomplete
                    for (const m of modules) {
                      const ls = lessonsByModule[m.id] || []
                      for (const l of ls) {
                        await adminMarkIncomplete({ userId: data.user_id, type: 'lesson', id: l.id })
                      }
                      await adminMarkIncomplete({ userId: data.user_id, type: 'module', id: m.id })
                    }
                    await adminMarkIncomplete({ userId: data.user_id, type: 'course', id: progressTargetId })
                    setProgressOpen(false)
                  } catch (err) {
                    setError(err?.message || 'Unable to bulk mark course incomplete.')
                  } finally {
                    setBusy('')
                  }
                }}
                className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
              >
                {busy === 'progress:bulk-incomplete' ? 'Working…' : 'Mark entire course incomplete (bulk)'}
              </button>
            ) : null}
            <button
              type="button"
              disabled={!targetUserEmail.trim() || busy === 'progress:complete'}
              onClick={async () => {
                setBusy('progress:complete')
                setError('')
                try {
                  const { data, error: uErr } = await supabase
                    .from('profiles')
                    .select('user_id')
                    .eq('email', targetUserEmail.trim())
                    .maybeSingle()
                  if (uErr) throw uErr
                  if (!data?.user_id) throw new Error('User not found for that email.')
                  await adminMarkComplete({ userId: data.user_id, type: progressType, id: progressTargetId })
                  setProgressOpen(false)
                } catch (err) {
                  setError(err?.message || 'Unable to mark complete.')
                } finally {
                  setBusy('')
                }
              }}
              className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
            >
              {busy === 'progress:complete' ? 'Saving…' : 'Mark complete'}
            </button>
            <button
              type="button"
              disabled={!targetUserEmail.trim() || busy === 'progress:incomplete'}
              onClick={async () => {
                setBusy('progress:incomplete')
                setError('')
                try {
                  const { data, error: uErr } = await supabase
                    .from('profiles')
                    .select('user_id')
                    .eq('email', targetUserEmail.trim())
                    .maybeSingle()
                  if (uErr) throw uErr
                  if (!data?.user_id) throw new Error('User not found for that email.')
                  await adminMarkIncomplete({ userId: data.user_id, type: progressType, id: progressTargetId })
                  setProgressOpen(false)
                } catch (err) {
                  setError(err?.message || 'Unable to mark incomplete.')
                } finally {
                  setBusy('')
                }
              }}
              className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
            >
              {busy === 'progress:incomplete' ? 'Saving…' : 'Mark incomplete'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

function ModuleCard({ module, lessons, busy, onBusy, onError, onRefresh, onMove, onEditLessonContent, onEditLessonFiles, onEditLessonAssignments, onEditLessonQuiz, onOpenProgress }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ title: module.title || '', description: module.description || '' })
  const [lessonForm, setLessonForm] = useState({ title: '', description: '' })

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-3">
              <input
                value={local.title}
                onChange={(e) => setLocal((v) => ({ ...v, title: e.target.value }))}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
              <textarea
                value={local.description}
                onChange={(e) => setLocal((v) => ({ ...v, description: e.target.value }))}
                className="min-h-20 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.14em] text-orange-500">Module {module.position}</p>
              <h3 className="mt-1 text-lg font-semibold">{module.title}</h3>
              {module.description ? <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{module.description}</p> : null}
              <p className="mt-2 text-xs text-zinc-500">{lessons.length} lessons</p>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <IconButton disabled={busy} onClick={() => onMove('up')} aria-label="Move module up">
            ↑
          </IconButton>
          <IconButton disabled={busy} onClick={() => onMove('down')} aria-label="Move module down">
            ↓
          </IconButton>
          {editing ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  onError('')
                  onBusy(`module:save:${module.id}`)
                  try {
                    await updateModule(module.id, { title: local.title.trim(), description: local.description.trim() })
                    setEditing(false)
                    await onRefresh()
                  } catch (err) {
                    onError(err?.message || 'Unable to save module.')
                  } finally {
                    onBusy('')
                  }
                }}
                className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
              >
                Save
              </button>
              <IconButton
                disabled={busy}
                onClick={() => {
                  setLocal({ title: module.title || '', description: module.description || '' })
                  setEditing(false)
                }}
              >
                Cancel
              </IconButton>
            </>
          ) : (
            <>
              <IconButton disabled={busy} onClick={() => setEditing(true)}>
                Edit
              </IconButton>
              <IconButton
                disabled={busy}
                onClick={() => onOpenProgress?.({ type: 'module', id: module.id, title: `Module ${module.position}: ${module.title}` })}
              >
                Progress
              </IconButton>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!confirm('Delete this module? All lessons inside it will be deleted.')) return
                  onError('')
                  onBusy(`module:delete:${module.id}`)
                  try {
                    await deleteModule(module.id)
                    await onRefresh()
                  } catch (err) {
                    onError(err?.message || 'Unable to delete module.')
                  } finally {
                    onBusy('')
                  }
                }}
                className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Add lesson</p>
        <form
          className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={async (e) => {
            e.preventDefault()
            onError('')
            if (!lessonForm.title.trim()) return
            onBusy(`lesson:create:${module.id}`)
            try {
              await createLesson({ module_id: module.id, title: lessonForm.title.trim(), description: lessonForm.description.trim() })
              setLessonForm({ title: '', description: '' })
              await onRefresh()
            } catch (err) {
              onError(err?.message || 'Unable to create lesson.')
            } finally {
              onBusy('')
            }
          }}
        >
          <input
            value={lessonForm.title}
            onChange={(e) => setLessonForm((v) => ({ ...v, title: e.target.value }))}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
            placeholder="Lesson title"
          />
          <input
            value={lessonForm.description}
            onChange={(e) => setLessonForm((v) => ({ ...v, description: e.target.value }))}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
            placeholder="Short description (optional)"
          />
          <button
            type="submit"
            disabled={busy === `lesson:create:${module.id}`}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
          >
            {busy === `lesson:create:${module.id}` ? 'Adding…' : 'Add'}
          </button>
        </form>
      </div>

      <div className="mt-5 space-y-2">
        {lessons.length ? (
          lessons.map((l, i) => (
            <LessonRow
              key={l.id}
              lesson={l}
              index={i}
              total={lessons.length}
              busy={busy}
              onBusy={onBusy}
              onError={onError}
              onRefresh={onRefresh}
              onEditContent={() => onEditLessonContent?.(l)}
              onEditFiles={() => onEditLessonFiles?.(l)}
              onEditAssignments={() => onEditLessonAssignments?.(l)}
              onEditQuiz={() => onEditLessonQuiz?.(l)}
              onProgress={() => onOpenProgress?.({ type: 'lesson', id: l.id, title: l.title })}
              onMove={async (dir) => {
                const next = lessons.slice()
                const j = dir === 'up' ? i - 1 : i + 1
                if (j < 0 || j >= next.length) return
                ;[next[i], next[j]] = [next[j], next[i]]
                onBusy('lessons:reorder')
                try {
                  await reorderLessons(module.id, next.map((x) => x.id))
                  await onRefresh()
                } catch (err) {
                  onError(err?.message || 'Unable to reorder lessons.')
                } finally {
                  onBusy('')
                }
              }}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            No lessons yet.
          </div>
        )}
      </div>
    </div>
  )
}

function LessonRow({ lesson, busy, onBusy, onError, onRefresh, onMove, onEditContent, onEditFiles, onEditAssignments, onEditQuiz, onProgress }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({ title: lesson.title || '', description: lesson.description || '' })
  const isPublished = lesson.status === 'published'

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950/30 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
          Lesson {lesson.position} • {isPublished ? 'Published' : 'Draft'}
        </p>
        {editing ? (
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <input
              value={local.title}
              onChange={(e) => setLocal((v) => ({ ...v, title: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
            />
            <input
              value={local.description}
              onChange={(e) => setLocal((v) => ({ ...v, description: e.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
            />
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm font-semibold">{lesson.title}</p>
            {lesson.description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{lesson.description}</p> : null}
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <IconButton disabled={busy} onClick={() => onMove('up')} aria-label="Move lesson up">
          ↑
        </IconButton>
        <IconButton disabled={busy} onClick={() => onMove('down')} aria-label="Move lesson down">
          ↓
        </IconButton>
        {editing ? (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                onError('')
                onBusy(`lesson:save:${lesson.id}`)
                try {
                  await updateLesson(lesson.id, { title: local.title.trim(), description: local.description.trim() })
                  setEditing(false)
                  await onRefresh()
                } catch (err) {
                  onError(err?.message || 'Unable to save lesson.')
                } finally {
                  onBusy('')
                }
              }}
              className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
            >
              Save
            </button>
            <IconButton
              disabled={busy}
              onClick={() => {
                setLocal({ title: lesson.title || '', description: lesson.description || '' })
                setEditing(false)
              }}
            >
              Cancel
            </IconButton>
          </>
        ) : (
          <>
            <IconButton disabled={busy} onClick={() => setEditing(true)}>
              Edit
            </IconButton>
            <IconButton disabled={busy} onClick={onEditContent}>
              Content
            </IconButton>
            <IconButton disabled={busy} onClick={onEditFiles}>
              Materials
            </IconButton>
            <IconButton disabled={busy} onClick={onEditAssignments}>
              Assignments
            </IconButton>
            <IconButton disabled={busy} onClick={onEditQuiz}>
              Quiz
            </IconButton>
            <IconButton disabled={busy} onClick={onProgress}>
              Progress
            </IconButton>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                onError('')
                onBusy(`lesson:toggle:${lesson.id}`)
                try {
                  if (isPublished) await unpublishLesson(lesson.id)
                  else await publishLesson(lesson.id)
                  await onRefresh()
                } catch (err) {
                  onError(err?.message || 'Unable to update lesson status.')
                } finally {
                  onBusy('')
                }
              }}
              className={[
                'rounded-full px-4 py-2 text-xs font-semibold text-white disabled:opacity-60',
                isPublished ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-emerald-600 hover:bg-emerald-500',
              ].join(' ')}
            >
              {isPublished ? 'Unpublish' : 'Publish'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                if (!confirm('Delete this lesson?')) return
                onError('')
                onBusy(`lesson:delete:${lesson.id}`)
                try {
                  await deleteLesson(lesson.id)
                  await onRefresh()
                } catch (err) {
                  onError(err?.message || 'Unable to delete lesson.')
                } finally {
                  onBusy('')
                }
              }}
              className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

