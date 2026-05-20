import { motion } from 'framer-motion'
import { Brain, Cpu, Database, Layers, Wrench } from 'lucide-react'
import PageHero from '../components/ui/PageHero'
import MagneticButton from '../components/motion/MagneticButton'
import { riseItem, staggerContainer } from '../lib/motion'

// ─── Data ────────────────────────────────────────────────────────────────────

const OPPORTUNITIES = [
  {
    stat: '200–500%',
    label: 'Hydroelectric surplus',
    body: 'Surplus during wet season (Jun–Sep). Nepal generates more electricity than it currently uses. Green hydrogen is made by passing electricity through water, so Nepal has the cheapest possible feedstock sitting idle.',
  },
  {
    stat: '3–5 yrs',
    label: 'AI compresses time',
    body: 'What used to require 15 years of R&D now takes 3–5 years. Free, open-source AI tools simulate 1,000+ engine designs virtually before a single piece of metal is cut. What took Toyota 8 years and USD 40M now takes 5 years and NPR 12 Crore.',
  },
  {
    stat: '0',
    label: 'No competition yet',
    body: 'South Asian nations own domestically-designed hydrogen engine technology. India, Bangladesh, Sri Lanka — none. The nation that files patents first controls licensing revenue from the entire region for decades.',
  },
]

const MILESTONES = [
  {
    year: 'Y1',
    label: 'Foundation',
    body: 'HPC node live. Godavari electrolyzer running. Team trained. Stakeholder registry built. Baseline data collected.',
  },
  {
    year: 'Y2',
    label: 'Simulation',
    body: '500+ virtual engine designs generated. 2–3 peer-reviewed papers. Green ammonia feasibility study.',
  },
  {
    year: 'Y3',
    label: 'Prototyping',
    body: 'First 3D-printed Inconel 718 engine parts. Dyno data published. H₂ safety standards draft submitted to Ministry.',
  },
  {
    year: 'Y4',
    label: 'Field Testing',
    body: 'Tractor retrofit kits field-tested in Terai. 5+ cumulative publications. Zone V H₂ tanks certified.',
  },
  {
    year: 'Y5',
    label: 'Own It',
    body: 'Road-tested H₂ machinery. Patents filed. NGHTT self-funding via IP licensing.',
  },
]

const AI_CAPABILITIES = [
  {
    icon: Brain,
    title: 'Physics-Informed Neural Networks',
    body: 'Networks that respect physics by design. The model carries conservation laws in its loss function so it cannot drift from real-world physics.',
  },
  {
    icon: Cpu,
    title: 'Generative Engine Design',
    body: 'Geometries written as code, not modelled by hand. The AI generates 1,000+ valid configurations in days, not months.',
  },
  {
    icon: Database,
    title: 'High-Performance Computing',
    body: 'Dual H100 GPUs run thousands of simulations. 100M+ mesh cells per chamber, swept across the full design space.',
  },
  {
    icon: Layers,
    title: 'Virtual Simulation Library',
    body: '1,000+ configurations explored without metal. Only the winning geometry ever gets machined.',
  },
  {
    icon: Wrench,
    title: 'HydraNet Intranet AI',
    body: 'Every dataset, design, and result stays in Nepal. No cloud, no foreign server. IP stays sovereign forever.',
  },
]

const RISKS = [
  {
    risk: 'Dry-season collapse',
    detail: 'Electrolyzer drops below 20% load and model loses accuracy.',
    tripwire: 'Model 2 forecast vs KU log RMSE checked before Phase 2 release.',
  },
  {
    risk: 'Data gap from KU',
    detail: 'Runtime logs incomplete.',
    tripwire: '90-day data SLA in MoU; supplemented with open "The Well" dataset.',
  },
  {
    risk: 'Hydrogen embrittlement',
    detail: 'Engine parts crack under H₂ exposure.',
    tripwire: 'Inconel 718 / SS 316L material spec enforced from design stage; dyno cycle testing before field trial.',
  },
  {
    risk: 'NOx and backfire',
    detail: "H₂'s low ignition energy and high flame temp create safety hazards.",
    tripwire: 'ATEX-certified handling; lean-burn injection encoded in design loop.',
  },
  {
    risk: 'HPC import delay',
    detail: 'Customs holds H100 GPUs.',
    tripwire: 'Customs exemption petition filed under 2082/83 green-hydrogen waiver; cloud-burst contingency.',
  },
  {
    risk: 'Political turnover',
    detail: 'Cabinet reshuffle pauses funding.',
    tripwire: 'Public-trust structure with perpetual succession; tranche-tied funding survives elections.',
  },
]

