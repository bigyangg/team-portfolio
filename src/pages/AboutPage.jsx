import {
  GitBranch,
  Microscope,
  Shield,
  Lock,
  GraduationCap,
  Globe2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import PageHero from '../components/ui/PageHero'

const OBJECTIVES = [
  {
    icon: GitBranch,
    title: 'Institutional Integration',
    body: 'End the fragmentation of Nepal’s hydrogen efforts under one nationally designated coordination platform.',
    milestones: [
      'National Hydrogen Stakeholder Registry · Year 1',
      'First National Hydrogen Coordination Workshop · 18 months',
      'Single international point of contact',
    ],
  },
  {
    icon: Microscope,
    title: 'Physical Technology Development',
    body: 'Design and fabricate Nepal’s first domestically engineered hydrogen technology using AI-accelerated tools.',
    milestones: [
      'Green Hydrogen Laboratory operational · Year 1',
      'PINN models trained · Year 2',
      '3D-printed engine prototypes · Year 3',
      'Field-tested machinery · Year 5',
    ],
  },
  {
    icon: Shield,
    title: 'National Standards & Regulation',
    body: 'Draft national hydrogen safety standards, certification, and technical guidelines submitted for Ministry adoption.',
    milestones: [
      'H₂ safety + handling standards · Year 3',
      'H₂ equipment import certification · Year 3',
      'Provincial project guidelines · Year 4',
    ],
  },
  {
    icon: Lock,
    title: 'Intellectual Property Sovereignty',
    body: 'All NGHTT-funded research, designs, algorithms, and manufacturing blueprints stay in Nepal — held by the Trust.',
    milestones: [
      'Outputs under MIT (DPG-compliant) or Nepal patents',
      'No IP transfer in international agreements',
      'Annual IP audit filed with the Ministry',
    ],
  },
  {
    icon: GraduationCap,
    title: 'Human Capital Development',
    body: 'Build a domestic pipeline of hydrogen scientists, AI engineers, and policy specialists. Reasons for graduates to stay.',
    milestones: [
      '5 funded research positions · Year 1',
      '20+ positions · Year 5',
      '10+ peer-reviewed papers · Year 5',
    ],
  },
  {
    icon: Globe2,
    title: 'International Funding Mobilisation',
    body: 'Unlock ADB, GCF, GGGI, and bilateral climate finance — currently blocked by the absence of a designated recipient.',
    milestones: [
      'ADB and GGGI applications · within 6 months',
      'GCF Project Concept Note · Year 1',
      'NPR 50+ crore in grants · Year 5',
    ],
  },
]

const TIMELINE = [
  {
    period: 'Years 1–2',
    label: 'Found',
    body: 'Nepal has its first nationally designated hydrogen coordination platform, a functioning AI-augmented research lab, and a live pilot electrolysis facility at Godawari.',
  },
  {
    period: 'Years 3–4',
    label: 'Build',
    body: 'Domestically fabricated hydrogen engine prototypes. A drafted National H₂ Safety Standard. Confirmed green ammonia feasibility for fertiliser independence.',
  },
  {
    period: 'Year 5',
    label: 'Field',
    body: 'Field-tested hydrogen machinery. Domestic patents filed. NGHTT financially self-sustaining through international grants and PPP revenue.',
  },
  {
    period: 'Year 10',
    label: 'Export',
    body: 'Nepal exports hydrogen technology designs to neighbouring countries. Measurable decline in diesel imports for agriculture and heavy transport.',
  },
  {
    period: 'Year 20+',
    label: 'Sovereign',
    body: 'Green hydrogen contributes meaningfully to Nepal’s Net-Zero 2045 target. Nepal is internationally recognised as an originator of hydrogen technology, not an adopter.',
  },
]

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="— Mission · Vision · Timeline"
        title={
          <>
            South Asia’s first{' '}
            <span className="glow-text">hydrogen-sovereign</span> nation.
          </>
        }
        intro={
          <>
            Nepal stands at a historic inflection point. Its hydropower surplus — among the largest per-capita
            renewable reserves in the world — gives it the potential to produce green hydrogen at globally
            competitive cost. NGHTT exists to translate that potential into engineering reality.
          </>
        }
        breadcrumb={[{ label: 'About' }]}
      />

      {/* Vision callout */}
      <section className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-10 md:py-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="eyebrow">— Vision Statement</p>
            <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--text)] md:text-[36px]">
              An engineering mission, not an aspiration.
            </h2>
          </div>
          <div className="relative overflow-hidden rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-7 backdrop-blur-2xl md:p-10">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(50% 50% at 100% 0%, rgba(110,231,183,0.20), transparent 60%), radial-gradient(50% 50% at 0% 100%, rgba(45,212,191,0.16), transparent 65%)',
              }}
            />
            <p className="relative font-display text-[19px] font-medium leading-[1.55] text-[var(--text)]/90 md:text-[22px]">
              To establish Nepal as <span className="font-bold text-[var(--text)]">South Asia’s first hydrogen-sovereign nation</span> — where
              domestically engineered, produced, and deployed green hydrogen technology powers agriculture,
              industry, and transport; where all intellectual property is owned within Nepal’s borders; and where
              a permanent, politically resilient institution ensures this mission persists across governments,
              elections, and generations.
            </p>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="relative w-full py-20 md:py-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow">— The Five Horizons</p>
            <h2 className="font-display mt-3 text-[32px] font-bold leading-[1.06] tracking-[-0.022em] text-[var(--text)] md:text-[48px]">
              The Nepal we are building, with{' '}
              <span className="glow-text">measurable milestones</span>.
            </h2>
          </div>

          {/* Timeline rail */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[28px] top-0 hidden h-full w-px bg-gradient-to-b from-[var(--primary)] via-[var(--accent)] to-transparent md:block"
            />
            <ol className="space-y-6 md:space-y-10">
              {TIMELINE.map((t, i) => (
                <li key={t.period} className="relative grid gap-4 md:grid-cols-[80px_minmax(0,1fr)] md:gap-8">
                  <div className="flex items-center gap-3 md:items-start md:pt-1">
                    <span className="relative grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] font-mono tab-num text-[14px] font-bold text-[var(--primary)] backdrop-blur-xl">
                      {String(i + 1).padStart(2, '0')}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-full"
                        style={{
                          background:
                            'radial-gradient(circle, rgba(16,185,129,0.20), transparent 70%)',
                        }}
                      />
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] md:hidden">
                      {t.period}
                    </span>
                  </div>
                  <div className="rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-xl md:p-7">
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)] md:inline">
                        {t.period}
                      </span>
                      <h3 className="font-display text-[22px] font-bold leading-tight text-[var(--text)] md:text-[26px]">
                        {t.label}
                      </h3>
                    </div>
                    <p className="mt-3 text-[14.5px] leading-[1.65] text-[var(--text)]/75 md:text-[15.5px]">
                      {t.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* OBJECTIVES — 6 cards */}
      <section className="relative w-full pb-20 md:pb-28">
        <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow">— Six Core Objectives</p>
            <h2 className="font-display mt-3 text-[32px] font-bold leading-[1.06] tracking-[-0.022em] text-[var(--text)] md:text-[48px]">
              Every objective is measurable, time-bound, and policy-traceable.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:gap-7">
            {OBJECTIVES.map((o, i) => (
              <article
                key={o.title}
                className="group relative overflow-hidden rounded-[22px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/60"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl">
                    <o.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono tab-num text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                    Objective № {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-display mt-5 text-[22px] font-bold leading-tight tracking-[-0.015em] text-[var(--text)] md:text-[24px]">
                  {o.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--text)]/70">
                  {o.body}
                </p>
                <ul className="mt-5 space-y-2 border-t border-[var(--surface-rule-soft)] pt-5">
                  {o.milestones.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-[13px] text-[var(--text)]/75">
                      <CheckCircle2 className="mt-[3px] h-3.5 w-3.5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto mb-12 w-full max-w-[1240px] px-5 md:px-10">
        <div className="relative overflow-hidden rounded-[26px] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-8 backdrop-blur-2xl md:p-12">
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
              <Sparkles className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              <h2 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-[-0.018em] text-[var(--text)] md:text-[34px]">
                See where green H₂ goes to work →
              </h2>
              <p className="mt-2 max-w-xl text-[14.5px] leading-[1.6] text-[var(--text)]/70 md:text-[15.5px]">
                Five concrete applications mapped to existing Nepali industries and people on this team.
              </p>
            </div>
            <a href="/applications" className="btn btn-primary shrink-0">
              Explore the applications
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default AboutPage
