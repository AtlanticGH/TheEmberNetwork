import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateMyPassword } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'

export function ChangePasswordPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')

  const needsReset = !!user?.user_metadata?.force_password_reset
  const canSubmit = useMemo(() => pw.length >= 10 && pw === pw2 && !busy, [pw, pw2, busy])

  return (
    <div className="mx-auto w-full max-w-xl py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/30">
        <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Security</p>
        <h1 className="mt-2 text-2xl font-semibold">Change your password</h1>
        {needsReset ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            You’re using a temporary password. Please set a new password to continue.
          </p>
        ) : (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Update your password.</p>
        )}

        {error ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
            {error}
          </div>
        ) : null}
        {ok ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
            {ok}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">New password</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
              placeholder="At least 10 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Confirm new password</label>
            <input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              className="mt-2 h-11 w-full rounded-2xl border border-zinc-300 bg-white px-4 text-sm outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={async () => {
              setBusy(true)
              setError('')
              setOk('')
              try {
                if (pw !== pw2) throw new Error('Passwords do not match.')
                if (pw.length < 10) throw new Error('Password must be at least 10 characters.')
                await updateMyPassword(pw)
                setOk('Password updated.')
                navigate('/member', { replace: true })
              } catch (err) {
                setError(err?.message || 'Unable to update password.')
              } finally {
                setBusy(false)
              }
            }}
            className="mt-2 h-11 w-full rounded-full bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60"
          >
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </div>
    </div>
  )
}

