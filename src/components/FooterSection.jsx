import { FileText, ShieldCheck, ChevronUp } from 'lucide-react'

function FooterSection() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative mt-24 w-full overflow-hidden md:mt-32">
      {/* Top divider gradient */}
      <div className="brand-stroke mx-auto mb-16 w-32" aria-hidden="true" />

      {/* Columns image as soft backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage: 'url(/hero/columns.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          maskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.85) 75%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.85) 75%, transparent 100%)',
        }}
      />

      <div className="mx-auto w-full max-w-[1240px] px-5 pb-20 md:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Left — submission */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 backdrop-blur-xl">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--text)]/80">
                Submitted to government
              </span>
            </div>
            <h3 className="font-display mt-4 text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--text)] sm:text-[34px]">
              Ministry of Energy, Water Resources &amp; Irrigation
            </h3>
            <p className="mt-3 text-[14px] leading-[1.6] text-[var(--text)]/65">
              नेपाल सरकार · ऊर्जा, जलस्रोत तथा सिंचाइ मन्त्रालय
              <br />
              सिंहदरबार, काठमाडौं, नेपाल
            </p>
          </div>

          {/* Mid — meta */}
          <div>
            <p className="eyebrow">— Document</p>
            <ul className="mt-4 space-y-2.5 text-[13.5px] text-[var(--text)]/75">
              <li className="flex items-center justify-between border-b border-[var(--surface-rule-soft)] pb-2.5">
                <span className="text-[var(--muted-foreground)]">Year</span>
                <span className="tab-num font-mono">2082 / 83 · 2025 / 26</span>
              </li>
              <li className="flex items-center justify-between border-b border-[var(--surface-rule-soft)] pb-2.5">
                <span className="text-[var(--muted-foreground)]">Members</span>
                <span className="tab-num font-mono">27 mapped</span>
              </li>
              <li className="flex items-center justify-between border-b border-[var(--surface-rule-soft)] pb-2.5">
                <span className="text-[var(--muted-foreground)]">CV verification</span>
                <span className="tab-num font-mono">Source-traced</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--muted-foreground)]">Status</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[12px] font-semibold text-[var(--primary)]">
                  <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                  Live
                </span>
              </li>
            </ul>
          </div>

          {/* Right — links / CTA */}
          <div>
            <p className="eyebrow">— Reference</p>
            <a
              href="#team"
              className="mt-4 inline-flex w-full items-center justify-between rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/60"
            >
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                <span className="text-[14px] font-semibold text-[var(--text)]">View team CVs</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">↗</span>
            </a>
            <button
              type="button"
              onClick={scrollTop}
              className="mt-3 inline-flex w-full items-center justify-between rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--primary)]/60"
            >
              <span className="flex items-center gap-3">
                <ChevronUp className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
                <span className="text-[14px] font-semibold text-[var(--text)]">Back to top</span>
              </span>
            </button>
          </div>
        </div>

        {/* Final tagline */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--surface-rule-soft)] pt-8 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            NGHTT · National Green Hydrogen Think Tank · 2082 BS
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
            Verified · Source-traced · Live
          </p>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
