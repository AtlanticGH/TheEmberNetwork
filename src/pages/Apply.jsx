import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitApplication } from '../services/applications'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clampText(v, max) {
  return String(v || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

export function ApplyPage() {
  const [values, setValues] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    interest_role: '',
    message: '',
  })
  const [state, setState] = useState({ status: 'idle', error: '', notice: '' }) // idle | submitting | success

  const canSubmit = useMemo(() => {
    const full = values.full_name.trim()
    const email = values.email.trim()
    const role = values.interest_role.trim()
    const msg = values.message.trim()
    return full.length >= 2 && emailRe.test(email) && role.length >= 2 && msg.length >= 10
  }, [values])

  const update = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (state.status === 'submitting') return

    const payload = {
      full_name: clampText(values.full_name, 120),
      email: clampText(values.email, 254).toLowerCase(),
      phone: clampText(values.phone, 40),
      address: clampText(values.address, 240),
      interest_role: clampText(values.interest_role, 80),
      message: String(values.message || '').trim().slice(0, 2000),
    }

    if (!payload.full_name || payload.full_name.length < 2) {
      setState({ status: 'idle', error: 'Please enter your full name.', notice: '' })
      return
    }
    if (!emailRe.test(payload.email)) {
      setState({ status: 'idle', error: 'Please enter a valid email address.', notice: '' })
      return
    }
    if (!payload.interest_role || payload.interest_role.length < 2) {
      setState({ status: 'idle', error: 'Please select your interest / role.', notice: '' })
      return
    }
    if (!payload.message || payload.message.length < 10) {
      setState({ status: 'idle', error: 'Please tell us a bit more about why you want to join (at least 10 characters).', notice: '' })
      return
    }

    setState({ status: 'submitting', error: '', notice: 'Submitting your application…' })
    const res = await submitApplication(payload)
    if (!res?.ok) {
      setState({ status: 'idle', error: res?.error || 'Unable to submit your application. Please try again.', notice: '' })
      return
    }

    setState({
      status: 'success',
      error: '',
      notice: res?.queued
        ? "You're offline. Your application was saved locally and will sync when you're back online."
        : 'Application submitted successfully.',
    })
    setValues({ full_name: '', email: '', phone: '', address: '', interest_role: '', message: '' })
  }

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <section
        id="home-gateway"
        className="relative"
        data-bg="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
      >
        <div
          id="home-gateway-bg"
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/60 to-zinc-950/80" />
        <div className="relative mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100 backdrop-blur">
            Apply
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-white md:text-6xl">
            Apply for membership at The Ember Network
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-zinc-100/90 md:text-base">
            We’re application-based to protect quality and ensure you get the right mentorship track. Share your goal and current stage — we’ll review and follow up with next steps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#application-form" className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-orange-400">
              Start application
            </a>
            <Link to="/programs" className="rounded-full border border-white/60 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-zinc-900">
              Explore programs
            </Link>
            <Link to="/login" className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur transition hover:border-orange-300/80">
              Member login
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-8 pb-20 pt-10 md:px-12 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-500">Membership</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Application</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/"
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-200"
            >
              Site
            </Link>
            <a
              href="#application-form"
              className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-400"
            >
              Start
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[28px] border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">What happens next</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">A simple, transparent process</h2>
          <ol className="mt-5 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-600 dark:text-orange-300">
                1
              </span>
              <span>Submit your application (2–3 minutes).</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-600 dark:text-orange-300">
                2
              </span>
              <span>Your application is reviewed for fit and alignment.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-600 dark:text-orange-300">
                3
              </span>
              <span>If approved, you’ll receive onboarding instructions to activate your account.</span>
            </li>
          </ol>

          <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Privacy</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              We’ll only use your details to respond to your application. No spam.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950/40">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">What you’ll need</p>
            <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              <li className="flex gap-2"><span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-600 dark:text-orange-300">1</span><span>Your current stage + primary goal</span></li>
              <li className="flex gap-2"><span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-600 dark:text-orange-300">2</span><span>The support you want (mentorship, learning, network)</span></li>
              <li className="flex gap-2"><span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-600 dark:text-orange-300">3</span><span>A working email for onboarding</span></li>
            </ul>
            <p className="mt-4 text-xs text-zinc-500">Typical response time: 1–3 business days.</p>
          </div>
        </section>

        <section id="application-form" className="rounded-[28px] border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">Application</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Tell us about you</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Fields marked with * are required.</p>

          {state.status === 'success' ? (
            <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              <p className="text-sm font-semibold">Application received</p>
              <p className="mt-2 text-sm">{state.notice || 'Application submitted successfully.'}</p>
              <p className="mt-3 text-sm">
                Status: <span className="font-semibold">Under review</span>
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  to="/"
                  className="inline-flex rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Back to site
                </Link>
                <Link
                  to="/login"
                  className="inline-flex rounded-full border border-emerald-300 bg-white px-5 py-2 text-sm font-semibold text-emerald-800 hover:border-emerald-400 dark:border-emerald-900/40 dark:bg-zinc-950/30 dark:text-emerald-200"
                >
                  Member login
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Full name *</label>
                  <input
                    value={values.full_name}
                    onChange={update('full_name')}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Email *</label>
                  <input
                    value={values.email}
                    onChange={update('email')}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    placeholder="you@example.com"
                    autoComplete="email"
                    type="email"
                    required
                    maxLength={254}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Phone (optional)</label>
                  <input
                    value={values.phone}
                    onChange={update('phone')}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    placeholder="+233…"
                    autoComplete="tel"
                    maxLength={40}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Interest / Role *</label>
                  <select
                    value={values.interest_role}
                    onChange={update('interest_role')}
                    className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                    required
                  >
                    <option value="">Select…</option>
                    <option value="Entrepreneur">Entrepreneur</option>
                    <option value="Early-Stage Founder">Early-Stage Founder</option>
                    <option value="Industry Expert">Industry Expert</option>
                    <option value="Investor">Investor</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Address (optional)</label>
                <input
                  value={values.address}
                  onChange={update('address')}
                  className="mt-2 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                  placeholder="City, country"
                  autoComplete="street-address"
                  maxLength={240}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Why do you want to join? *</label>
                <textarea
                  value={values.message}
                  onChange={update('message')}
                  className="mt-2 min-h-32 w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950/40"
                  placeholder="Share your goal, your stage, and what support you’re looking for."
                  required
                  maxLength={2000}
                />
                <p className="mt-2 text-xs text-zinc-500">{values.message.length}/2000</p>
              </div>

              {state.error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-200">
                  {state.error}
                </div>
              ) : null}

              {state.notice && !state.error ? (
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200">
                  {state.notice}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit || state.status === 'submitting'}
                className="inline-flex w-full justify-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state.status === 'submitting' ? 'Submitting…' : 'Submit application'}
              </button>
            </form>
          )}
        </section>
        </div>
      </div>
    </main>
  )
}

