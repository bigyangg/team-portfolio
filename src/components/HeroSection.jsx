import { useEffect, useState } from 'react'
import { ChevronDown, Sparkles } from 'lucide-react'

function HeroSection() {
  const [scrolled, setScrolled] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(Math.min(window.scrollY / 500, 1))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleScroll = () => {
    const el = document.getElementById('vision')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      {/* Full-bleed Himalaya photograph */}
      <img
        src="/hero/himalaya-haze.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: `translate3d(0, ${scrolled * 60}px, 0) scale(${1 + scrolled * 0.04})` }}
      />

      {/* Gradient washes for legibility + cinematic mood */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(232,244,250,0.10) 0%, rgba(220,238,242,0.30) 40%, rgba(238,248,244,0.85) 92%, var(--aurora-base) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 12% 30%, rgba(110,231,183,0.16), transparent 60%), radial-gradient(50% 50% at 90% 78%, rgba(45,212,191,0.18), transparent 65%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1240px] flex-col justify-end px-5 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32">
        <div className="anim-rise max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/50 bg-white/55 px-5 py-2 backdrop-blur-xl">
            <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-[var(--primary)]" aria-hidden="true" />
            <span className="text-[12.5px] font-semibold text-[var(--text)]/85">
              A proposal to the Ministry of Energy
            </span>
          </div>

          <h1 className="font-display text-[52px] font-extrabold leading-[1.04] tracking-[-0.028em] text-[var(--text)] sm:text-[80px] md:text-[104px] lg:text-[120px]">
            Building Nepal's
            <br />
            <span className="glow-text">green hydrogen</span>
            <br />
            future, together.
          </h1>

          <p className="mt-9 max-w-2xl text-[18px] leading-[1.6] text-[var(--text)]/80 md:text-[21px]">
            We're a team of 27 — chemists, engineers, AI builders, lawyers and policy people — quietly
            organising the institution that turns Nepal's monsoon hydropower into a hydrogen economy.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#team" className="btn btn-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              View the team
            </a>
            <a href="#vision" className="btn btn-ghost">
              Our mission
            </a>
          </div>
        </div>

        {/* Scroll cue */}
        <button
          type="button"
          onClick={handleScroll}
          aria-label="Scroll to vision"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-white/40 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text)]/80 backdrop-blur-xl transition-colors hover:bg-white/60 md:inline-flex"
        >
          Scroll
          <ChevronDown className="h-3 w-3 animate-bounce" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}

export default HeroSection
