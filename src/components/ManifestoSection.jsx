import { motion } from 'framer-motion'
import { riseItem, staggerContainer } from '../lib/motion'

// Dark editorial break. Full-bleed forest-teal block with a single manifesto line
// and three credentials. Designed to read like a government brief, not a SaaS pitch.
function ManifestoSection() {
  return (
    <motion.section
      className="relative w-full overflow-hidden bg-[#052E2C] py-28 text-[#E6F4EF] md:py-36"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-15% 0px' }}
      variants={staggerContainer}
    >
      {/* Subtle accent washes (committed color, but contained) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 15% 30%, rgba(16, 185, 129, 0.18), transparent 65%), radial-gradient(50% 50% at 85% 75%, rgba(13, 148, 136, 0.20), transparent 65%)',
        }}
      />

      {/* Faint topographic line — single soft horizontal at the eye line */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 top-1/2 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(110,231,183,0.25) 50%, transparent 100%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <motion.p
          variants={riseItem}
          className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[#6EE7B7]"
        >
          NGHTT · National Green Hydrogen Think Tank
        </motion.p>

        <motion.h2
          variants={riseItem}
          className="font-display mt-6 max-w-[18ch] text-[44px] font-extrabold leading-[1.02] tracking-[-0.028em] [text-wrap:balance] sm:text-[60px] md:text-[88px] lg:text-[110px]"
        >
          A petition,<br />
          <span className="text-[#6EE7B7]">already half-built.</span>
        </motion.h2>

        <motion.p
          variants={riseItem}
          className="mt-8 max-w-2xl text-[15.5px] leading-[1.65] text-[#E6F4EF]/80 md:text-[17px]"
        >
          27 named experts. 11 CVs already on file. Five field applications already mapped.
          One designation request, ready to sign. This is not a proposal in the conceptual sense.
          It is a brief that the Ministry can act on tomorrow.
        </motion.p>

        {/* Three institutional credentials */}
        <motion.div
          variants={staggerContainer}
          className="mt-16 grid grid-cols-1 gap-12 border-t border-[#6EE7B7]/15 pt-12 md:grid-cols-3 md:gap-8"
        >
          {[
            { stat: 'Source-traced', label: 'Every claim links to a CV, document, or government register.' },
            { stat: 'Accountable', label: '2087 BS targets are commitments, not aspirations. Measurable.' },
            { stat: 'Pre-organised', label: 'The institution exists. We are asking for the recognition, not the building.' },
          ].map((item) => (
            <motion.div key={item.stat} variants={riseItem}>
              <div className="font-display text-[24px] font-extrabold tracking-[-0.018em] text-[#6EE7B7] md:text-[28px]">
                {item.stat}
              </div>
              <p className="mt-2 max-w-xs text-[13.5px] leading-[1.55] text-[#E6F4EF]/65">
                {item.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default ManifestoSection
