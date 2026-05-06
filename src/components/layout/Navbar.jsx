import { useMemo, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { signOut } from '../../services/auth'

function ThemeToggleIcons({ dark }) {
  return (
    <span className="relative inline-flex h-5 w-5 shrink-0" aria-hidden>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={[
          'absolute inset-0 h-5 w-5 transition-all duration-200 ease-out',
          dark ? 'scale-100 rotate-0 opacity-100' : 'pointer-events-none scale-90 -rotate-90 opacity-0',
        ].join(' ')}
      >
        <path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={[
          'absolute inset-0 h-5 w-5 transition-all duration-200 ease-out',
          dark ? 'pointer-events-none scale-90 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
        ].join(' ')}
      >
        <path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752a9.753 9.753 0 0 0-4.497 4.497 9.72 9.72 0 0 0-2.25 12.003A9.744 9.744 0 0 0 12 21.75c2.305 0 4.408-.867 6-2.292Z" />
      </svg>
    </span>
  )
}

export function Navbar({ dark, mode = 'scrolled', onToggleTheme }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isAuthed } = useAuth()
  const navigate = useNavigate()

  const isHero = mode === 'hero'

  const headerClass = isHero
    ? 'border-transparent bg-transparent'
    : 'border-zinc-200/80 bg-white/85 shadow-sm backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/80'

  const brandClass = isHero ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'

  const navClass = useMemo(() => {
    const base =
      'text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-200 ease-out'
    return isHero
      ? `${base} text-white/85 hover:text-orange-300`
      : `${base} text-zinc-600 hover:text-orange-500 dark:text-zinc-400 dark:hover:text-orange-400`
  }, [isHero])

  const themeBtnClass = isHero
    ? 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur transition-all duration-200 ease-out hover:border-orange-300/90 hover:bg-white/[0.14]'
    : 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300/80 bg-white/80 text-zinc-700 backdrop-blur transition-all duration-200 ease-out hover:border-orange-400/90 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:border-orange-500/50'

  const mobileMenuClass = isHero
    ? 'border-zinc-900/40 bg-zinc-950/75 text-white backdrop-blur-md'
    : 'border-zinc-200/80 bg-white/95 text-zinc-900 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-100'

  const authLinkClass = isHero
    ? 'inline-flex items-center justify-center rounded-full border border-white/35 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition-all duration-200 ease-out hover:border-orange-300/90 hover:bg-white/[0.14]'
    : 'inline-flex items-center justify-center rounded-full border border-zinc-300/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-zinc-700 backdrop-blur transition-all duration-200 ease-out hover:border-orange-400/90 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:border-orange-500/50'

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-200 ease-out',
        headerClass,
      ].join(' ')}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5 md:px-12 lg:px-10">
        <Link
          to="/"
          className={`text-xl font-semibold tracking-tight transition-colors duration-200 ease-out ${brandClass}`}
        >
          The <span className="text-orange-500">Ember Network</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium md:flex">
          <NavLink className={navClass} to="/about">About</NavLink>
          <NavLink className={navClass} to="/programs">Programs</NavLink>
          <NavLink className={navClass} to="/apply">Apply</NavLink>
          <NavLink className={navClass} to="/resources">Resources</NavLink>
          <NavLink className={navClass} to="/contact">Contact</NavLink>
        </div>

        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <Link to="/member" className={authLinkClass} onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <button
                type="button"
                className={authLinkClass}
                onClick={async () => {
                  try {
                    await signOut()
                  } finally {
                    setMobileOpen(false)
                    navigate('/', { replace: true })
                  }
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={authLinkClass} onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            className={themeBtnClass}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
          >
            <ThemeToggleIcons dark={dark} />
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className={[
              'md:hidden inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-out',
              isHero
                ? 'border border-white/35 bg-white/10 text-white hover:border-orange-300/90'
                : 'border border-zinc-300/80 bg-white/80 text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:bg-zinc-950/40 dark:text-zinc-200',
            ].join(' ')}
            aria-expanded={mobileOpen ? 'true' : 'false'}
            aria-controls="mobile-menu"
          >
            Menu
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={[
          'md:hidden overflow-hidden border-t transition-[max-height,opacity] duration-200 ease-out',
          mobileMenuClass,
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-8 py-5 md:px-12 lg:px-10">
          <NavLink className={navClass} to="/about" onClick={() => setMobileOpen(false)}>About</NavLink>
          <NavLink className={navClass} to="/programs" onClick={() => setMobileOpen(false)}>Programs</NavLink>
          <NavLink className={navClass} to="/apply" onClick={() => setMobileOpen(false)}>Apply</NavLink>
          <NavLink className={navClass} to="/resources" onClick={() => setMobileOpen(false)}>Resources</NavLink>
          <NavLink className={navClass} to="/contact" onClick={() => setMobileOpen(false)}>Contact</NavLink>
          {isAuthed ? (
            <>
              <NavLink className={navClass} to="/member" onClick={() => setMobileOpen(false)}>Dashboard</NavLink>
              <button
                type="button"
                className={navClass}
                onClick={async () => {
                  try {
                    await signOut()
                  } finally {
                    setMobileOpen(false)
                    navigate('/', { replace: true })
                  }
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className={navClass} to="/login" onClick={() => setMobileOpen(false)}>Login</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

