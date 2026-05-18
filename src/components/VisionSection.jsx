import { motion } from 'framer-motion'
import { Mountain, Wind, Droplets, Flame } from 'lucide-react'
import { riseItem, staggerContainer } from '../lib/motion'

const PILLARS = [
  {
    icon: Droplets,
    title: 'Electrolysis at altitude',
    body:
      'Pilot plants in the high Himalayas convert monsoon hydroelectric surplus into storable, transportable green H₂.',
  },
  {
    icon: Wind,
    title: 'Energy sovereignty',
    body:
      'Replace imported fertiliser, diesel, and coal with home-produced green ammonia, hydrogen fuel cells, and heat.',
  },
  {
    icon: Flame,
    title: 'Decarbonised industry',
    body:
      'Brick kilns, cement, and heavy transport switched to hydrogen. Nepal\'s biggest emitters retooled, not retired.',
  },
  {
    icon: Mountain,
    title: 'Mountain to grid',
    body:
      'A new energy export economy. Green hydrogen, ammonia, and ammonium pellets shipped across SAARC.',
  },
]

// Floating H₂ mark — sits behind the section, drifts slowly.
function FloatingH2() {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute right-[6%] top-[14%] hidden font-display text-[200px] font-extrabold leading-none tracking-[-0.04em] text-[var(--primary)]/[0.04] lg:block xl:text-[260px]"
      animate={{ y: [0, -14, 0], rotate: [0, 1.5, 0] }}
      transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
    >
      H<span className="text-[0.55em] align-baseline">2</span>
    </motion.div>
  )
}

function VisionSection() {
  return (
    <motion.section
      id="vision"
      className="relative w-full overflow-hidden py-24 md:py-32"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      <FloatingH2 />

      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Image side */}
        <motion.div
          variants={riseItem}
          className="relative overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_30px_80px_-20px_rgba(5,46,44,0.18)] backdrop-blur-2xl"
        >
          <img
            src="/hero/hydrogen-plant.png"
            alt="Green hydrogen plant in the Nepali Himalayas at dawn"
            className="block h-full w-full object-cover"
            loading="lazy"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(165deg, transparent 55%, rgba(16, 185, 129, 0.12) 100%)',
            }}
          />
          <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-3 py-1.5 backdrop-blur-xl">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)] pulse-dot" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text)]/80">
              Concept · NGHTT 2082
            </span>
          </div>
        </motion.div>

        {/* Text side */}
        <div className="flex flex-col justify-center">
          <motion.p variants={riseItem} className="eyebrow">The Mission</motion.p>
          <motion.h2
            variants={riseItem}
            className="font-display mt-2 text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] sm:text-[36px] md:text-[42px]"
          >
            From{' '}
            <span className="glow-text">monsoon water</span> to molecular fuel.
          </motion.h2>
          <motion.p
            variants={riseItem}
            className="mt-4 max-w-xl text-[14.5px] leading-[1.65] text-[var(--text)]/75 md:text-[15.5px]"
          >
            NGHTT is a 27-person think tank convened to give Nepal a green hydrogen strategy
            that is built, not borrowed. We map the chemistry, the policy, the capital stack,
            and the people, then submit it as a single, signed brief.
          </motion.p>

          <motion.div variants={staggerContainer} className="mt-8 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <motion.div key={p.title} variants={riseItem} className="group">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-0.5">
                  <p.icon className="h-[16px] w-[16px]" aria-hidden="true" />
                </span>
                <h3 className="font-display mt-2.5 text-[15px] font-bold leading-tight text-[var(--text)]">
                  {p.title}
                </h3>
                <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--text)]/65">
                  {p.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default VisionSection
