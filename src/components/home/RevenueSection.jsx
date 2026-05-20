import { motion } from 'framer-motion'
import { riseItem, staggerContainer } from '../../lib/motion'

const REVENUE_LINES = [
  {
    name: 'Production and Marketing Hub',
    figure: 'NPR 12 Cr/yr',
    qualifier: 'by Y10',
    body: "Made-in-Nepal retrofit kits. NGHTT-licensed retrofit kits and combustion components manufactured in-country and marketed regionally through agriculture cooperatives and brick-kiln associations.",
  },
  {
    name: 'Design Patents',
    figure: 'NPR 8 Cr/yr',
    qualifier: 'by Y10',
    body: "Nepal-filed engine IP. Patents on engine geometries, chamber designs, and AI training methods, licensed to manufacturers in India, Bangladesh, Sri Lanka and beyond.",
  },
  {
    name: 'Alternative Use Cases',
    figure: 'NPR 5 Cr/yr',
    qualifier: 'by Y10',
    body: "PINN-as-a-service. The same simulation stack applied to ammonia reactors, biogas turbines, and cement-kiln efficiency for paid industrial partners.",
  },
]

export default function RevenueSection() {
  return (
    <motion.section
      className="surface-mint relative w-full border-b border-[var(--surface-rule-soft)]"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-10 md:py-28">
        <motion.div variants={riseItem} className="mb-10 md:mb-14">
          <p className="eyebrow">SELF-SUSTAINING FUTURE</p>
          <h2 className="font-display mt-2 max-w-2xl text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--text)] md:text-[40px]">
            Three revenue lines keep NGHTT funded after{' '}
            <span className="glow-text">Year 5.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-[1.65] text-[var(--text)]/70 md:text-[15px]">
            ~NPR 25 Cr/year of self-generated revenue by Year 10. The Ministry's grant is seed capital, not a recurring line item.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-5 md:grid-cols-3 md:gap-6"
        >
          {REVENUE_LINES.map((line) => (
            <motion.div
              key={line.name}
              variants={riseItem}
              className="rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-2xl md:p-7"
            >
              <div className="mb-4 border-b border-[var(--surface-rule-soft)] pb-4">
                <div className="font-display tab-num text-[32px] font-extrabold leading-none tracking-[-0.03em] text-[var(--primary)] md:text-[38px]">
                  {line.figure}
                </div>
                <div className="mt-1 text-[12px] font-semibold tracking-[0.06em] text-[var(--text)]/50 uppercase">
                  {line.qualifier}
                </div>
              </div>
              <h3 className="font-display text-[17px] font-bold leading-[1.2] tracking-[-0.01em] text-[var(--text)]">
                {line.name}
              </h3>
              <p className="mt-2 text-[13px] leading-[1.65] text-[var(--text)]/70">
                {line.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
