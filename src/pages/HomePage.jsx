import { Link } from 'react-router-dom'
import { Reveal } from '../components/shared/Reveal'
import { getSiteContent } from '../services/siteContent'
import { useEffect, useState } from 'react'

const HOME_HERO_KEY = 'home.hero.v1'
const DEFAULT_HOME_HERO = {
  badge: 'A COMMUNITY OF IGNITION & EMPOWERMENT',
  headline_before: 'Small sparks ignite',
  headline_emphasis: 'big dreams at The Ember Network',
  description:
    'We help aspiring entrepreneurs and early-stage founders transform bold ideas into lasting ventures through mentorship, structured learning, and meaningful connections.',
  cta_primary_label: 'Apply for Membership',
  cta_primary_href: '/apply',
  cta_secondary_label: 'Explore Story',
  cta_secondary_href: '/about',
  background_image:
    'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80',
}

export function HomePage() {
  const [hero, setHero] = useState(DEFAULT_HOME_HERO)

  useEffect(() => {
    let alive = true
    const run = async () => {
      try {
        const row = await getSiteContent(HOME_HERO_KEY)
        if (!alive) return
        if (row?.value) setHero((v) => ({ ...v, ...row.value }))
      } catch {
        // ignore: fallback to defaults
      }
    }
    run()
    return () => {
      alive = false
    }
  }, [])

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <section
        id="home-gateway"
        data-section="hero-gateway"
        className="relative min-h-[100dvh] overflow-hidden bg-zinc-950"
        data-bg={hero.background_image}
      >
        <div
          className="absolute inset-0 bg-zinc-950 bg-cover bg-center transition-all duration-500 ease-out"
          id="home-gateway-bg"
          style={{
            backgroundImage: `url('${hero.background_image || DEFAULT_HOME_HERO.background_image}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/72 via-black/50 to-zinc-950/[0.93]" />

        <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-8 pb-16 pt-32 md:px-12 md:pb-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="mb-5 inline-block w-fit rounded-full border border-white/30 bg-white/[0.08] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-300/95 backdrop-blur-sm">
              {hero.badge}
            </p>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.02] tracking-[-0.02em] text-white sm:text-4xl md:text-5xl lg:text-6xl lg:leading-[1.01]">
              <span className="block leading-[1.02]">{hero.headline_before}</span>
              <span className="mt-0.5 block leading-[1.02] bg-gradient-to-r from-orange-300 via-amber-200 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_14px_rgba(0,0,0,0.72)] md:mt-1">
                {hero.headline_emphasis}
              </span>
            </h1>
            <p
              id="home-gateway-copy"
              className="mt-5 max-w-xl text-pretty text-sm font-normal leading-snug text-zinc-200/90 md:mt-6 md:text-[17px] md:leading-snug"
            >
              {hero.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3 md:mt-10 md:gap-4">
              <Link
                to={hero.cta_primary_href || DEFAULT_HOME_HERO.cta_primary_href}
                className="inline-flex min-h-[44px] min-w-[10rem] items-center justify-center rounded-full bg-orange-500 px-7 py-3 text-[15px] font-semibold text-white shadow-glow ring-1 ring-white/10 transition-all duration-200 ease-out hover:bg-orange-400 hover:ring-white/20 hover:shadow-lg active:scale-[0.99] md:text-base"
              >
                {hero.cta_primary_label || DEFAULT_HOME_HERO.cta_primary_label}
              </Link>
              <Link
                to={hero.cta_secondary_href || DEFAULT_HOME_HERO.cta_secondary_href}
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/35 bg-transparent px-6 py-3 text-sm font-normal text-white/75 backdrop-blur-sm transition-all duration-200 ease-out hover:border-white/55 hover:bg-white/[0.08] hover:text-white/90"
              >
                {hero.cta_secondary_label || DEFAULT_HOME_HERO.cta_secondary_label}
              </Link>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 -bottom-px">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="h-20 w-full md:h-28">
            <polygon points="0,20 100,0 100,20" className="fill-orange-500" />
          </svg>
        </div>
      </section>

      <section
        id="gateway-actions"
        data-section="gateway-actions"
        className="-mt-20 bg-orange-500 pb-24 pt-28 md:-mt-28 md:pb-32 md:pt-36"
      >
        <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-100/85">Ready to Build?</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">Join The Ember Network today</h3>
              <p className="mt-4 max-w-3xl text-sm leading-normal text-orange-50/90 md:text-base md:leading-normal">
                Get mentorship, structured programs, and a supportive founder ecosystem designed to help your idea grow into a lasting venture.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/apply"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-orange-600 shadow-sm transition-all duration-200 ease-out hover:bg-orange-50 hover:shadow-md active:scale-[0.99]"
              >
                Apply for Membership
              </Link>
              <Link
                to="/programs"
                className="inline-flex items-center justify-center rounded-full border border-white/70 bg-transparent px-6 py-2.5 text-sm font-semibold text-white/95 transition-all duration-200 ease-out hover:border-white hover:bg-white/10"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="about-preview" data-section="about-preview" className="bg-gradient-to-b from-white to-zinc-50/80 py-20 dark:from-zinc-950 dark:to-zinc-900/70 md:py-24">
        <div className="mx-auto max-w-7xl px-8 md:px-12 lg:px-10">
          <Reveal className="mb-14 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">About The Ember Network</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">
              Built to turn early ideas into resilient ventures
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-normal text-zinc-600 dark:text-zinc-300 md:text-base md:leading-normal">
              We combine mentorship, practical frameworks, and a founder-first community so ambitious builders can move from spark to sustainable growth.
            </p>
          </Reveal>

          <div className="grid gap-12 md:gap-14">
            <Reveal as="article" className="group overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-md shadow-zinc-200/40 ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-800/70">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                <div className="p-8 md:p-12 lg:p-14">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Who We Are</p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                    A transformative hub for emerging entrepreneurs
                  </h3>
                  <p className="mt-6 text-sm leading-normal text-zinc-600 dark:text-zinc-300 md:text-base md:leading-normal">
                    The Ember Network is dedicated to turning ambitious ideas into thriving enterprises. We provide mentorship, strategic guidance, and a supportive ecosystem where young visionaries gain the skills, knowledge, and connections they need to succeed.
                  </p>
                  <p className="mt-4 text-sm leading-normal text-zinc-600 dark:text-zinc-300 md:text-base md:leading-normal">
                    More than a network, TEN is a movement where small sparks of potential ignite into powerful flames of achievement.
                  </p>
                </div>
                <div className="relative min-h-[280px] overflow-hidden lg:min-h-full">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
                    alt="Entrepreneurs collaborating in a workshop"
                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
              </div>
            </Reveal>

            <Reveal as="article" className="group overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-md shadow-zinc-200/40 ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none dark:ring-zinc-800/70">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[280px] overflow-hidden lg:order-1 lg:min-h-full">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
                    alt="Team discussing business strategy"
                    className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="p-8 md:p-12 lg:order-2 lg:p-14">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Background</p>
                  <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">Bridging ambition and execution</h3>
                  <p className="mt-6 text-sm leading-normal text-zinc-600 dark:text-zinc-300 md:text-base md:leading-normal">
                    Entrepreneurship begins with a spark, but it takes the right environment to turn that spark into a lasting fire. TEN was founded to close the gap between ambition and execution through structured mentorship, hands-on learning, and a strong community.
                  </p>
                  <p className="mt-4 text-sm leading-normal text-zinc-600 dark:text-zinc-300 md:text-base md:leading-normal">
                    We connect aspiring entrepreneurs with experienced mentors and industry leaders, creating a space where ideas are nurtured, resilience is built, and businesses take flight.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="journey-trust" data-section="journey-trust" className="mx-auto max-w-7xl px-8 py-20 md:px-12 md:py-24 lg:px-10">
        <Reveal className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">How It Works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl md:leading-tight">
              Simple path from idea to momentum
            </h2>
          </div>
          <Link
            to="/apply"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-200 ease-out hover:bg-orange-400 active:scale-[0.99]"
          >
            Start Application
          </Link>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          <Reveal as="article" className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">01</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">Understand Your Stage</h3>
            <p className="mt-3 text-sm leading-normal text-zinc-600 dark:text-zinc-300">
              Share your current stage and goals so we can align the right mentorship structure.
            </p>
          </Reveal>
          <Reveal as="article" className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">02</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">Join Guided Programs</h3>
            <p className="mt-3 text-sm leading-normal text-zinc-600 dark:text-zinc-300">
              Access practical tracks, weekly accountability, and mentor-led growth sessions.
            </p>
          </Reveal>
          <Reveal as="article" className="rounded-2xl border border-zinc-200 bg-white p-7 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-500">03</p>
            <h3 className="mt-3 text-xl font-semibold tracking-tight">Build With Community</h3>
            <p className="mt-3 text-sm leading-normal text-zinc-600 dark:text-zinc-300">
              Grow alongside founders, experts, and peers focused on meaningful impact.
            </p>
          </Reveal>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Reveal as="article" className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">1,200+</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Mentorship Sessions</p>
          </Reveal>
          <Reveal as="article" className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">320+</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Founders Supported</p>
          </Reveal>
          <Reveal as="article" className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-800 dark:bg-zinc-900/70">
            <p className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">94%</p>
            <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">Member Satisfaction</p>
          </Reveal>
        </div>
      </section>

      <section id="highlights-ticker" data-section="highlights-ticker" className="overflow-hidden border-y border-zinc-200 bg-zinc-50 py-10 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="animate-marquee whitespace-nowrap text-sm font-medium text-zinc-500/90">
          <span className="mx-6">Entrepreneur of the week: Maya - scaling eco logistics</span>
          <span className="mx-6">Testimonial: I found my cofounder in two weeks</span>
          <span className="mx-6">Spotlight: AI mentor circles now open worldwide</span>
          <span className="mx-6">New challenge: Build a social-impact prototype in 30 days</span>
          <span className="mx-6">Entrepreneur of the week: Maya - scaling eco logistics</span>
          <span className="mx-6">Testimonial: I found my cofounder in two weeks</span>
        </div>
      </section>
    </main>
  )
}

