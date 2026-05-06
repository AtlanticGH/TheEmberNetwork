import { useState } from 'react'

const faqs = [
  {
    q: 'How soon will I hear back?',
    a: 'We typically reply within 24–48 hours.',
  },
  {
    q: 'What should I include in my message?',
    a: 'Share your current stage, what you’re building, and the kind of support you’re looking for (membership, mentorship, or partnerships).',
  },
  {
    q: 'Is this for beginners?',
    a: 'Yes. TEN supports idea-stage founders and early-stage entrepreneurs through structured mentorship and community accountability.',
  },
]

export function ContactFAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="contact-faq" className="mx-auto max-w-7xl px-8 pb-20 md:px-12 lg:px-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-xs uppercase tracking-[0.18em] text-orange-400">FAQs</p>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">Quick answers</h2>
        <div className="mt-5 space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = open === idx
            return (
              <div key={f.q} className="rounded-xl border border-zinc-800 bg-zinc-900">
                <button
                  type="button"
                  aria-expanded={isOpen ? 'true' : 'false'}
                  onClick={() => setOpen((v) => (v === idx ? null : idx))}
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-zinc-200"
                >
                  {f.q} <span>{isOpen ? '–' : '+'}</span>
                </button>
                {isOpen ? (
                  <div className="border-t border-zinc-800 px-4 py-3 text-sm text-zinc-300">
                    {f.a}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

