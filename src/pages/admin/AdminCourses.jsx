import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createCourse, deleteCourse, listAdminCourses, updateCourse } from '../../services/adminCourses'

export function AdminCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [busyId, setBusyId] = useState('')

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: '',
    thumbnail_url: '',
    category: '',
    difficulty: 'beginner',
    published: true,
  })

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAdminCourses()
      setItems(data)
    } catch (err) {
      setError(err?.message || 'Unable to load courses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(() => refresh())
  }, [])

  const canCreate = useMemo(() => !!form.title.trim(), [form.title])
  const update = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Courses</p>
          <h2 className="mt-2 text-2xl font-semibold">Manage courses</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Create and maintain learning tracks.</p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          className="h-fit rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Create new course</p>
          <form
            className="mt-4 space-y-3"
            onSubmit={async (e) => {
              e.preventDefault()
              setError('')
              if (!canCreate) return
              setBusyId('create')
              try {
                await createCourse({
                  title: form.title.trim(),
                  description: form.description.trim(),
                  instructor: form.instructor.trim(),
                  duration: form.duration.trim(),
                  thumbnail_url: form.thumbnail_url.trim() || null,
                  category: form.category.trim() || null,
                  difficulty: form.difficulty || null,
                  published: !!form.published,
                })
                setForm({ title: '', description: '', instructor: '', duration: '', thumbnail_url: '', category: '', difficulty: 'beginner', published: true })
                await refresh()
              } catch (err) {
                setError(err?.message || 'Unable to create course.')
              } finally {
                setBusyId('')
              }
            }}
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Title *</span>
              <input
                value={form.title}
                onChange={update('title')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Course title"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={form.description}
                onChange={update('description')}
                className="mt-2 min-h-24 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="What will members learn?"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Instructor</span>
                <input
                  value={form.instructor}
                  onChange={update('instructor')}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="The Ember Network"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Duration</span>
                <input
                  value={form.duration}
                  onChange={update('duration')}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="4 weeks"
                />
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Category</span>
                <input
                  value={form.category}
                  onChange={update('category')}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Startup basics"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Difficulty</span>
                <select
                  value={form.difficulty}
                  onChange={update('difficulty')}
                  className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                >
                  <option value="beginner">beginner</option>
                  <option value="intermediate">intermediate</option>
                  <option value="advanced">advanced</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Thumbnail URL</span>
              <input
                value={form.thumbnail_url}
                onChange={update('thumbnail_url')}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="https://…"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
              <input type="checkbox" checked={form.published} onChange={update('published')} />
              Published
            </label>
            <button
              type="submit"
              disabled={!canCreate || busyId === 'create'}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
            >
              {busyId === 'create' ? 'Creating…' : 'Create course'}
            </button>
          </form>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Existing courses</p>
          {loading ? (
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading…</p>
          ) : items.length ? (
            <div className="mt-4 space-y-3">
              {items.map((c) => (
                <CourseRow
                  key={c.id}
                  course={c}
                  busy={busyId === c.id}
                  onBusy={(v) => setBusyId(v)}
                  onError={(msg) => setError(msg)}
                  onRefresh={refresh}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
              No courses yet.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CourseRow({ course, busy, onBusy, onError, onRefresh }) {
  const [editing, setEditing] = useState(false)
  const [local, setLocal] = useState({
    title: course.title || '',
    description: course.description || '',
    instructor: course.instructor || '',
    duration: course.duration || '',
    thumbnail_url: course.thumbnail_url || '',
    category: course.category || '',
    difficulty: course.difficulty || 'beginner',
    published: !!course.published,
  })

  const update = (k) => (e) => setLocal((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="space-y-3">
              <input
                value={local.title}
                onChange={update('title')}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
              <textarea
                value={local.description}
                onChange={update('description')}
                className="min-h-20 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={local.instructor}
                  onChange={update('instructor')}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Instructor"
                />
                <input
                  value={local.duration}
                  onChange={update('duration')}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Duration"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={local.category}
                  onChange={update('category')}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                  placeholder="Category"
                />
                <select
                  value={local.difficulty}
                  onChange={update('difficulty')}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                >
                  <option value="beginner">beginner</option>
                  <option value="intermediate">intermediate</option>
                  <option value="advanced">advanced</option>
                </select>
              </div>
              <input
                value={local.thumbnail_url}
                onChange={update('thumbnail_url')}
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/30"
                placeholder="Thumbnail URL"
              />
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                <input type="checkbox" checked={local.published} onChange={update('published')} />
                Published
              </label>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold">{course.title}</p>
              {course.description ? <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{course.description}</p> : null}
              <p className="mt-2 text-xs text-zinc-500">
                {course.published ? 'Published' : 'Draft'}{course.instructor ? ` • ${course.instructor}` : ''}{course.duration ? ` • ${course.duration}` : ''}
              </p>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {editing ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  onError('')
                  onBusy(course.id)
                  try {
                    await updateCourse(course.id, {
                      title: local.title.trim(),
                      description: local.description.trim(),
                      instructor: local.instructor.trim(),
                      duration: local.duration.trim(),
                      thumbnail_url: local.thumbnail_url.trim() || null,
                      category: local.category.trim() || null,
                      difficulty: local.difficulty || null,
                      published: !!local.published,
                    })
                    setEditing(false)
                    await onRefresh()
                  } catch (err) {
                    onError(err?.message || 'Unable to update course.')
                  } finally {
                    onBusy('')
                  }
                }}
                className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
              >
                {busy ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setLocal({
                    title: course.title || '',
                    description: course.description || '',
                    instructor: course.instructor || '',
                    duration: course.duration || '',
                    thumbnail_url: course.thumbnail_url || '',
                    category: course.category || '',
                    difficulty: course.difficulty || 'beginner',
                    published: !!course.published,
                  })
                  setEditing(false)
                }}
                className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <Link
                to={`/admin/courses/${course.id}`}
                className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-400"
              >
                Builder
              </Link>
              <button
                type="button"
                disabled={busy}
                onClick={() => setEditing(true)}
                className="rounded-full border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!confirm('Delete this course? This will remove associated modules/lessons.')) return
                  onError('')
                  onBusy(course.id)
                  try {
                    await deleteCourse(course.id)
                    await onRefresh()
                  } catch (err) {
                    onError(err?.message || 'Unable to delete course.')
                  } finally {
                    onBusy('')
                  }
                }}
                className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

