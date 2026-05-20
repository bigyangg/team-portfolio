import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import MagneticButton from '../components/motion/MagneticButton'
import { riseItem, staggerContainer } from '../lib/motion'

// ─── Data ────────────────────────────────────────────────────────────────────

const UNLOCKS = [
  {
    title: 'Trust registration',
    body: 'NGHTT legally constituted within 30 days. Bank accounts, procurement, operations begin.',
  },
  {
    title: 'University cooperation',
    body: 'KU and TU sign cooperation agreements giving NGHTT lab access immediately.',
  },
  {
    title: 'International donors',
    body: 'ADB, GCF, GGGI begin formal consideration. Designation is their prerequisite.',
  },
  {
    title: 'Private sector confidence',
    body: 'Industry partners invest alongside the programme once national status is confirmed.',
  },
]

const TRANCHES = [
  {
    label: 'T1',
    amount: 'NPR 1.50 Cr',
    description: 'Trust registered, designation order, Year 1 permits.',
    verification: 'Ministry legal team verifies trust deed.',
  },
  {
    label: 'T2',
    amount: 'NPR 3.00 Cr',
    description: 'HPC node live, Godavari site secured, electrolyzer operational.',
    verification: 'Ministry officer site inspection.',
  },
  {
    label: 'T3',
    amount: 'NPR 2.50 Cr',
    description: 'Year 1 audit filed, PINNs training begun, first journal paper.',
    verification: 'Audit report + publication confirmation.',
  },
  {
    label: 'T4',
    amount: 'NPR 2.50 Cr',
    description: 'Physical prototypes, dynamometer data, safety standards draft.',
    verification: 'Technical committee review.',
  },
  {
    label: 'T5',
    amount: 'NPR 2.34 Cr',
    description: 'Road-tested machinery, patents filed, 5+ publications, self-sustaining.',
    verification: 'Final independent audit.',
  },
]

const SUCCESS_ITEMS = [
  'Nepal owns South Asia\'s first domestic hydrogen engine IP.',
  '3–5 patents filed. Nepal collects royalties from the region.',
  'NGHTT generates NPR 25 Cr/year by Year 10.',
  'Hydrogen tractors in Terai. Fertiliser independence begins.',
  'Nepal becomes the reference model for small-nation H₂ R&D.',
]

const SHORTFALL_ITEMS = [
  'Only tranches tied to verified milestones are released.',
  'Ministry holds the release lever. No open-ended commitment.',
  'Nepal retains: trained team, HPC node, electrolyzer data.',
  'Partial programme still leaves Nepal further ahead than today.',
  'Independent annual audit. No financial surprise.',
  'Worst case: less than one infrastructure project.',
]

// ─── Component ───────────────────────────────────────────────────────────────

