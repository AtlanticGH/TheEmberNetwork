export function ContactHero() {
  return (
    <section
      id="home-gateway"
      data-section="hero-gateway"
      className="relative"
      data-bg="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80"
    >
      <div
        id="home-gateway-bg"
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/70 via-zinc-950/60 to-zinc-950/75" />
      <div className="relative mx-auto max-w-7xl px-8 pb-16 pt-32 md:px-12 lg:px-10">
        <p className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-100 backdrop-blur">
          Contact
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl leading-tight text-white md:text-6xl">
          Contact The Ember Network
        </h1>
        <p className="mt-5 max-w-2xl text-sm text-zinc-100/90 md:text-base">
          Reach out for membership support, mentor collaboration, and strategic partnerships within TEN.
        </p>
      </div>
    </section>
  )
}

