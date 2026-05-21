import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Shield, Cpu, Lock, TrendingUp } from 'lucide-react'
import { riseItem, staggerContainer } from '../lib/motion'
import H2Molecule from './motion/H2Molecule'
import ElectrolysisGlyph from './motion/ElectrolysisGlyph'

// The four NGHTT pillars, sourced verbatim from slide 5 of the proposal.
const PILLARS = [
  {
    icon: Shield,
    title: 'Sovereign Trust',
    body:
      'Public trust under Nepal law. Protected from political cycles. IP stays in Nepal forever.',
    glyph: null,
  },
  {
    icon: Cpu,
    title: 'AI-First R&D',
    body:
      'Physics-informed neural networks simulate thousands of designs virtually. 15-year R&D compressed to 5.',
    glyph: 'electrolysis',
  },
  {
    icon: Lock,
    title: 'Intranet-Sovereign',
    body:
      'HydraNet AI runs on Nepal\'s intranet. No cloud, no foreign server. Every dataset stays in Nepal.',
    glyph: null,
  },
  {
    icon: TrendingUp,
    title: 'Self-Funding by Y5',
    body:
      'IP licensing and research services generate NPR 25 Cr/yr by Y10. Zero recurring cost to the Ministry.',
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
  const imageY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const moleculeY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  const moleculeRotate = useTransform(scrollYProgress, [0, 1], [0, 20])

  return (
    <motion.section
      ref={sectionRef}
      id="vision"
      className="surface-forest grain relative w-full overflow-hidden py-20 md:py-28"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      {/* Drifting H2 mark — softer, further back */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-3%] top-[6%] hidden text-[#6EE7B7]/[0.08] lg:block"
        style={{ y: moleculeY, rotate: moleculeRotate }}
      >
        <H2Molecule size={260} />
      </motion.div>

      {/* Top + bottom accent strips for section framing */}
      <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6EE7B7]/35 to-transparent" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6EE7B7]/20 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1180px] px-5 md:px-10">
        {/* Section header — single column, anchors the section before the split */}
        <motion.div variants={riseItem} className="mx-auto max-w-2xl text-center md:mb-16">
          <p className="eyebrow">The Mission</p>
          <h2 className="font-display mt-3 text-[30px] font-bold leading-[1.05] tracking-[-0.022em] text-[#E6F4EF] sm:text-[40px] md:text-[48px]">
            Hydrogen technology Nepal{' '}
            <span className="glow-text">owns</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[14.5px] leading-[1.65] text-[#E6F4EF]/70 md:text-[16px]">
            NGHTT is a nationally designated public trust. It uses Nepal's hydroelectric surplus
            and AI-driven engineering to develop hydrogen technology Nepal owns. Not licenses,
            not imports.
          </p>
        </motion.div>

        {/* Two-column split: image left, pillar grid right */}
        <div className="mt-10 grid gap-10 md:mt-0 lg:grid-cols-[5fr_6fr] lg:items-center lg:gap-14">
          {/* Image card — fixed portrait aspect so the mountain stays composed */}
          <motion.div variants={riseItem} className="relative">
            <div
              className="relative overflow-hidden rounded-[24px] border border-[#6EE7B7]/20 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(110,231,183,0.10)]"
              style={{ aspectRatio: '4 / 5' }}
            >
              {!imgLoaded && (
                <div className="skeleton absolute inset-0" aria-hidden="true" />
              )}
              <motion.img
                src="/hero/hydrogen-plant.png"
                alt="Green hydrogen plant in the Nepali Himalayas at dawn"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                onLoad={() => setImgLoaded(true)}
                style={{
                  y: imageY,
                  scale: 1.05,
                  objectPosition: 'center 30%',
                  opacity: imgLoaded ? 1 : 0,
                  transition: 'opacity 380ms cubic-bezier(0.22,1,0.36,1)',
                }}
              />
              {/* Bottom gradient for label legibility */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(5, 46, 44, 0.45) 60%, rgba(5, 46, 44, 0.85) 100%)',
                }}
              />
              {/* Concept tag pinned bottom-left */}
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.22em] text-[#6EE7B7]/90">
                    Concept · 2082 BS
                  </p>
                  <p className="font-display mt-1 text-[14.5px] font-bold leading-tight text-white">
                    Godavari pilot site
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 backdrop-blur-md">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#6EE7B7] pulse-dot" aria-hidden="true" />
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-white">
                    Live
                  </span>
                </span>
              </div>
            </div>
          </motion.div>

          {/* Pillar grid — 2x2 cards on right column */}
          <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.title}
                variants={riseItem}
                className="group relative overflow-hidden rounded-2xl border border-[#6EE7B7]/15 bg-[#0c2a26]/40 p-5 backdrop-blur-md transition-[border-color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:border-[#6EE7B7]/45 hover:shadow-[0_18px_40px_-12px_rgba(110,231,183,0.20)]"
              >
                {/* Number tick */}
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#6EE7B7]/70">
                  №&nbsp;0{i + 1}
                </span>
                <div className="mt-3 flex items-start gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#6EE7B7]/25 bg-[#6EE7B7]/[0.08] text-[#6EE7B7] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110 group-hover:rotate-[-4deg]">
                    <p.icon className="h-[16px] w-[16px]" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[15.5px] font-bold leading-tight tracking-[-0.012em] text-[#E6F4EF]">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#E6F4EF]/65">
                      {p.body}
                    </p>
                  </div>
                </div>
                {/* Hover glyph for the AI-First R&D card */}
                {p.glyph === 'electrolysis' && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-3 text-[#6EE7B7] opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:opacity-70"
                  >
                    <ElectrolysisGlyph size={38} />
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
