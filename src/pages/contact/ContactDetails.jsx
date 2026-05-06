import { ContactForm } from './ContactForm'

export function ContactDetails() {
  return (
    <section id="contact-options" className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Contact Options</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">We’re happy to help</h2>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 md:text-base">
            If you’re unsure where to start, send a message. We typically reply within <strong>24–48 hours</strong>.
          </p>

          <div className="mt-8 grid gap-3 text-sm text-zinc-700 dark:text-zinc-200">
            <a
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-orange-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              href="mailto:info@theembernetwork.com"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Email</p>
              <p className="mt-2 font-semibold">info@theembernetwork.com</p>
            </a>

            <a
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-orange-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              href="tel:+233509404673"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Phone</p>
              <p className="mt-2 font-semibold">+233 50 940 4673</p>
            </a>

            <a
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-orange-400 dark:border-zinc-800 dark:bg-zinc-900/60"
              href="https://www.theembernetwork.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Website</p>
              <p className="mt-2 font-semibold">www.theembernetwork.com</p>
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="https://www.instagram.com/theembernetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
            >
              Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/theembernetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
            >
              LinkedIn
            </a>
            <a
              href="https://www.facebook.com/theembernetwork"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200"
            >
              Facebook
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Contact questions</p>
          <h3 className="mt-2 text-2xl font-semibold">Send a message</h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Ask a question and we’ll respond within 24–48 hours.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}

