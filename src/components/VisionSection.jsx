import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Mountain, Wind, Droplets, Flame } from 'lucide-react'
import { riseItem, staggerContainer } from '../lib/motion'
import H2Molecule from './motion/H2Molecule'
import TiltCard from './motion/TiltCard'
import ElectrolysisGlyph from './motion/ElectrolysisGlyph'

const PILLARS = [
  {
    icon: Droplets,
    title: 'Electrolysis at altitude',
    body:
      'Pilot plants in the high Himalayas convert monsoon hydroelectric surplus into storable, transportable green H₂.',
    glyph: 'electrolysis',
  },
  {
    icon: Wind,
    title: 'Energy sovereignty',
    body:
      'Replace imported fertiliser, diesel, and coal with home-produced green ammonia, hydrogen fuel cells, and heat.',
    glyph: null,
  },
  {
    icon: Flame,
    title: 'Decarbonised industry',
    body:
      'Brick kilns, cement, and heavy transport switched to hydrogen. Nepal\'s biggest emitters retooled, not retired.',
    glyph: null,
  },
  {
    icon: Mountain,
    title: 'Mountain to grid',
    body:
      'A new energy export economy. Green hydrogen, ammonia, and ammonium pellets shipped across SAARC.',
    glyph: null,
  },
]

function VisionSection() {
  const sectionRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])
  const moleculeY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const moleculeRotate = useTransform(scrollYProgress, [0, 1], [0, 30])

  return (
    <motion.section
      ref={sectionRef}
      id="vision"
      className="surface-forest grain relative w-full overflow-hidden py-16 md:py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      {/* 2D floating H2 mark, parallax-driven */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[4%] top-[8%] hidden text-[#6EE7B7]/[0.12] lg:block"
        style={{ y: moleculeY, rotate: moleculeRotate }}
      >
        <H2Molecule size={220} />
      </motion.div>

      {/* Top accent strip */}
      <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6EE7B7]/40 to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1240px] gap-12 px-5 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Image side — tilt + parallax */}
        <motion.div variants={riseItem}>
          <TiltCard
            max={5}
            className="relative overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_30px_80px_-20px_rgba(5,46,44,0.18)] backdrop-blur-2xl"
          >
            {!imgLoaded && (
              <div className="skeleton absolute inset-0" aria-hidden="true" style={{ borderRadius: 'inherit' }} />
            )}
            <motion.img
              src="/hero/hydrogen-plant.png"
              alt="Green hydrogen plant in the Nepali Himalayas at dawn"
              className="block h-full w-full object-cover"
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              style={{ y: imageY, scale: 1.08, opacity: imgLoaded ? 1 : 0, transition: 'opacity 380ms cubic-bezier(0.22,1,0.36,1)' }}
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
          </TiltCard>
        </motion.div>

        {/* Text side */}
        <div className="flex flex-col justify-center">
          <motion.p variants={riseItem} className="eyebrow">The Mission</motion.p>
          <motion.h2
            variants={riseItem}
            className="font-display mt-2 text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-[#E6F4EF] sm:text-[36px] md:text-[42px]"
          >
            From{' '}
            <span className="glow-text">monsoon water</span> to molecular fuel.
          </motion.h2>
          <motion.p
            variants={riseItem}
            className="mt-4 max-w-xl text-[14.5px] leading-[1.65] text-[#E6F4EF]/75 md:text-[15.5px]"
          >
            NGHTT is a 27-person think tank convened to give Nepal a green hydrogen strategy
            that is built, not borrowed. We map the chemistry, the policy, the capital stack,
            and the people, then submit it as a single, signed brief.
          </motion.p>

          <motion.div variants={staggerContainer} className="mt-8 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <motion.div key={p.title} variants={riseItem} className="group relative">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-0.5 group-hover:scale-110">
                  <p.icon className="h-[16px] w-[16px]" aria-hidden="true" />
                </span>
                <h3 className="font-display mt-2.5 text-[15px] font-bold leading-tight text-[#E6F4EF]">
                  {p.title}
                </h3>
                <p className="mt-1 text-[12.5px] leading-[1.55] text-[#E6F4EF]/65">
                  {p.body}
                </p>
                {/* Hover glyph: electrolysis cell that bubbles on hover */}
                {p.glyph === 'electrolysis' && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-0 text-[var(--primary)] opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:opacity-90"
                  >
                    <ElectrolysisGlyph size={42} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default VisionSection
