import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer id="site-footer" className="bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-7xl px-8 py-16 md:px-12 md:py-20 lg:px-10">
        <div className="grid gap-14 border-b border-zinc-800/90 pb-12 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <h5 className="text-2xl font-semibold tracking-tight text-white">
              The <span className="text-orange-500">Ember Network</span>
            </h5>
            <p className="mt-5 max-w-md text-sm leading-normal text-zinc-400/95">
              A community of ignition and empowerment helping aspiring entrepreneurs transform small sparks into lasting ventures through mentorship, structure, and opportunity.
            </p>
            <Link
              to="/community"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all duration-200 ease-out hover:bg-orange-400"
            >
              Join the Network
            </Link>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Gateway</p>
            <div className="mt-5 grid gap-2.5">
              <Link className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400" to="/">Home</Link>
              <Link className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400" to="/about">About</Link>
              <Link className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400" to="/programs">Programs</Link>
              <Link className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400" to="/community">Join Community</Link>
              <Link className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400" to="/resources">Resources</Link>
              <Link className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400" to="/contact">Contact</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Connect</p>
            <div className="mt-5 grid gap-2.5">
              <a href="https://www.theembernetwork.com" className="text-xs uppercase tracking-[0.18em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400">Website</a>
              <a href="mailto:info@theembernetwork.com" className="text-xs tracking-[0.08em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400">info@theembernetwork.com</a>
              <a href="tel:+233509404673" className="text-xs tracking-[0.08em] text-zinc-400 transition-colors duration-200 ease-out hover:text-orange-400">+233 50 940 4673</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 pt-8 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Copyright 2026 The Ember Network</span>
            <span>Privacy Policy</span>
            <span>Cookie Settings</span>
          </div>
          <p className="text-zinc-500">Small Sparks Ignite Big Dreams</p>
        </div>
      </div>
    </footer>
  )
}

