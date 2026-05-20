import { ChevronUp } from 'lucide-react'

function FooterSection() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <footer className="relative mt-20 w-full md:mt-24">
      <div className="mx-auto w-full max-w-[1240px] px-5 pb-10 pt-8 md:px-10">
        <div className="flex flex-col items-center justify-between gap-5 border-t border-[var(--surface-rule-soft)] pt-8 sm:flex-row">
          <div className="flex flex-col gap-1.5">
            <img
              src="/brand/nghtt-lockup.svg"
              alt="NGHTT — National Green Hydrogen Think Tank"
              className="h-7 opacity-70"
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              2082 BS
            </span>
          </div>

          <button
            type="button"
            onClick={scrollTop}
            aria-label="Back to top"
            className="group inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2 backdrop-blur-md transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-[var(--primary)]/60 hover:text-[var(--primary)]"
          >
            <ChevronUp className="h-3.5 w-3.5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-0.5" aria-hidden="true" />
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]">
              Back to top
            </span>
          </button>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
