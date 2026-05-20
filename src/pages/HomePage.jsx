import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, FileText, Sparkles, Target, Users } from 'lucide-react'
import HeroSection from '../components/HeroSection'
import VisionSection from '../components/VisionSection'
import EcosystemSection from '../components/EcosystemSection'
import SpotlightCard from '../components/motion/SpotlightCard'
import TiltCard from '../components/motion/TiltCard'
import AnimatedCounter from '../components/motion/AnimatedCounter'
import MagneticButton from '../components/motion/MagneticButton'
import { riseItem, staggerContainer } from '../lib/motion'
import SummaryBlock from '../components/home/SummaryBlock'
import RevenueSection from '../components/home/RevenueSection'
import BudgetSection from '../components/home/BudgetSection'
import FAQSection from '../components/home/FAQSection'
import ContactCTA from '../components/home/ContactCTA'

const QUICK_LINKS = [
  {
    to: '/about',
    eyebrow: 'About NGHTT',
    title: 'Mission, vision, and the five-year timeline',
    body: 'How Nepal becomes South Asia’s first hydrogen-sovereign nation.',
    icon: Target,
    accent: 'rgba(16,185,129,0.22)',
  },
  {
    to: '/applications',
    eyebrow: 'Six Applications',
    title: 'Where green H₂ moves the needle for Nepal',
    body: 'Agriculture, fertilizer, freight, industrial heat, energy storage, and South Asian export.',
    icon: Sparkles,
    accent: 'rgba(45,212,191,0.22)',
  },
  {
    to: '/team',
    eyebrow: 'The Team',
    title: '11 founder team with verified, traceable CVs',
    body: 'AI, chemistry, energy systems, policy, law. The complete operating team for Nepal\'s H₂ agenda.',
    icon: Users,
    accent: 'rgba(52,211,153,0.22)',
  },
  {
    to: '/submission',
    eyebrow: 'The Designation Request',
    title: 'What we’re asking the Ministry to formally recognize',
    body: 'A one-page Ministerial Designation Order. No liability, no licensing authority.',
    icon: FileText,
    accent: 'rgba(20,184,166,0.22)',
  },
]

const TARGETS = [
  { v: 11, label: 'Founder team', suffix: '' },
  { v: 11.84, label: 'NPR Cr capital grant', suffix: '', decimals: 2 },
  { v: 25, label: 'NPR Cr/yr revenue by Y10', suffix: '' },
  { v: 5, label: 'Patents filed by Y5', suffix: '+' },
]

const PROBLEM_STATS = [
  { v: '3×', label: 'Urea price spike, 2022 — Russia/Ukraine war.' },
  { v: '100%', label: 'Fuel bill paid abroad. Hydropower runs idle.' },
  { v: '0', label: 'SAARC nations with domestically-owned H₂ engine IP.' },
  { v: '15→5', label: 'Years of R&D compressed via AI-driven simulation.' },
]

function HomePage() {
  return (
    <div>
      <section>
        <HeroSection />
      </section>

      {/* Problem stats strip — the case Nepal is paying for what it could own */}
      <motion.section
        className="surface-mint relative w-full border-y border-[var(--surface-rule-soft)]"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={staggerContainer}
      >
        <div className="mx-auto w-full max-w-[1240px] px-5 py-12 md:px-10 md:py-16">
          <motion.p variants={riseItem} className="eyebrow">The Problem</motion.p>
          <motion.h2 variants={riseItem} className="font-display mt-2 max-w-2xl text-[22px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--text)] md:text-[28px]">
            Nepal is paying for what it could own.
          </motion.h2>
          <motion.div variants={staggerContainer} className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {PROBLEM_STATS.map((s) => (
              <motion.div key={s.label} variants={riseItem} className="border-t border-[var(--surface-rule)] pt-4">
                <div className="font-display tab-num text-[34px] font-extrabold leading-none tracking-[-0.035em] text-[var(--primary)] md:text-[44px]">
                  {s.v}
                </div>
                <p className="mt-2 text-[12px] leading-[1.5] text-[var(--text)]/70 md:text-[13px]">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <SummaryBlock />

      {/* Quick-link directory */}
      <motion.section
        className="surface-mint relative w-full"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={staggerContainer}
      >
        <div className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-10 md:py-24">
        <motion.div variants={riseItem} className="mb-8 flex flex-col items-start gap-3 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">What you’re looking at</p>
            <h2 className="font-display mt-2 text-[26px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--text)] md:text-[36px]">
              A complete, source-traced submission to the Ministry of Energy.
            </h2>
          </div>
          <p className="max-w-md text-[13.5px] leading-[1.55] text-[var(--text)]/70 md:text-[14.5px]">
            This portfolio bundles the NGHTT proposal, the six-application strategy, the
            11-person founder team, and the formal designation request into one place.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {QUICK_LINKS.map((q) => (
            <motion.div key={q.to} variants={riseItem}>
              <TiltCard max={5}>
              <SpotlightCard
                as={Link}
                to={q.to}
                glowColor={q.accent}
                className="group block rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-2xl transition-[box-shadow,border-color] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:border-[var(--primary)]/60 hover:shadow-[0_20px_44px_-12px_rgba(16,185,129,0.28)] active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 group-hover:rotate-[-4deg]">
                      <q.icon className="h-[16px] w-[16px]" aria-hidden="true" />
                    </span>
                    <p className="eyebrow mt-4">{q.eyebrow}</p>
                    <h3 className="font-display mt-1 text-[17px] font-bold leading-[1.2] tracking-[-0.012em] text-[var(--text)] md:text-[19px]">
                      {q.title}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[var(--text)]/70">
                      {q.body}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-[var(--muted-foreground)] opacity-60 transition-[transform,color,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:text-[var(--primary)] group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>
              </SpotlightCard>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
        </div>
      </motion.section>

      <div>
        <VisionSection />
      </div>

      <div>
        <EcosystemSection />
      </div>

      <FAQSection />

      {/* Year-Five counters — forest band for contrast */}
      <motion.section
        className="surface-forest grain relative w-full overflow-hidden py-16 md:py-20"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={staggerContainer}
      >
        <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6EE7B7]/40 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <motion.div variants={riseItem} className="text-center">
            <p className="eyebrow">Year-Five Targets</p>
            <h2 className="font-display mx-auto mt-3 max-w-3xl text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[#E6F4EF] md:text-[42px]">
              What we are accountable for by{' '}
              <span className="glow-text">2087 BS</span>.
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4"
          >
            {TARGETS.map((s) => (
              <motion.div
                key={s.label}
                variants={riseItem}
                className="rounded-[18px] border border-[#6EE7B7]/15 bg-white/[0.04] p-5 text-center backdrop-blur-2xl md:p-7"
              >
                <AnimatedCounter
                  value={s.v}
                  suffix={s.suffix}
                  decimals={s.decimals || 0}
                  className="font-display tab-num inline-block text-[44px] font-extrabold leading-none tracking-[-0.025em] text-[#6EE7B7] md:text-[56px]"
                />
                <p className="mt-3 text-[12.5px] font-semibold text-[#E6F4EF]/80 md:text-[13.5px]">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={riseItem} className="mt-12 flex flex-wrap justify-center gap-3">
            <MagneticButton as={Link} to="/about" className="btn btn-primary">
              Read the full mission <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </MagneticButton>
            <MagneticButton as={Link} to="/team" className="btn btn-ghost">
              Meet the team
            </MagneticButton>
          </motion.div>
        </div>
      </motion.section>

      <RevenueSection />
      <BudgetSection />
      <ContactCTA />
    </div>
  )
}

export default HomePage
