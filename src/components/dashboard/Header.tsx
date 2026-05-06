type HeaderProps = {
  avatarUrl: string
  name: string
  email: string
  onLogout: () => Promise<void> | void
  onOpenSidebar: () => void
}

function Avatar({ avatarUrl, fallback }: { avatarUrl: string; fallback: string }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt="Avatar" className="h-10 w-10 rounded-full object-cover ring-2 ring-orange-200 dark:ring-orange-900/40" />
  }
  return (
    <div className="grid h-10 w-10 place-content-center rounded-full bg-gradient-to-br from-orange-500 via-amber-400 to-orange-600 text-xs font-bold text-white shadow-glow ring-2 ring-white/60 dark:ring-zinc-950/60">
      {fallback}
    </div>
  )
}

export function Header({ avatarUrl, name, email, onLogout, onOpenSidebar }: HeaderProps) {
  const fallback = String(name || email || 'U')
    .trim()
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="relative p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3 md:hidden">
            <button
              type="button"
              onClick={onOpenSidebar}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-200"
            >
              Menu
            </button>
            <button
              type="button"
              onClick={() => onLogout()}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Logout
            </button>
          </div>

          <div className="flex items-center gap-4">
            <Avatar avatarUrl={avatarUrl} fallback={fallback} />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Dashboard</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-3xl">
                Welcome, {name || 'Member'}
              </h1>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{email}</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => onLogout()}
              className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-700 transition hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

