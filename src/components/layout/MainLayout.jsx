import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ChatWidget } from '../shared/ChatWidget'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { ScrollProgress } from './ScrollProgress'

export function MainLayout({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('forge-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return saved ? saved === 'dark' : prefersDark
  })
  const location = useLocation()
  const [headerMode, setHeaderMode] = useState('scrolled') // 'hero' | 'scrolled'

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  const heroSelector = useMemo(
    () => '#home-gateway, [data-section="hero-gateway"]',
    []
  )

  useEffect(() => {
    let raf = 0

    const compute = () => {
      const hero = document.querySelector(heroSelector)
      if (!hero) {
        setHeaderMode('scrolled')
        return
      }
      const heroHeight = hero.getBoundingClientRect().height || 0
      const threshold = Math.max(120, heroHeight - 88)
      const next = window.scrollY < threshold ? 'hero' : 'scrolled'
      setHeaderMode((prev) => (prev === next ? prev : next))
    }

    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(compute)
    }

    compute()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [location.pathname, heroSelector])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('forge-theme', next ? 'dark' : 'light')
  }

  // Keep the public site header/footer visible for member routes.
  // Admin routes remain an internal shell with their own UI.
  const isDashboardShell = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-dvh bg-white text-zinc-900 antialiased transition-colors duration-200 ease-out dark:bg-zinc-950 dark:text-zinc-100">
      <ScrollProgress />
      {!isDashboardShell ? <Navbar mode={headerMode} dark={dark} onToggleTheme={toggleTheme} /> : null}
      {children}
      {!isDashboardShell ? <Footer /> : null}
      <ChatWidget />
    </div>
  )
}

