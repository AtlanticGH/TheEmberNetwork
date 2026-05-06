export function TestimonialsSection() {
  const quotes = [
    '"Within 8 weeks, I moved from idea notes to a validated service with my first paying clients." - Ama, Founder',
    '"The mentorship structure kept me accountable and gave me the confidence to pitch clearly." - Kofi, Builder',
    '"I found trusted collaborators and support I couldn\'t access elsewhere." - Nana, Early-stage Founder',
  ]

  return (
    <section className="mx-auto max-w-7xl px-8 py-16 md:px-12 lg:px-10">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Member Stories</p>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Real progress from our founder community</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {quotes.map((q) => (
            <article
              key={q}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {q}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

