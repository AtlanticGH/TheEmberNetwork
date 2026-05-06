import { Link } from 'react-router-dom'

export function ProgramComponentsPage() {
  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <section className="relative min-h-[52vh]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative mx-auto max-w-7xl px-8 py-24 pt-32 md:px-12 lg:px-10">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-300">Program Components</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-white md:text-6xl">Structured learning, step by step</h1>
          <p className="mt-4 max-w-2xl text-sm tracking-[0.03em] text-zinc-100/90 md:text-base">
            Explore each component of The Ember Network journey with clear outcomes, format, and progression.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-8 py-10 md:px-12 lg:px-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Quick Navigation</p>
          <div className="mt-3 grid gap-2 md:grid-cols-4">
            <a href="#weekly-component" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800">
              Weekly Component
            </a>
            <a href="#monthly-component" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800">
              Monthly Component
            </a>
            <a href="#quarterly-component" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800">
              Quarterly Component
            </a>
            <a href="#founder-component" className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm transition hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800">
              Founder Lens
            </a>
          </div>
        </div>
      </section>

      <section id="weekly-component" className="mx-auto max-w-7xl px-8 pb-8 md:px-12 lg:px-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1500&q=80"
              alt="Weekly planning and presentation workflow"
              className="h-full min-h-[260px] w-full object-cover"
              loading="lazy"
            />
            <div className="p-7 md:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Component 01</p>
              <h2 className="mt-3 text-2xl font-semibold">Weekly Component</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                Members are assigned practical tasks integral to business development, including ideation, market research, business model canvas creation, and product concept refinement.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                <li>End-of-week presentation to the group.</li>
                <li>Peer review with constructive feedback and new perspectives.</li>
                <li>Best idea or presentation recognized as Entrepreneur of the Week.</li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section id="monthly-component" className="mx-auto max-w-7xl px-8 py-2 md:px-12 lg:px-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="order-2 p-7 md:p-8 lg:order-1">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Component 02</p>
              <h2 className="mt-3 text-2xl font-semibold">Monthly Component</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                Members join in-person sessions with experts and mentors for dynamic workshops focused on market strategies, scaling, and financial management.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                <li>Progress presentations and challenge reviews.</li>
                <li>Personalized feedback from mentors and experts.</li>
                <li>Pitch &amp; Progress Review with actionable next steps.</li>
              </ul>
            </div>
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1500&q=80"
              alt="Monthly workshop and mentoring session"
              className="order-1 h-full min-h-[260px] w-full object-cover lg:order-2"
              loading="lazy"
            />
          </div>
        </article>
      </section>

      <section id="quarterly-component" className="mx-auto max-w-7xl px-8 py-8 md:px-12 lg:px-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <img
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1500&q=80"
              alt="Quarterly pitch competition and expert panel"
              className="h-full min-h-[260px] w-full object-cover"
              loading="lazy"
            />
            <div className="p-7 md:p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Component 03</p>
              <h2 className="mt-3 text-2xl font-semibold">Quarterly Component</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                Members present refined business ideas in a pitch competition before a panel of experts and judges, showing progress from ideation to execution.
              </p>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                <li>Hands-on masterclasses on scaling, growth, and investment readiness.</li>
                <li>Social-cause aligned business challenge integration.</li>
                <li>Awards for outstanding innovation, progress, and entrepreneurial spirit.</li>
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section id="founder-component" className="mx-auto max-w-7xl px-8 pb-16 pt-2 md:px-12 lg:px-10">
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="order-2 p-7 md:p-8 lg:order-1">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-500">Founder Lens</p>
              <h2 className="mt-3 text-2xl font-semibold">Leadership Approach Behind the Components</h2>
              <p className="mt-3 text-zinc-600 dark:text-zinc-300">
                The component model reflects Maud Lindsay-Gamrat&apos;s practical leadership philosophy: structured execution, resilience in action, and strategic mentorship that transforms bold ideas into lasting ventures.
              </p>
              <Link to="/about#founder-profile" className="mt-5 inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700">
                Read Founder Story
              </Link>
            </div>
            <img
              src="https://images.unsplash.com/photo-1573496774426-fe3db3dd1731?auto=format&fit=crop&w=1200&q=80"
              alt="Founder leadership portrait"
              className="order-1 h-full min-h-[260px] w-full object-cover lg:order-2"
              loading="lazy"
            />
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-7xl px-8 pb-20 md:px-12 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Link to="/apply" className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400">
            Apply for Mentorship
          </Link>
          <Link to="/resources" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Explore Resources
          </Link>
          <Link to="/community" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 text-sm font-semibold text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Visit Community
          </Link>
        </div>
      </section>
    </main>
  )
}

