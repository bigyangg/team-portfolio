import { CheckCircle2, XCircle, FileText, ShieldCheck, Scale, Stamp, Building2 } from 'lucide-react'
import PageHero from '../components/ui/PageHero'

const WHAT_IT_DOES = [
  'Recognises NGHTT as Nepal’s single coordination platform for green hydrogen.',
  'Encourages universities, agencies, donors, and the private sector to coordinate through NGHTT.',
  'Unlocks NGHTT’s eligibility to receive international climate finance (ADB, GCF, GGGI).',
  'Sends a clear signal to international partners: there is one designated counterpart.',
]

const WHAT_IT_DOES_NOT = [
  {
    head: 'Make NGHTT a government body.',
    body: 'The Trust remains independent, governed by its own Board of Trustees and Trust Deed. The Ministry assumes no supervisory or financial liability.',
  },
  {
    head: 'Grant regulatory or licensing authority.',
    body: 'NGHTT is a coordination and R&D platform — not a regulator. Regulatory authority remains with the Ministry and AEPC.',
  },
  {
    head: 'Compel anyone to participate.',
    body: 'The proposed language reads “encouraged to coordinate” — never required. Participation is voluntary, though institutional incentives make non-participation irrational.',
  },
  {
    head: 'Cost the Ministry anything financially.',
    body: 'The designation is a one-page order. No budget allocation, no staffing, no recurring cost.',
  },
]

function SubmissionPage() {
  return (
    <>
      <PageHero
        eyebrow="— The Designation Request"
        title={
          <>
            One page.{' '}
            <span className="glow-text">One Ministerial Order</span>. No liability.
          </>
        }
        intro={
          <>
            NGHTT requests a single Ministerial Designation Order recognising it as Nepal’s
            national coordination platform for green hydrogen. The Trust is already being
            built. The designation aligns existing efforts under one roof.
          </>
        }
        breadcrumb={[{ label: 'Submission' }]}
        image="/hero/columns.png"
      />

      {/* Submission meta */}
      <section className="mx-auto w-full max-w-[1240px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FileText, label: 'Reference', value: 'NGHTT/PROPOSAL/2082-83/001' },
            { icon: Building2, label: 'Submitted to', value: 'Ministry of Energy, WR & I' },
            { icon: Scale, label: 'Legal basis', value: 'Muluki Dewani Sanhita 2074 · §314–351' },
            { icon: Stamp, label: 'Date', value: '2026-04-26 (2082 BS)' },
          ].map((m) => (
            <div key={m.label} className="rounded-[20px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 backdrop-blur-xl">
              <m.icon className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
              <p className="eyebrow mt-3">{m.label}</p>
              <p className="font-display mt-1 text-[15px] font-bold leading-[1.3] text-[var(--text)]">{m.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proposed Designation Language — featured quote */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-12 md:px-10 md:pb-20">
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-8 backdrop-blur-2xl md:p-14">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 0% 0%, rgba(110,231,183,0.22), transparent 60%), radial-gradient(50% 50% at 100% 100%, rgba(45,212,191,0.18), transparent 65%)',
            }}
          />
          <div className="relative">
            <p className="eyebrow">— Proposed Designation Language</p>
            <blockquote className="font-display mt-5 text-[22px] font-semibold leading-[1.45] tracking-[-0.012em] text-[var(--text)]/95 md:text-[28px]">
              <span className="text-[var(--primary)]">“</span>
              The National Green Hydrogen Think Tank (NGHTT), registered as a public trust under
              the Muluki Dewani Sanhita (Civil Code), 2074, is hereby designated as Nepal’s
              National Coordination Platform for green hydrogen research, development, and
              stakeholder integration. All academic institutions, government agencies,
              development partners, and private sector entities engaged in green hydrogen
              activities are encouraged to coordinate their initiatives through NGHTT to ensure
              national coherence, eliminate duplication, and accelerate the deployment of green
              hydrogen technology.
              <span className="text-[var(--primary)]">”</span>
            </blockquote>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Drafted for issuance by the Honourable Minister of Energy, Water Resources &amp; Irrigation
            </p>
          </div>
        </div>
      </section>

      {/* What the designation DOES / DOES NOT do — side by side */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-20 md:px-10 md:pb-28">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Does */}
          <div className="rounded-[24px] border border-[var(--primary)]/40 bg-[var(--glass-bg)] p-7 backdrop-blur-2xl md:p-9">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              <p className="eyebrow text-[var(--primary)]">What this designation does</p>
            </div>
            <ul className="mt-6 space-y-4">
              {WHAT_IT_DOES.map((w) => (
                <li key={w} className="flex items-start gap-3 text-[14.5px] leading-[1.55] text-[var(--text)]/85">
                  <CheckCircle2 className="mt-[3px] h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Does NOT */}
          <div className="rounded-[24px] border border-[var(--surface-rule)] bg-[var(--glass-bg)] p-7 backdrop-blur-2xl md:p-9">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-[var(--muted-foreground)]" aria-hidden="true" />
              <p className="eyebrow">What this designation does NOT do</p>
            </div>
            <ul className="mt-6 space-y-5">
              {WHAT_IT_DOES_NOT.map((w) => (
                <li key={w.head} className="border-l-2 border-[var(--surface-rule)] pl-4">
                  <p className="font-display text-[15px] font-bold leading-tight text-[var(--text)]">{w.head}</p>
                  <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[var(--text)]/65">{w.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Why now — Gap analysis */}
      <section className="mx-auto w-full max-w-[1240px] px-5 pb-20 md:px-10 md:pb-28">
        <div className="relative overflow-hidden rounded-[26px] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-8 backdrop-blur-2xl md:p-12">
          <p className="eyebrow">— The Gap NGHTT Fills</p>
          <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--text)] md:text-[36px]">
            Policy intent without a coordinator goes nowhere.
          </h2>
          <p className="mt-4 max-w-3xl text-[14.5px] leading-[1.7] text-[var(--text)]/75 md:text-[16px]">
            The <span className="font-semibold text-[var(--text)]">Green Hydrogen Policy 2080</span> and{' '}
            <span className="font-semibold text-[var(--text)]">Budget 2082/83</span> have created policy intent
            and fiscal incentives. The Alternative Energy Promotion Centre is funding initial work. A
            <span className="font-semibold text-[var(--text)]"> NPR 1.6 billion fertilizer plant</span> is proposed.
            What is missing — and what every stakeholder has independently identified — is a single, permanent
            institution with the authority and technical capacity to bring all these actors together,
            coordinate their efforts, and deliver physically engineered hydrogen technology.
          </p>
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 backdrop-blur-xl">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text)]/80">
              NGHTT is built to be that institution.
            </span>
          </div>
        </div>
      </section>
    </>
  )
}

export default SubmissionPage
