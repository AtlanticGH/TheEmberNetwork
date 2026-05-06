import { Link } from 'react-router-dom'
import { ImageWithFallback } from '../components/ui/ImageWithFallback'
import { Reveal } from '../components/shared/Reveal'

export function AboutPage() {
  const team = [
    {
      title: 'Program Lead',
      desc: 'Designs weekly and monthly activities that keep members accountable and growth-focused.',
      image: '/assets/images/profiles/team-program-lead.jpg',
      fallback: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Mentor Relations',
      desc: 'Connects members with experienced founders, experts, and strategic advisors.',
      image: '/assets/images/profiles/team-mentor-relations.jpg',
      fallback: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Community Manager',
      desc: 'Cultivates engagement across circles, events, and founder collaboration touchpoints.',
      image: '/assets/images/profiles/team-community-manager.jpg',
      fallback: 'https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=800&q=80',
    },
    {
      title: 'Partnerships & Growth',
      desc: 'Builds ecosystem partnerships that expand opportunity for TEN members.',
      image: '/assets/images/profiles/team-partnerships-growth.jpg',
      fallback: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
    },
  ]

  return (
    <main id="page-main" data-component="page-main" className="overflow-x-hidden">
      <section
        id="home-gateway"
        data-section="hero-gateway"
        className="relative"
        data-bg="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=80"
      >
        <div
          id="home-gateway-bg"
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/60 to-zinc-950/75" />
        <div className="relative mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
          <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100 backdrop-blur">
            About
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-white md:text-6xl">
            Who we are and why TEN exists
          </h1>
          <p id="home-gateway-copy" className="mt-5 max-w-2xl text-sm text-zinc-100/90 md:text-base">
            The Ember Network is a transformative hub for emerging entrepreneurs, turning ambitious ideas into thriving enterprises through mentorship and strategic guidance.
          </p>
        </div>
      </section>

      <section id="vision-mission" data-section="vision-mission" className="mx-auto grid max-w-7xl gap-10 px-8 py-20 md:px-12 lg:grid-cols-2 lg:px-10">
        <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold">Vision</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            To build a global network of forward-thinking entrepreneurs who drive innovation, lead with resilience, and create meaningful impact.
          </p>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            We envision a world where young founders transformindustries, uplift communities and shape the futurethrough purposeful, sustainable businesses.
          </p>
        </Reveal>
        <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
          <h2 className="text-2xl font-semibold">Mission</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            To ignite and sustain a thriving entrepreneurial ecosystem that empowers young innovators through mentorship, resources, and opportunities to transform bold ideas into lasting ventures.
          </p>
        </Reveal>
      </section>

      <section id="fire-values" data-section="fire-values" className="mx-auto max-w-7xl px-8 pb-10 md:px-12 lg:px-10">
        <Reveal as="article" className="rounded-2xl border border-zinc-200 p-8 dark:border-zinc-800">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">The Ember Circle</p>
          <h2 className="mt-2 text-2xl font-semibold">Our Core Values</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">We embody the spirit of FIRE, a philosophy that fuels our mission.</p>
          <ul className="mt-5 grid gap-3 text-sm text-zinc-600 dark:text-zinc-300">
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>F - Fostering Potential:</strong> We believe every great entrepreneur starts somewhere. We cultivate an environment where raw potential is refined into real-world success.</p>
            </li>
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>I - Igniting Innovation:</strong> Bold ideas drive change. We encourage creative problem-solving, disruptive thinking, and pioneering leadership.</p>
            </li>
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>R - Resilience in Action:</strong> Every journey has setbacks, but we view challenges as stepping stones. We instill perseverance, adaptability, and a mindset that thrives under pressure.</p>
            </li>
            <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p><strong>E - Empowering Growth:</strong> Mentorship, knowledge, and strategic partnerships ignite success. We equip our members with the tools to elevate themselves and their ventures.</p>
            </li>
          </ul>
        </Reveal>
      </section>

      <section id="why-join-us" data-section="why-join-us" className="mx-auto max-w-7xl px-8 pb-10 md:px-12 lg:px-10">
        <Reveal as="article" className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="min-h-[250px]">
              <img
                src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80"
                alt="Entrepreneurs collaborating in a learning session"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Why Join Us</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">What members gain at TEN</h2>
              <ul className="mt-5 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300 md:grid-cols-2">
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Access to Mentorship</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Collaborative Community</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Increased Visibility &amp; Business Exposure</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Access to Exclusive Resources</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Access to Funding &amp; Opportunities</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Personal Development</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Hands-on Learning Opportunities</li>
                <li className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">Networking with Seasoned Industry Professionals &amp; Entrepreneurs</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="founder-profile" data-section="founder-profile" className="mx-auto max-w-7xl px-8 pb-10 md:px-12 lg:px-10">
        <Reveal as="article" className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[260px]">
              <ImageWithFallback
                src="/assets/images/profiles/ceo portrat 7.png"
                fallbackSrc="https://images.unsplash.com/photo-1573496774426-fe3db3dd1731?auto=format&fit=crop&w=1200&q=80"
                alt="Portrait representing founder leadership"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
            <div className="p-8 md:p-10">
              <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Meet Our Founder</p>
              <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Maud Lindsay-Gamrat</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Founder &amp; Executive Director</p>
              <p className="mt-5 text-zinc-600 dark:text-zinc-300">
                Maud Lindsay-Gamrat is a dynamic entrepreneur and seasoned business leader with over two decades of experience in Ghana&apos;s corporate landscape. As the CEO of Atlantic, she has built a thriving company delivering world-class catering and hospitality solutions across inflight, offshore, remote site, and corporate operations on some of the continent&apos;s largest oil and gas and mining sites.
              </p>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300">
                Under her leadership, Atlantic has grown into a powerhouse employing more than 545 staff, with approximately 98% being Ghanaians, reflecting her strong commitment to local capacity building. Across a 24-year career spanning Sales, Marketing, Human Resources, and Finance, she has launched and managed major remote-site hospitality projects with consistent operational excellence.
              </p>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300">
                Her strategic vision has earned notable recognition, including Most Outstanding Female-Owned Business in Ghana&apos;s Upstream Petroleum Sector (Petroleum Commission of Ghana) and Glitz Woman of the Year for Catering and Hospitality (Glitz Africa). She has also been featured on global platforms such as CNN&apos;s &quot;Passion to Portfolio&quot; for her impact as a business leader.
              </p>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300">
                Beyond business, Maud is deeply committed to women&apos;s empowerment and entrepreneurship. Through The Ember Network, she is focused on equipping and connecting ambitious entrepreneurs, especially women, by building a supportive ecosystem that fosters innovation, leadership, and sustainable venture growth.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <a href="https://www.linkedin.com" className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-xs tracking-[0.12em] text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                <a href="https://www.instagram.com" className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-xs tracking-[0.12em] text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                <a href="https://www.facebook.com" className="inline-flex rounded-full border border-zinc-300 px-3 py-1.5 text-xs tracking-[0.12em] text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="team-grid" data-section="team-grid" className="mx-auto max-w-7xl px-8 pb-14 md:px-12 lg:px-10">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-orange-500">Meet The Team</p>
          <h2 className="mt-3 text-3xl font-semibold md:text-4xl">The people powering TEN</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {team.map((m) => (
            <Reveal
              key={m.title}
              as="article"
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <ImageWithFallback
                src={m.image}
                fallbackSrc={m.fallback}
                alt="Team member profile"
                className="h-64 w-full object-cover md:h-72"
                loading="lazy"
              />
              <div className="p-5">
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{m.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="https://www.linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    LinkedIn
                  </a>
                  <a
                    href="https://www.instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="about-cta" data-section="about-cta" className="mx-auto max-w-7xl px-8 pb-20 md:px-12 lg:px-10">
        <div className="mb-6 flex flex-wrap gap-2">
          <a href="https://www.instagram.com/theembernetwork" className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-xs tracking-[0.12em] text-white transition hover:bg-orange-400" target="_blank" rel="noopener noreferrer">
            The Ember Network Instagram
          </a>
          <a href="https://www.linkedin.com/company/theembernetwork" className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs tracking-[0.12em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">
            The Ember Network LinkedIn
          </a>
          <a href="https://www.facebook.com/theembernetwork" className="inline-flex rounded-full border border-zinc-300 px-4 py-2 text-xs tracking-[0.12em] text-zinc-700 transition hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-300" target="_blank" rel="noopener noreferrer">
            The Ember Network Facebook
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/programs" className="inline-flex rounded-full bg-orange-500 px-5 py-2 font-medium text-white">
            Continue to Programs
          </Link>
          <Link to="/apply" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Apply to Join
          </Link>
          <Link to="/resources" className="inline-flex rounded-full border border-zinc-300 px-5 py-2 font-medium text-zinc-700 hover:border-orange-400 hover:text-orange-500 dark:border-zinc-700 dark:text-zinc-200">
            Explore Resources
          </Link>
        </div>
      </section>

      <section id="highlights-ticker" data-section="highlights-ticker" className="overflow-hidden border-y border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="animate-marquee whitespace-nowrap text-sm font-medium text-zinc-500">
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

