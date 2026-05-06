import { useMemo, useState } from 'react'
import { Modal } from '../../components/ui/Modal'
import { submitApplication } from '../../services/applications'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function JoinForm({ formRef }) {
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    reason: '',
  })

  const canSubmit = useMemo(() => {
    return (
      values.name.trim() &&
      values.email.trim() &&
      emailRe.test(values.email.trim()) &&
      values.role.trim() &&
      values.reason.trim()
    )
  }, [values])

  const update = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) {
      setStatus({ state: 'error', message: 'Please complete all required fields with a valid email.' })
      return
    }
    setStatus({ state: 'sending', message: 'Submitting your application…' })

    const payload = {
      full_name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      interest_role: values.role.trim(),
      message: values.reason.trim(),
    }

    const result = await submitApplication(payload)
    if (!result?.ok) {
      setStatus({
        state: 'error',
        message: result?.error || 'Unable to submit. Please try again or email us.',
      })
      return
    }
    if (result?.queued) {
      setStatus({
        state: 'success',
        message: "You're offline. Your application was saved locally and will sync when online.",
      })
      setModalMessage(`Welcome ${payload.full_name}. Your application was saved and will sync once you're back online.`)
    } else {
      setStatus({
        state: 'success',
        message: "Application submitted successfully. We'll contact you shortly.",
      })
      setModalMessage(`Thanks ${payload.full_name}. We received your application and will follow up with next steps.`)
    }
    setModalOpen(true)
    setValues({ name: '', email: '', phone: '', role: '', reason: '' })
  }

  return (
    <section
      ref={formRef}
      id="join-form"
      className="bg-gradient-to-b from-white to-zinc-50/80 pb-20 pt-16 dark:from-zinc-950 dark:to-zinc-900/70 md:pt-20"
    >
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="You're in!">
        <p>{modalMessage}</p>
      </Modal>
      <div className="mx-auto grid max-w-7xl gap-10 px-8 md:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
        <div>
          <p className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-600 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-300">
            Apply
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Join The Ember Network</h2>
          <p className="mt-4 max-w-xl text-sm text-zinc-600 dark:text-zinc-300 md:text-base">
            Share your goal and current stage — we’ll follow up with the right next step.
          </p>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">What Happens Next</p>
            <ol className="mt-4 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-500">1</span>
                <span>Submit your application</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-500">2</span>
                <span>Receive fit review and onboarding response</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-xs font-semibold text-orange-500">3</span>
                <span>Join your mentorship track and community circle</span>
              </li>
            </ol>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-2xl font-semibold text-zinc-900 dark:text-white">1,200+</p>
              <p className="mt-1 text-xs text-zinc-400">Mentorship Sessions</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-2xl font-semibold text-zinc-900 dark:text-white">94%</p>
              <p className="mt-1 text-xs text-zinc-400">Member Satisfaction</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-md shadow-zinc-200/40 ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/70 dark:shadow-none dark:ring-zinc-800/70 md:p-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold">Application</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Fields marked with * are required.
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Full name *</span>
                <input
                  value={values.name}
                  onChange={update('name')}
                  required
                  placeholder="Full name"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Email *</span>
                <input
                  value={values.email}
                  onChange={update('email')}
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Phone (optional)</span>
                <input
                  value={values.phone}
                  onChange={update('phone')}
                  placeholder="Phone"
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Interest / Role *</span>
                <select
                  value={values.role}
                  onChange={update('role')}
                  required
                  className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                >
                  <option value="">Select role</option>
                  <option>Entrepreneur</option>
                  <option>Early-Stage Founder</option>
                  <option>Industry Expert</option>
                  <option>Investor</option>
                  <option>Student</option>
                </select>
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Why do you want to join? *</span>
              <textarea
                value={values.reason}
                onChange={update('reason')}
                required
                rows={5}
                placeholder="Share your goal, your stage, and what support you’re looking for."
                className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            {status.message ? (
              <p
                className={[
                  'text-sm',
                  status.state === 'error' ? 'text-red-500' : '',
                  status.state === 'success' ? 'text-emerald-500' : '',
                  status.state === 'sending' ? 'text-zinc-500 dark:text-zinc-400' : '',
                ].join(' ')}
              >
                {status.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit || status.state === 'sending'}
              className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white shadow-glow transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit application
            </button>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-300">
              <p className="font-semibold text-zinc-700 dark:text-zinc-200">Privacy</p>
              <p className="mt-1">We’ll only use your details to respond to your application. No spam.</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