const COMPARISONS = [
  { org: 'Toyota GR H₂ Programme', cost: 'USD 40–50M', duration: '8 years' },
  { org: 'KPIT India H₂ Retrofit', cost: 'USD 8–12M per variant', duration: 'Ongoing' },
  { org: 'NGHTT', cost: 'NPR 11.84 Cr (~USD 883–923K)', duration: '3–5 years' },
]

// ─── Component ───────────────────────────────────────────────────────────────

function AboutPage() {
  return (
    <>
      {/* 1. Page Hero */}
      <PageHero
        eyebrow="ABOUT NGHTT"
        title={
          <>
            A petition the Ministry can{' '}
            <span className="glow-text">act on tomorrow.</span>
          </>
        }
        intro="NGHTT is a nationally designated public trust that uses Nepal's hydroelectric surplus and AI-driven engineering to develop hydrogen technology Nepal owns. Not licenses, not imports. Owns."
        breadcrumb={[{ label: 'About' }]}
      />

      {/* 2. The Opportunity — surface-cream */}
      <section className="surface-cream w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-14 max-w-2xl">
            <p className="eyebrow">THE OPPORTUNITY</p>
            <h2 className="font-display mt-3 text-[30px] font-bold leading-[1.08] tracking-[-0.022em] md:text-[42px]">
              Three structural advantages that will not last forever.
            </h2>
          </div>

          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-0 divide-y divide-[var(--surface-rule)]"
          >
            {OPPORTUNITIES.map((o) => (
              <motion.li
                key={o.label}
                variants={riseItem}
                className="grid gap-6 py-10 md:grid-cols-[180px_minmax(0,1fr)] md:gap-14"
              >
                <div>
                  <p
                    className="font-display text-[44px] font-extrabold leading-none tracking-[-0.03em] md:text-[56px]"
                    style={{ color: '#B8542A' }}
                  >
                    {o.stat}
                  </p>
                  <p className="font-display mt-2 text-[15px] font-bold leading-tight">
                    {o.label}
                  </p>
                </div>
                <p className="text-[14.5px] leading-[1.7] md:text-[16px]" style={{ color: 'var(--muted-foreground)' }}>
                  {o.body}
                </p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* 3. 5-Year Plan — surface-forest */}
      <section className="surface-forest w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-14 max-w-2xl">
            <p className="eyebrow">5-YEAR PLAN</p>
            <h2 className="font-display mt-3 text-[30px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] md:text-[42px]">
              Five milestones. Each one verifiable.
            </h2>
          </div>

          <motion.ol
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="relative space-y-0"
          >
            {/* Rail */}
            <div
              aria-hidden="true"
              className="absolute left-[22px] top-0 hidden h-full w-px md:block"
              style={{ background: 'linear-gradient(to bottom, #6EE7B7, transparent)' }}
            />

            {MILESTONES.map((m, i) => (
              <motion.li
                key={m.label}
                variants={riseItem}
                className="relative grid gap-5 border-b border-[var(--surface-rule)] py-8 md:grid-cols-[88px_minmax(0,1fr)] md:gap-10"
              >
                <div className="flex items-center gap-3 md:flex-col md:items-start md:gap-1">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] font-mono text-[12px] font-bold text-[#6EE7B7] backdrop-blur-xl">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)] md:pl-1">
                    {m.year}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-[20px] font-bold leading-tight text-[var(--text)] md:text-[22px]">
                    {m.label}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-[var(--muted-foreground)] md:text-[15px]">
                    {m.body}
                  </p>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </section>

      {/* 4. AI & PINNs deep-dive — surface-mint */}
      <section className="surface-mint w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-14 max-w-3xl">
            <p className="eyebrow">AI & INNOVATION</p>
            <h2 className="font-display mt-3 text-[30px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] md:text-[42px]">
              Compressing{' '}
              <span className="glow-text">15 years into 3–5.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-[14.5px] leading-[1.7] text-[var(--muted-foreground)] md:text-[16px]">
              Physical prototyping is slow because each test costs metal, machining, and a quarter of calendar time. AI lets us test the design space in software, where iterations are free, and only fabricate the winners.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {AI_CAPABILITIES.map((cap, i) => (
              <motion.article
                key={cap.title}
                variants={riseItem}
                className={`rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/60${i === 4 ? ' md:col-span-2 lg:col-span-1' : ''}`}
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl">
                  <cap.icon className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <h3 className="font-display mt-5 text-[19px] font-bold leading-tight tracking-[-0.015em] text-[var(--text)]">
                  {cap.title}
                </h3>
                <p className="mt-2.5 text-[13.5px] leading-[1.65] text-[var(--muted-foreground)]">
                  {cap.body}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Edge Cases / Risks — surface-mint */}
      <section className="surface-mint w-full pb-20 md:pb-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-10 border-t border-[var(--surface-rule)] pt-16">
            <p className="eyebrow">RISK REGISTER</p>
            <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--text)] md:text-[38px]">
              What could go wrong, and how we catch it early.
            </h2>
            <p className="mt-3 max-w-2xl text-[14.5px] leading-[1.7] text-[var(--muted-foreground)] md:text-[16px]">
              Every milestone has a fail-state. Each one has a tripwire before the next tranche releases.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            className="space-y-0 divide-y divide-[var(--surface-rule)]"
          >
            {RISKS.map((r) => (
              <motion.div
                key={r.risk}
                variants={riseItem}
                className="grid gap-4 py-7 md:grid-cols-[200px_minmax(0,1fr)_minmax(0,1fr)] md:gap-8"
              >
                <div>
                  <p className="font-display text-[15px] font-bold text-[var(--text)]">{r.risk}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted-foreground)] mb-1.5">Risk</p>
                  <p className="text-[13.5px] leading-[1.6] text-[var(--muted-foreground)]">{r.detail}</p>
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--primary)] mb-1.5">Tripwire</p>
                  <p className="text-[13.5px] leading-[1.6] text-[var(--muted-foreground)]">{r.tripwire}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. Toyota / KPIT Comparison — surface-cream */}
      <section className="surface-cream w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-12">
            <p className="eyebrow">COST COMPARISON</p>
            <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.1] tracking-[-0.02em] md:text-[38px]">
              Same physics, different economics.
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Table header */}
            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-6 pb-3 md:grid">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(42,31,15,0.45)' }}>Organisation</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(42,31,15,0.45)' }}>Cost</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'rgba(42,31,15,0.45)' }}>Duration</p>
            </div>

            <div className="divide-y" style={{ borderColor: 'rgba(42,31,15,0.10)' }}>
              {COMPARISONS.map((c, i) => (
                <motion.div
                  key={c.org}
                  variants={riseItem}
                  className={`grid gap-2 py-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] md:gap-6 md:items-center${i === COMPARISONS.length - 1 ? ' rounded-[14px] px-4' : ''}`}
                  style={
                    i === COMPARISONS.length - 1
                      ? { background: 'rgba(42,31,15,0.05)', marginLeft: '-16px', marginRight: '-16px' }
                      : {}
                  }
                >
                  <p className="font-display text-[16px] font-bold leading-tight md:text-[18px]">
                    {c.org}
                    {i === COMPARISONS.length - 1 && (
                      <span className="ml-2 inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide" style={{ background: 'rgba(184,84,42,0.12)', color: '#B8542A' }}>
                        This proposal
                      </span>
                    )}
                  </p>
                  <p className="font-display text-[15px] font-semibold md:text-[17px]">{c.cost}</p>
                  <p className="text-[14px]" style={{ color: 'rgba(42,31,15,0.60)' }}>{c.duration}</p>
                </motion.div>
              ))}
            </div>

            <motion.p variants={riseItem} className="mt-8 max-w-2xl text-[13.5px] leading-[1.65]" style={{ color: 'rgba(42,31,15,0.55)' }}>
              Cost reduction is possible because AI eliminates physical iteration before metal is ever cut.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto mb-16 w-full max-w-[1240px] px-5 md:px-10">
        <div className="relative overflow-hidden rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-8 backdrop-blur-2xl md:p-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 80% at 100% 50%, rgba(110,231,183,0.22), transparent 60%)',
            }}
          />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-[24px] font-bold leading-[1.1] tracking-[-0.018em] text-[var(--text)] md:text-[32px]">
                See the designation request.
              </h2>
              <p className="mt-2 max-w-xl text-[14.5px] leading-[1.6] text-[var(--muted-foreground)]">
                One ministerial order. No budget allocation, no staffing, no recurring cost.
              </p>
            </div>
            <MagneticButton as="a" href="/submission" className="btn btn-primary shrink-0">
              View the submission
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutPage
