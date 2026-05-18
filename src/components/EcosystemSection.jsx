import { motion } from 'framer-motion'
import { Truck, Wheat, Flame, Battery, Sprout, ArrowUpRight } from 'lucide-react'
import { riseItem, staggerContainer } from '../lib/motion'
import SpotlightCard from './motion/SpotlightCard'

const LEAD = {
  n: '01',
  icon: Wheat,
  title: 'Agricultural Mechanization',
  body: 'Hydrogen tractor retrofit kits replace diesel across the Terai region. Cleaner air, lower input costs, and the first concrete win Nepali farmers will feel.',
  pull: '3.2M',
  pullLabel: 'farmers in the Terai who depend on diesel mechanisation today.',
  accent: 'rgba(16,185,129,0.28)',
}

const SUPPORTING = [
  {
    n: '02',
    icon: Sprout,
    title: 'Fertilizer Sovereignty',
    body: 'Green ammonia for urea production ends Nepal\'s import dependency.',
    accent: 'rgba(45,212,191,0.22)',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Heavy Transport',
    body: 'Fuel cells power long-haul SAARC freight, replacing imported diesel.',
    accent: 'rgba(110,231,183,0.22)',
  },
  {
    n: '04',
    icon: Flame,
    title: 'Industrial Heat',
    body: 'Hydrogen combustion replaces coal in brick kilns and cement plants.',
    accent: 'rgba(20,184,166,0.22)',
  },
  {
    n: '05',
    icon: Battery,
    title: 'Energy Storage',
    body: 'Electrolysis stores monsoon hydropower surplus for the dry season.',
    accent: 'rgba(52,211,153,0.22)',
  },
]

function EcosystemSection() {
  return (
    <motion.section
      className="relative w-full py-20 md:py-28"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <motion.div variants={riseItem} className="max-w-3xl">
          <p className="eyebrow">Green H₂ ecosystem</p>
          <h2 className="font-display mt-3 text-[32px] font-extrabold leading-[1.04] tracking-[-0.022em] text-[var(--text)] sm:text-[44px] md:text-[60px]">
            Five places hydrogen{' '}
            <span className="glow-text">moves the needle</span>.
          </h2>
          <p className="mt-5 text-[14.5px] leading-[1.6] text-[var(--text)]/75 md:text-[16px]">
            Not theoretical. Each use case is mapped to specific industries, existing infrastructure,
            and people on this team who can deliver it.
          </p>
        </motion.div>

        {/* Asymmetric layout: 1 large lead card + 4 supporting in 2x2 */}
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6">
          {/* Lead — spans 3 of 5 columns, image-heavy treatment */}
          <motion.div variants={riseItem} className="lg:col-span-3">
            <SpotlightCard
              glowColor={LEAD.accent}
              glowSize={420}
              className="group relative h-full overflow-hidden rounded-[22px] border border-[var(--glass-border)] bg-gradient-to-br from-[var(--glass-bg-strong)] to-[var(--glass-bg)] p-7 shadow-[0_8px_28px_rgba(5,46,44,0.06)] backdrop-blur-2xl transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:border-[var(--primary)]/50 hover:shadow-[0_24px_60px_-12px_rgba(16,185,129,0.32)] md:p-10"
            >
              <div className="relative flex h-full flex-col justify-between gap-10">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 group-hover:rotate-[-5deg]">
                      <LEAD.icon className="h-[22px] w-[22px]" aria-hidden="true" />
                    </span>
                    <span className="font-mono tab-num text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Lead application · № {LEAD.n}
                    </span>
                  </div>

                  <h3 className="font-display mt-6 text-[26px] font-extrabold leading-[1.1] tracking-[-0.018em] text-[var(--text)] md:text-[34px]">
                    {LEAD.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-[14.5px] leading-[1.6] text-[var(--text)]/75 md:text-[16px]">
                    {LEAD.body}
                  </p>
                </div>

                {/* Pull stat — editorial weight */}
                <div className="flex items-end gap-6 border-t border-[var(--surface-rule)] pt-6">
                  <div className="font-display tab-num text-[64px] font-extrabold leading-none tracking-[-0.04em] text-[var(--primary)] md:text-[88px]">
                    {LEAD.pull}
                  </div>
                  <p className="pb-2 max-w-xs text-[12.5px] leading-[1.5] text-[var(--text)]/65 md:text-[13.5px]">
                    {LEAD.pullLabel}
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Supporting — 2x2 grid in the remaining 2 columns */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-1 xl:grid-cols-2"
          >
            {SUPPORTING.map((u) => (
              <motion.div key={u.n} variants={riseItem}>
                <SpotlightCard
                  glowColor={u.accent}
                  className="group h-full rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 shadow-[0_6px_20px_rgba(5,46,44,0.05)] backdrop-blur-2xl transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-1 hover:border-[var(--primary)]/50 hover:shadow-[0_18px_36px_-12px_rgba(16,185,129,0.28)]"
                >
                  <div className="flex items-start justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 group-hover:rotate-[-4deg]">
                      <u.icon className="h-[16px] w-[16px]" aria-hidden="true" />
                    </span>
                    <span className="font-mono tab-num text-[10.5px] font-medium text-[var(--muted-foreground)]">
                      № {u.n}
                    </span>
                  </div>
                  <h3 className="font-display mt-3.5 text-[15.5px] font-bold leading-[1.25] tracking-[-0.012em] text-[var(--text)] md:text-[16.5px]">
                    {u.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.5] text-[var(--text)]/70">
                    {u.body}
                  </p>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default EcosystemSection
