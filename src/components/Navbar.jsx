function Navbar() {
  return (
    <header className="border-b border-white/15 bg-[var(--navy)] text-[var(--white)]">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full border border-[var(--gold)]/60 p-1">
            <svg viewBox="0 0 64 64" className="h-full w-full text-[var(--gold)]" aria-hidden="true">
              <path
                d="M32 4 12 20l20 12 20-12L32 4Zm0 20L12 40l20 12 20-12-20-16Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="m32 18 4 10 10 4-10 4-4 10-4-10-10-4 10-4 4-10Z" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading text-xl leading-tight text-[var(--white)] md:text-2xl">
              Research Team Capability Brief
            </h1>
            <p className="text-xs tracking-[0.08em] text-[var(--gold2)]">
              Government Presentation - Working Draft
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
          <a
            href="#team"
            className="inline-flex min-h-10 items-center rounded-md border border-white/25 px-3 text-xs font-semibold uppercase tracking-[0.06em] text-white"
          >
            Team Directory
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
