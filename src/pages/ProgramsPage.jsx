import { Link } from 'react-router-dom'

export function ProgramsPage() {
  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <section
        id="home-gateway"
        data-section="hero-gateway"
        className="relative"
        data-bg="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80"
      >
        <div
          id="home-gateway-bg"
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/60 to-zinc-950/75" />
        <div className="relative mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100 backdrop-blur">Programs</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-[1.08] text-white md:text-6xl">Operational learning journey</h1>
          <p id="home-gateway-copy" className="mt-5 max-w-2xl text-sm text-zinc-100/90 md:text-base">
            From weekly execution tasks to quarterly pitch competitions, TEN guides members through a practical, accountability-driven path from idea to venture growth.
          </p>
        </div>
      </section>

      <section id="module-navigator" data-section="module-navigator" className="mx-auto max-w-7xl px-8 pt-10 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Lesson Modules</p>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <a href="#module-1" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800">
              Module 01 - Weekly Foundation
            </a>
            <a href="#module-2" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800">
              Module 02 - Monthly Acceleration
            </a>
            <a href="#module-3" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800">
              Module 03 - Quarterly Execution
            </a>
          </div>
          <div className="mt-3">
            <Link to="/program-components" className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-orange-400">
              Open Full Components Page
            </Link>
          </div>
        </div>
      </section>

      <section id="module-1" data-section="module-1" className="mx-auto max-w-7xl px-8 py-10 md:px-12 lg:px-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="min-h-[260px]">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1500&q=80"
                alt="Weekly module planning and collaboration session"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-7 md:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Module 01</p>
              <h2 className="mt-3 text-2xl font-semibold">Weekly Foundation</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                Each week, members complete practical tasks across ideation, market research, business model canvas development, and product concept refinement.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                <li>Task-based learning and continuous accountability.</li>
                <li>Weekly presentation and structured peer review.</li>
                <li>Top execution recognized as Entrepreneur of the Week.</li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section id="module-2" data-section="module-2" className="mx-auto max-w-7xl px-8 py-2 md:px-12 lg:px-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="order-2 p-7 md:p-8 lg:order-1">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Module 02</p>
              <h2 className="mt-3 text-2xl font-semibold">Monthly Acceleration</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                Monthly in-person sessions feature expert and mentor-led workshops on critical business skills such as market strategy, scaling, and financial management.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                <li>Hands-on learning focused on practical business growth.</li>
                <li>Progress check-ins and personalized mentor feedback.</li>
                <li>Pitch &amp; Progress Review with clear next actions.</li>
              </ul>
            </div>
            <div className="order-1 min-h-[260px] lg:order-2">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1500&q=80"
                alt="Monthly workshop and mentorship session"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </article>
      </section>

      <section id="module-3" data-section="module-3" className="mx-auto max-w-7xl px-8 py-10 md:px-12 lg:px-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="min-h-[260px]">
              <img
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1500&q=80"
                alt="Quarterly pitch and judging session"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-7 md:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Module 03</p>
              <h2 className="mt-3 text-2xl font-semibold">Quarterly Execution</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                Each quarter, members pitch refined business ideas to a panel of experts and judges, demonstrating measurable movement from ideation to execution.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                <li>Pitch competition and mastery-based evaluation.</li>
                <li>Masterclasses on scaling, growth, and investment readiness.</li>
                <li>Rewards for outstanding innovation and impact-aligned solutions.</li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section id="founder-lens" data-section="founder-lens" className="mx-auto max-w-7xl px-8 pb-12 md:px-12 lg:px-10">
        <article className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Founder Spotlight</p>
          <h2 className="mt-2 text-2xl font-semibold">Program Philosophy from the Founder</h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            The Ember Network&apos;s learning structure reflects Maud Lindsay-Gamrat&apos;s leadership approach: disciplined execution, practical learning, and resilience-driven growth built over two decades of business leadership.
          </p>
        </article>
      </section>

      <section id="programs-cta" data-section="programs-cta" className="mx-auto max-w-7xl px-8 pb-20 md:px-12 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Link to="/apply" className="inline-flex rounded-full bg-orange-500 px-5 py-2 font-medium text-white">
            Apply for Mentorship
          </Link>
          <Link to="/community" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Join Community
          </Link>
          <Link to="/resources" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Learning Resources
          </Link>
        </div>
      </section>

      <section id="highlights-ticker" data-section="highlights-ticker" className="overflow-hidden border-y border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="animate-marquee whitespace-nowrap text-sm font-medium text-zinc-500">
          <span className="mx-6">Weekly: Business ideation, market research, model canvas, peer reviews</span>
          <span className="mx-6">Monthly: In-person workshops, mentor feedback, Pitch &amp; Progress review</span>
          <span className="mx-6">Quarterly: Pitch competitions, growth masterclasses, impact-aligned solutions</span>
          <span className="mx-6">Recognition: Entrepreneur of the Week and top quarterly innovation awards</span>
          <span className="mx-6">Weekly: Business ideation, market research, model canvas, peer reviews</span>
          <span className="mx-6">Monthly: In-person workshops, mentor feedback, Pitch &amp; Progress review</span>
        </div>
      </section>
    </main>
  )
}

