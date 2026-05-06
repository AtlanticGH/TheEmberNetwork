import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { sendPasswordReset } from '../services/auth'

export function ForgotPasswordPage() {
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  return (
    <main id="page-main" data-component="page-main" className="mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
      <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Account</p>
        <h1 className="mt-3 text-3xl font-semibold">Reset password</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          Enter your email and we’ll send a password reset link.
        </p>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            setError('')
            setNotice('')
            const trimmedEmail = email.trim()
            if (!trimmedEmail) {
              setError('Please enter your email.')
              return
            }
            setSubmitting(true)
            try {
              await sendPasswordReset(trimmedEmail)
              setNotice('If an account exists for this email, a reset link has been sent.')
            } catch (err) {
              setError(err?.message || 'Unable to send reset email. Please try again.')
            } finally {
              setSubmitting(false)
            }
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
            />
          </div>

          {notice ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              {notice}
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
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link to="/login" className="text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-300">
            Back to login
          </Link>
          <Link to="/" className="text-orange-600 underline-offset-2 hover:underline dark:text-orange-300">
            Back to site
          </Link>
        </div>
      </div>
    </main>
  )
}

