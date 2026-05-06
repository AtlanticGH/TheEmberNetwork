import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type Mode = 'login' | 'signup'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function friendlyAuthError(message?: string) {
  const msg = String(message || '').toLowerCase()
  if (msg.includes('invalid login credentials')) return 'Invalid login credentials.'
  if (msg.includes('user already registered')) return 'User already registered. Try logging in instead.'
  if (msg.includes('already registered')) return 'User already registered. Try logging in instead.'
  if (msg.includes('password') && msg.includes('should be')) return 'Password is too weak. Please choose a stronger password.'
  if (msg.includes('email') && msg.includes('confirm')) return 'Please confirm your email address before logging in. Check your inbox.'
  if (msg.includes('network') || msg.includes('failed to fetch')) return 'Network error. Please check your connection and try again.'
  return message || 'Something went wrong. Please try again.'
}

export function AuthPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isAuthed, loading, user } = useAuth()

  const nextPath = useMemo(() => params.get('next') || '/dashboard', [params])
  const initialMode = (params.get('mode') === 'signup' ? 'signup' : 'login') as Mode

  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!loading && isAuthed) {
      navigate(nextPath, { replace: true })
    }
  }, [isAuthed, loading, navigate, nextPath])

  if (!loading && isAuthed) return <Navigate to={nextPath} replace />

  const submit = async () => {
    setError('')
    setSuccess('')

    const trimmed = email.trim()
    if (!trimmed) return setError('Please enter your email.')
    if (!isValidEmail(trimmed)) return setError('Please enter a valid email address.')
    if (!password) return setError('Please enter your password.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')

    if (!supabase) {
      setError('Supabase is not configured. Check environment variables.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmed, password })
        if (error) throw error
        // AuthProvider listener will pick this up; redirect happens via effect.
      } else {
        const { data, error } = await supabase.auth.signUp({ email: trimmed, password })
        if (error) throw error

        const needsEmailConfirm = !data.session
        if (needsEmailConfirm) {
          setSuccess('Account created. Please check your email to confirm your address, then log in.')
          setMode('login')
        } else {
          setSuccess('Account created. Redirecting…')
        }
      }
    } catch (e: any) {
      setError(friendlyAuthError(e?.message))
    } finally {
      setSubmitting(false)
    }
  }

  const title = mode === 'login' ? 'Welcome back' : 'Create your account'
  const subtitle =
    mode === 'login'
      ? 'Log in to continue to your dashboard.'
      : 'Sign up with email and password. You may need to confirm your email.'

  return (
    <main id="page-main" data-component="page-main" className="mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Authentication</p>
            <h1 className="mt-3 text-3xl font-semibold">{title}</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              The <span className="text-orange-500">Ember Network</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>

        <div className="mt-6 grid grid-cols-2 rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-950/40">
          <button
            type="button"
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              mode === 'login' ? 'bg-white shadow-sm dark:bg-zinc-900' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white',
            ].join(' ')}
            onClick={() => {
              setError('')
              setSuccess('')
              setMode('login')
            }}
          >
            Login
          </button>
          <button
            type="button"
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              mode === 'signup' ? 'bg-white shadow-sm dark:bg-zinc-900' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white',
            ].join(' ')}
            onClick={() => {
              setError('')
              setSuccess('')
              setMode('signup')
            }}
          >
            Signup
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            await submit()
          }}
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Password</label>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-4 py-2.5 transition focus-within:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent py-0.5 text-sm outline-none"
                placeholder="••••••••"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 hover:border-orange-300 hover:text-orange-600 dark:border-zinc-800 dark:text-zinc-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">At least 8 characters.</p>
          </div>

          {success ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link to="/forgot-password" className="text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-300">
            Forgot password?
          </Link>
          {!user ? (
            <span className="text-zinc-600 dark:text-zinc-300">
              New here?{' '}
              <button
                type="button"
                className="font-semibold text-orange-600 underline-offset-2 hover:underline dark:text-orange-300"
                onClick={() => setMode((m) => (m === 'login' ? 'signup' : 'login'))}
              >
                {mode === 'login' ? 'Create an account' : 'Log in instead'}
              </button>
            </span>
          ) : null}
        </div>
      </div>
    </main>
  )
}