function SubmissionPage() {
  return (
    <>
      {/* 1. Page Hero */}
      <PageHero
        eyebrow="THE DESIGNATION REQUEST"
        title={
          <>
            One ministerial{' '}
            <span className="glow-text">designation order.</span>
          </>
        }
        intro="It costs the Ministry nothing to issue. It unlocks everything."
        breadcrumb={[{ label: 'Submission' }]}
      />

      {/* 2. The 4 Unlocks */}
      <section className="surface-mint w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-12 max-w-2xl">
            <p className="eyebrow">WHAT IT UNLOCKS</p>
            <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] md:text-[38px]">
              Four things that cannot start without it.
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {UNLOCKS.map((u, i) => (
              <motion.div
                key={u.title}
                variants={riseItem}
                className="rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-2xl"
              >
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display mt-4 text-[18px] font-bold leading-tight text-[var(--text)]">
                  {u.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.65] text-[var(--muted-foreground)]">
                  {u.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. Budget — 5-tranche disbursement — surface-cream */}
      <section className="surface-cream w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-12">
            <p className="eyebrow">THE BUDGET</p>
            <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.08] tracking-[-0.022em] md:text-[38px]">
              5-tranche disbursement. No milestone met, no next tranche released.
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-0 divide-y"
            style={{ borderColor: 'rgba(42,31,15,0.10)' }}
          >
            {/* Column headers */}
            <div className="hidden grid-cols-[80px_160px_minmax(0,1fr)_minmax(0,1fr)] gap-6 pb-3 md:grid">
              {['Tranche', 'Amount', 'Milestone', 'Verification'].map((h) => (
                <p key={h} className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(42,31,15,0.45)' }}>
                  {h}
                </p>
              ))}
            </div>

            {TRANCHES.map((t) => (
              <motion.div
                key={t.label}
                variants={riseItem}
                className="grid gap-3 py-6 md:grid-cols-[80px_160px_minmax(0,1fr)_minmax(0,1fr)] md:gap-6 md:items-start"
              >
                <p className="font-mono text-[13px] font-bold" style={{ color: '#B8542A' }}>{t.label}</p>
                <p className="font-display text-[17px] font-bold leading-tight">{t.amount}</p>
                <p className="text-[13.5px] leading-[1.6]" style={{ color: 'rgba(42,31,15,0.70)' }}>{t.description}</p>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] mb-1 md:hidden" style={{ color: 'rgba(42,31,15,0.45)' }}>Verification</p>
                  <p className="text-[13px] leading-[1.6]" style={{ color: 'rgba(42,31,15,0.55)' }}>{t.verification}</p>
                </div>
              </motion.div>
            ))}

            {/* Total row */}
            <div className="grid gap-3 py-7 md:grid-cols-[80px_160px_minmax(0,1fr)_minmax(0,1fr)] md:gap-6 md:items-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(42,31,15,0.45)' }}>Total</p>
              <p className="font-display text-[22px] font-extrabold leading-tight">NPR 11.84 Cr</p>
              <p className="text-[13.5px] leading-[1.6] md:col-span-2" style={{ color: 'rgba(42,31,15,0.55)' }}>
                Compared to traditional R&D: USD 40–50M over 8 years. This programme achieves equivalent physics in 3–5 years at a fraction of that cost.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Governance — surface-forest */}
      <section className="surface-forest w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-14 max-w-2xl">
            <p className="eyebrow">GOVERNANCE</p>
            <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] md:text-[38px]">
              The Ministry controls every rupee at every stage.
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              {
                title: 'Who controls the money',
                body: 'No milestone met, no next tranche released. The Ministry holds the lever at every stage. No open-ended commitment, no surprises. Dual signatures on every expense above NPR 1 lakh. Competitive tendering required above NPR 5 lakh. Ministry-appointed independent auditor, not NGHTT\'s.',
              },
              {
                title: 'If targets are not met',
                body: 'Loss is bounded. Only tranches tied to verified milestones are released. Nepal retains the trained team, the HPC node, and the electrolyzer data regardless of outcome.',
              },
              {
                title: 'Why it survives political change',
                body: 'Public-trust structure with perpetual succession. NGHTT does not depend on any single government, minister, or party. Institutional knowledge and IP stay in Nepal regardless of what changes in Singha Durbar.',
              },
            ].map((g) => (
              <motion.div
                key={g.title}
                variants={riseItem}
                className="rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 backdrop-blur-2xl"
              >
                <h3 className="font-display text-[18px] font-bold leading-tight text-[var(--text)]">
                  {g.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-[var(--muted-foreground)]">
                  {g.body}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. The Decision — risk-reward */}
      <section className="surface-mint w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-14 max-w-2xl">
            <p className="eyebrow">THE DECISION</p>
            <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] md:text-[38px]">
              Either way, Nepal moves forward.
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* If it succeeds */}
            <motion.div
              variants={riseItem}
              className="rounded-[20px] border p-8"
              style={{
                borderColor: 'rgba(5,150,105,0.35)',
                background: 'rgba(5,150,105,0.05)',
              }}
            >
              <p className="eyebrow text-[var(--primary)]">IF NGHTT SUCCEEDS</p>
              <ul className="mt-6 space-y-4">
                {SUCCESS_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] leading-[1.6] text-[var(--text)]/85">
                    <CheckCircle2 className="mt-[3px] h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* If it falls short */}
            <motion.div
              variants={riseItem}
              className="rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 backdrop-blur-2xl"
            >
              <p className="eyebrow">IF IT FALLS SHORT OF GOALS</p>
              <ul className="mt-6 space-y-4">
                {SHORTFALL_ITEMS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] leading-[1.6] text-[var(--muted-foreground)]">
                    <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)]/50" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>

          {/* Closing line */}
          <motion.p
            variants={riseItem}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-14 max-w-3xl text-[16px] font-semibold leading-[1.6] text-[var(--text)] md:text-[18px]"
          >
            The cost of inaction, another decade of dependency, is far higher than the cost of beginning.
          </motion.p>

          <motion.div
            variants={riseItem}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mt-8"
          >
            <MagneticButton as="a" href="/team" className="btn btn-primary">
              Meet the team behind this proposal
            </MagneticButton>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default SubmissionPage
