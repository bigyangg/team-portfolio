import { Link } from 'react-router-dom'
import { ArrowUpRight, FileText, Sparkles, Target, Users } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import VisionSection from '../components/VisionSection'
import EcosystemSection from '../components/EcosystemSection'
import Counter from '../components/ui/Counter'

const QUICK_LINKS = [
  {
    to: '/about',
    eyebrow: 'About NGHTT',
    title: 'Mission, vision, and the five-year timeline',
    body: 'How Nepal becomes South Asia’s first hydrogen-sovereign nation.',
    icon: Target,
    accent: '#10B981',
  },
  {
    to: '/applications',
    eyebrow: 'Five Applications',
    title: 'Where green H₂ moves the needle for Nepal',
    body: 'Agriculture, fertilizer, heavy transport, industrial heat, and energy storage.',
    icon: Sparkles,
    accent: '#2DD4BF',
  },
  {
    to: '/team',
    eyebrow: 'The Team',
    title: '27 experts with verified, traceable CVs',
    body: 'AI, chemistry, energy systems, policy — mapped, ranked, ready.',
    icon: Users,
    accent: '#34D399',
  },
  {
    to: '/submission',
    eyebrow: 'The Designation Request',
    title: 'What we’re asking the Ministry to formally recognize',
    body: 'A one-page Ministerial Designation Order — no liability, no licensing authority.',
    icon: FileText,
    accent: '#14B8A6',
  },
]

function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Quick-link directory — the four other pages */}
      <section className="relative mx-auto w-full max-w-[1240px] px-5 py-20 md:px-10 md:py-24">
        <div className="mb-10 flex flex-col items-start gap-3 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">— What you’re looking at</p>
            <h2 className="font-display mt-3 text-[32px] font-bold leading-[1.06] tracking-[-0.022em] text-[var(--text)] md:text-[44px]">
              A complete, source-traced submission to the Ministry of Energy.
            </h2>
          </div>
          <p className="max-w-md text-[14.5px] leading-[1.6] text-[var(--text)]/70 md:text-[15.5px]">
            This portfolio bundles the NGHTT proposal, the five-application strategy, the
            27-person research team, and the formal designation request into one place.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group relative overflow-hidden rounded-[22px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/60 hover:shadow-[0_28px_60px_-12px_rgba(16,185,129,0.30)]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{ background: `radial-gradient(80% 80% at 0% 0%, ${q.accent}33, transparent 65%)` }}
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex-1">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl">
                    <q.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="eyebrow mt-5">{q.eyebrow}</p>
                  <h3 className="font-display mt-1.5 text-[22px] font-bold leading-[1.15] tracking-[-0.015em] text-[var(--text)] md:text-[26px]">
                    {q.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--text)]/70">
                    {q.body}
                  </p>
                </div>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 -translate-x-1 translate-y-1 text-[var(--muted-foreground)] opacity-60 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[var(--primary)] group-hover:opacity-100"
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <VisionSection />
      <EcosystemSection />

      {/* Big counters strip — measurable goals */}
      <section className="relative w-full py-24 md:py-32">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="text-center">
            <p className="eyebrow">Year-Five Targets</p>
            <h2 className="font-display mx-auto mt-4 max-w-3xl text-[36px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] md:text-[56px]">
              What we are accountable for by{' '}
              <span className="glow-text">2087 BS</span>.
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-7">
            {[
              { v: 27, label: 'Research positions', suffix: '+' },
              { v: 5, label: 'Field-tested machines' },
              { v: 50, label: 'NPR crore in grants', suffix: '+' },
              { v: 10, label: 'Peer-reviewed papers', suffix: '+' },
            ].map((s) => (
              <div key={s.label} className="rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 text-center backdrop-blur-2xl md:p-10">
                <div className="font-display tab-num text-[64px] font-extrabold leading-none tracking-[-0.025em] text-[var(--primary)] md:text-[88px]">
                  {s.v}{s.suffix && <span>{s.suffix}</span>}
                </div>
                <p className="mt-5 text-[14px] font-semibold text-[var(--text)]/85 md:text-[15px]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap justify-center gap-3">
            <Link to="/about" className="btn btn-primary">
              Read the full mission <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link to="/team" className="btn btn-ghost">
              Meet the team
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
