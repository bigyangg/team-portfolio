import { motion } from 'framer-motion'
import { riseItem, staggerContainer } from '../../lib/motion'

const COLUMNS = [
  {
    num: '01',
    title: "Nepal's problem",
    body: "Imported fuel. Imported fertiliser. Imported technology. Nepal pays foreign countries for energy it has the means to produce, and has no sovereign technology to break the cycle.",
  },
  {
    num: '02',
    title: 'The opportunity',
    body: 'Hydropower surplus. AI that compresses time. No competitor yet. The raw material costs almost nothing. AI eliminates the physical-iteration cycle. South Asia has no hydrogen-engine IP holder yet.',
  },
  {
    num: '03',
    title: 'The ask',
    body: 'One ministerial designation order. No cost. Unlocks everything. A single Ministry order, costs nothing to issue, triggers university cooperation, donor confidence, and private investment in lockstep.',
  },
]

export default function SummaryBlock() {
  return (
    <motion.section
      className="surface-cream relative w-full border-b border-[var(--surface-rule-soft)]"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-10 md:py-28">
        <motion.div variants={riseItem} className="mb-10 md:mb-14">
          <p className="eyebrow">READ IN 60 SECONDS</p>
          <h2 className="font-display mt-2 max-w-2xl text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--text)] md:text-[40px]">
            Three ideas. <span className="glow-text">One designation order.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-[1.65] text-[var(--text)]/70 md:text-[15px]">
            A national platform for Nepal's green hydrogen, defined in one page so every minister starts from the same map.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-6 md:grid-cols-3 md:gap-8"
        >
          {COLUMNS.map((col) => (
            <motion.div
              key={col.num}
              variants={riseItem}
              className="rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-2xl md:p-7"
            >
              <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-[var(--primary)]">
                {col.num}
              </span>
              <h3 className="font-display mt-3 text-[19px] font-bold leading-[1.18] tracking-[-0.012em] text-[var(--text)] md:text-[21px]">
                {col.title}
              </h3>
              <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--text)]/70">
                {col.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
