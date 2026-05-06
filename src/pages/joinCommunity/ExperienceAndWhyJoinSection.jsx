export function ExperienceAndWhyJoinSection() {
  const experienceItems = [
    {
      title: 'Mentorship',
      desc: 'Receive structured mentorship, ideation support, and accountability.',
    },
    {
      title: 'Networking',
      desc: 'Get practical feedback, growth planning, and network access.',
    },
    {
      title: 'Growth opportunities',
      desc: 'Contribute expertise, mentorship, and opportunity pathways.',
    },
  ]

  const benefitItems = [
    'Access to mentorship and collaborative community support',
    'Hands-on learning opportunities and founder networking',
    'Increased business visibility and exposure',
    'Access to funding opportunities and exclusive resources',
  ]

  return (
    <section
      id="community-experience"
      className="bg-zinc-100/70 px-8 py-16 dark:bg-zinc-900/60 md:px-12 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Community Experience</p>
        <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Who can join TEN</h2>
        <p className="mt-3 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300 md:text-base">
          TEN brings together aspiring entrepreneurs, early-stage founders, and experts in one collaborative ecosystem.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {experienceItems.map((it) => (
            <article
              key={it.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h3 className="text-lg font-semibold">{it.title}</h3>
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{it.desc}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Why Join</p>
            <h3 className="mt-3 text-2xl font-semibold md:text-3xl">Membership overview & application process</h3>
            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 md:text-base">
              TEN reviews all applications for alignment with our mission and FIRE values before onboarding approved members.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
              {benefitItems.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

