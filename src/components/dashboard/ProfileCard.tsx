import { Link } from 'react-router-dom'

export function ProfileCard({
  avatarUrl,
  username,
  fullName,
  email,
  role,
}: {
  avatarUrl: string
  username: string
  fullName: string
  email: string
  role: string
}) {
  const title = username ? `@${username}` : fullName || 'Profile'

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Profile</p>
          <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Update your username and avatar to personalize your workspace.</p>
        </div>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="h-14 w-14 rounded-full object-cover ring-2 ring-orange-200 dark:ring-orange-900/40" />
        ) : (
          <div className="grid h-14 w-14 place-content-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
            {String(title || email || 'U').slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Email</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{email || '—'}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/40">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">Role</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{role}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/member/profile"
          className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-orange-400 active:scale-[0.99]"
        >
          Edit profile
        </Link>
        <Link
          to="/member"
          className="inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
        >
          Member area
        </Link>
      </div>
    </section>
  )
}

