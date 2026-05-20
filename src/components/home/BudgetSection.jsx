import { motion } from 'framer-motion'
import { riseItem, staggerContainer } from '../../lib/motion'

const TRANCHES = [
  {
    id: 'T1',
    amount: 'NPR 1.50 Cr',
    milestone: 'Trust registered, designation order, Year 1 permits',
  },
  {
    id: 'T2',
    amount: 'NPR 3.00 Cr',
    milestone: 'HPC node live, Godavari site secured, electrolyzer operational',
  },
  {
    id: 'T3',
    amount: 'NPR 2.50 Cr',
    milestone: 'Year 1 audit filed, PINNs training begun, first journal paper',
  },
  {
    id: 'T4',
    amount: 'NPR 2.50 Cr',
    milestone: 'Physical prototypes, dynamometer data, safety standards draft',
  },
  {
    id: 'T5',
    amount: 'NPR 2.34 Cr',
    milestone: 'Road-tested machinery, patents filed, 5+ publications, self-sustaining',
  },
]

export default function BudgetSection() {
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
          <p className="eyebrow">THE MONEY</p>
          <h2 className="font-display mt-2 max-w-2xl text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--text)] md:text-[40px]">
            NPR 11.84 Crore, released only as{' '}
            <span className="glow-text">milestones are met.</span>
          </h2>
          <p className="mt-4 max-w-xl text-[14px] leading-[1.65] text-[var(--text)]/70 md:text-[15px]">
            Not a lump-sum grant. Five tranches tied to verified outcomes. The Ministry holds the lever at every stage.
          </p>
        </motion.div>

        <motion.div variants={riseItem} className="overflow-hidden rounded-[18px] border border-[var(--glass-border)]">
          <table className="w-full text-left text-[13.5px] md:text-[14.5px]">
            <thead>
              <tr className="border-b border-[var(--surface-rule-soft)] bg-[var(--glass-bg-strong)]">
                <th className="px-5 py-3.5 font-mono text-[11px] font-bold tracking-[0.12em] text-[var(--text)]/50 uppercase md:px-7">
                  Tranche
                </th>
                <th className="px-5 py-3.5 font-mono text-[11px] font-bold tracking-[0.12em] text-[var(--text)]/50 uppercase md:px-7">
                  Amount
                </th>
                <th className="px-5 py-3.5 font-mono text-[11px] font-bold tracking-[0.12em] text-[var(--text)]/50 uppercase md:px-7">
                  Milestone to unlock
                </th>
              </tr>
            </thead>
            <tbody>
              {TRANCHES.map((t, i) => (
                <tr
                  key={t.id}
                  className={[
                    'border-b border-[var(--surface-rule-soft)] transition-colors',
                    i % 2 === 0 ? 'bg-[var(--glass-bg)]' : 'bg-transparent',
                    'last:border-0',
                  ].join(' ')}
                >
                  <td className="px-5 py-4 md:px-7">
                    <span className="font-mono text-[13px] font-bold tracking-[0.08em] text-[var(--primary)]">
                      {t.id}
                    </span>
                  </td>
                  <td className="tab-num whitespace-nowrap px-5 py-4 font-semibold text-[var(--text)] md:px-7">
                    {t.amount}
                  </td>
                  <td className="px-5 py-4 leading-[1.55] text-[var(--text)]/75 md:px-7">
                    {t.milestone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.p
          variants={riseItem}
          className="mt-5 text-[12.5px] text-[var(--text)]/50 md:text-[13px]"
        >
          Compared to traditional R&D: USD 40–50M, 8 years.
        </motion.p>
      </div>
    </motion.section>
  )
}
