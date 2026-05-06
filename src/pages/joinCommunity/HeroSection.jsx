export function HeroSection({ onCtaClick }) {
  return (
    <section
      id="home-gateway"
      data-section="hero-gateway"
      className="relative"
      data-bg="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
    >
      <div
        id="home-gateway-bg"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/75 via-zinc-950/60 to-zinc-950/80" />

      <div className="relative mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
        <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100 backdrop-blur">
          Join The Ember Network
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-white md:text-6xl">
          Start your mentorship journey in clear steps
        </h1>
        <p className="mt-5 max-w-2xl text-sm text-zinc-100/90 md:text-base">
          Tell us where you are, what you are building, and how we can support your growth through mentorship and community accountability.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCtaClick}
            className="rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-orange-400"
          >
            Apply to Join
          </button>
          <a
            href="#community-experience"
            className="rounded-full border border-white/40 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/95 backdrop-blur transition hover:border-orange-300/80"
          >
            Why join TEN
          </a>
        </div>
      </div>
    </section>
  )
}

