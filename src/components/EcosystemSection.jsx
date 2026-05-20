import { motion } from 'framer-motion'
import { Truck, Wheat, Flame, Battery, Sprout } from 'lucide-react'
import { riseItem, staggerContainer } from '../lib/motion'
import SpotlightCard from './motion/SpotlightCard'
import TiltCard from './motion/TiltCard'
import ElectrolysisGlyph from './motion/ElectrolysisGlyph'
import H2Molecule from './motion/H2Molecule'

const USE_CASES = [
  {
    n: '01',
    icon: Wheat,
    title: 'Agricultural Mechanization',
    body: 'Hydrogen tractor retrofit kits replace diesel across the Terai region. Cleaner air, lower input costs for farmers.',
    accent: 'rgba(16,185,129,0.22)',
    hoverGlyph: 'h2',
  },
  {
    n: '02',
    icon: Sprout,
    title: 'Fertilizer Sovereignty',
    body: 'Green ammonia for urea production ends Nepal\'s import dependency and stabilises prices for farmers.',
    accent: 'rgba(45,212,191,0.22)',
    hoverGlyph: 'electrolysis',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Heavy Transport',
    body: 'Fuel cells power long-haul trucks and cross-border SAARC freight, replacing imported diesel.',
    accent: 'rgba(110,231,183,0.22)',
    hoverGlyph: 'h2',
  },
  {
    n: '04',
    icon: Flame,
    title: 'Industrial Heat',
    body: 'Hydrogen combustion replaces coal in Nepal\'s polluting brick kilns and cement plants.',
    accent: 'rgba(20,184,166,0.22)',
    hoverGlyph: 'h2',
  },
  {
    n: '05',
    icon: Battery,
    title: 'Energy Storage',
    body: 'Electrolysis stores monsoon hydropower surplus, releasing it as hydrogen during the dry season.',
    accent: 'rgba(52,211,153,0.22)',
    hoverGlyph: 'electrolysis',
  },
]

function HoverGlyph({ kind }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-5 top-5 text-[var(--primary)] opacity-0 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-90"
      style={{ transform: 'translateZ(40px)' }}
    >
      {kind === 'h2' ? <H2Molecule size={48} /> : <ElectrolysisGlyph size={46} />}
    </div>
  )
}

function EcosystemSection() {
  return (
    <motion.section
      className="surface-cream grain relative w-full py-20 md:py-28"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <motion.div variants={riseItem} className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Green H₂ ecosystem</p>
          <h2 className="font-display mt-3 text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-[#2A1F0F] sm:text-[38px] md:text-[46px]">
            Five places hydrogen{' '}
            <span className="glow-text">moves the needle</span> for Nepal.
          </h2>
          <p className="mt-4 text-[14.5px] leading-[1.6] text-[#2A1F0F]/70 md:text-[16px]">
            Not theoretical. Each use case is mapped to specific industries, existing infrastructure,
            and people on this team who can deliver it.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-6"
        >
          {USE_CASES.map((u, i) => {
            const lgSpan = i < 3
              ? 'lg:col-span-2'
              : i === 3
                ? 'lg:col-span-2 lg:col-start-2'
                : 'lg:col-span-2 lg:col-start-4'
            return (
              <motion.div key={u.n} variants={riseItem} className={lgSpan}>
                <TiltCard max={4} className="h-full">
                  <SpotlightCard
                    glowColor={u.accent}
                    className="group h-full rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 shadow-[0_6px_20px_rgba(5,46,44,0.05)] backdrop-blur-2xl transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:border-[var(--primary)]/50 hover:shadow-[0_18px_36px_-12px_rgba(16,185,129,0.28)] md:p-6"
                  >
                    <HoverGlyph kind={u.hoverGlyph} />
                    <div className="flex items-center justify-between">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 group-hover:rotate-[-4deg]">
                        <u.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      </span>
                      <span className="font-mono tab-num text-[11px] font-medium text-[var(--muted-foreground)]">
                        № {u.n}
                      </span>
                    </div>
                    <h3 className="font-display mt-4 text-[17px] font-bold leading-[1.25] tracking-[-0.012em] text-[var(--text)] md:text-[19px]">
                      {u.title}
                    </h3>
                    <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--text)]/70 md:text-[14px]">
                      {u.body}
                    </p>
                  </SpotlightCard>
                </TiltCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default EcosystemSection
