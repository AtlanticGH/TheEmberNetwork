import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function NavItem({ to, end, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={!!end}
      onClick={() => onNavigate?.()}
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

export function MemberLayout() {
  const { user, profile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const nav = ({ onNavigate } = {}) => (
    <div className="grid gap-2">
      <NavItem to="/member" end onNavigate={onNavigate}>
        Overview
      </NavItem>
      <NavItem to="/member/courses" onNavigate={onNavigate}>
        Courses
      </NavItem>
      <NavItem to="/member/profile" onNavigate={onNavigate}>
        Profile
      </NavItem>
      <NavItem to="/member/activity" onNavigate={onNavigate}>
        Activity
      </NavItem>
    </div>
  )

  return (
    <main id="page-main" data-component="page-main" className="mx-auto max-w-7xl px-8 pb-20 pt-28 md:px-12 lg:px-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Member</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{profile?.full_name || 'Member'}</p>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/"
            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200"
          >
            Site
          </Link>
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 lg:hidden dark:border-zinc-700 dark:text-zinc-200"
            onClick={() => setMenuOpen(true)}
          >
            Menu
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Navigation</p>
            <div className="mt-4">{nav()}</div>
          </div>
        </aside>

        <section className="min-w-0">
          <Outlet />
        </section>
      </div>

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-black/60 px-4 py-8 lg:hidden"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setMenuOpen(false)
          }}
        >
          <div className="mx-auto w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Member</p>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                Close
              </button>
            </div>
            <div className="mt-2 px-2 pb-2">{nav({ onNavigate: () => setMenuOpen(false) })}</div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
