import { useMemo, useState } from 'react'
import { submitSubmission } from '../../utils/submissions'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ContactForm() {
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [values, setValues] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  const canSubmit = useMemo(() => {
    return (
      values.name.trim() &&
      values.email.trim() &&
      emailRe.test(values.email.trim()) &&
      values.subject.trim() &&
      values.message.trim()
    )
  }, [values])

  const update = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) {
      setStatus({ state: 'error', message: 'Please complete all required fields with a valid email.' })
      return
    }

    setStatus({ state: 'sending', message: 'Sending your message…' })
    const payload = {
      source: 'contact',
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      subject: values.subject.trim(),
      message: values.message.trim(),
    }

    try {
      const result = await submitSubmission(payload)
      if (result?.fallback) {
        setStatus({
          state: 'success',
          message: "You're offline. Your message is saved locally and will sync when online.",
        })
      } else {
        setStatus({ state: 'success', message: "Message sent successfully. We'll be in touch shortly." })
      }
      setValues({ name: '', email: '', phone: '', subject: '', message: '' })
    } catch (err) {
      setStatus({
        state: 'error',
        message: err?.message || 'Something went wrong. Please try again or email us directly.',
      })
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" aria-label="Contact form">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Full name *</span>
          <input
            value={values.name}
            onChange={update('name')}
            required
            placeholder="Full name"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Subject *</span>
          <input
            value={values.subject}
            onChange={update('subject')}
            required
            placeholder="Subject"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">Message *</span>
        <textarea
          value={values.message}
          onChange={update('message')}
          required
          rows={6}
          placeholder="Your message"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
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
        className="w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Send message
      </button>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        We’ll only use your details to respond to your message. No spam.
      </p>
    </form>
  )
}

