import { NavLink } from 'react-router-dom'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
          isActive
            ? 'border-orange-400 bg-orange-50 text-orange-800 dark:border-orange-500/50 dark:bg-orange-950/30 dark:text-orange-200'
            : 'border-zinc-200 bg-white text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-200',
        ].join(' ')
      }
    >
      {children}
    </NavLink>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const content = (
    <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Workspace</p>
          <p className="mt-2 text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            The <span className="text-orange-500">Ember Network</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">Dashboard</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-600 dark:border-zinc-700 dark:text-zinc-200"
        >
          Close
        </button>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Navigation</p>
        <div className="mt-4 grid gap-2">
          <NavItem to="/dashboard">Dashboard</NavItem>
          <NavItem to="/member/profile">Profile</NavItem>
          <NavItem to="/dashboard">Teams</NavItem>
          <NavItem to="/admin/dashboard">Settings</NavItem>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24">{content}</div>
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-[90] bg-black/60 px-4 py-8 lg:hidden"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <div className="mx-auto w-full max-w-md">{content}</div>
        </div>
      ) : null}
    </>
  )
}

