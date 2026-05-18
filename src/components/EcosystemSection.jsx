import { Truck, Wheat, Flame, Battery, Sprout } from 'lucide-react'

const USE_CASES = [
  {
    n: '01',
    icon: Wheat,
    title: 'Agricultural Mechanization',
    body: 'Hydrogen tractor retrofit kits replace diesel across the Terai region — cleaner air, lower input costs for farmers.',
    accent: 'rgba(16,185,129,0.22)',
  },
  {
    n: '02',
    icon: Sprout,
    title: 'Fertilizer Sovereignty',
    body: 'Green ammonia for urea production ends Nepal\'s import dependency and stabilises prices for farmers.',
    accent: 'rgba(45,212,191,0.22)',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Heavy Transport',
    body: 'Fuel cells power long-haul trucks and cross-border SAARC freight, replacing imported diesel.',
    accent: 'rgba(110,231,183,0.22)',
  },
  {
    n: '04',
    icon: Flame,
    title: 'Industrial Heat',
    body: 'Hydrogen combustion replaces coal in Nepal\'s notoriously polluting brick kilns and cement plants.',
    accent: 'rgba(20,184,166,0.22)',
  },
  {
    n: '05',
    icon: Battery,
    title: 'Energy Storage',
    body: 'Electrolysis stores monsoon hydropower surplus, releasing it as hydrogen during the dry season.',
    accent: 'rgba(52,211,153,0.22)',
  },
]

function EcosystemSection() {
  return (
    <section className="relative w-full py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Green H₂ ecosystem</p>
          <h2 className="font-display mt-4 text-[38px] font-bold leading-[1.06] tracking-[-0.022em] text-[var(--text)] sm:text-[50px] md:text-[60px]">
            Five places hydrogen{' '}
            <span className="glow-text">moves the needle</span> for Nepal.
          </h2>
          <p className="mt-6 text-[17px] leading-[1.6] text-[var(--text)]/75 md:text-[18.5px]">
            Not theoretical. Each use case is mapped to specific industries, existing infrastructure,
            and people on this team who can deliver it.
          </p>
        </div>

        {/* Clean grid — 5 in a 3+2 layout on lg, 2 cols on tablet, 1 col on mobile.
            Last row centered for visual balance. */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6 lg:gap-6">
          {USE_CASES.map((u, i) => {
            // On lg (6-col grid), positions:
            //   row 1: cards 1-3 each span 2 cols (cols 1-2, 3-4, 5-6)
            //   row 2: cards 4-5 each span 2 cols, starting at col 2 and col 4 (centered)
            const lgSpan = i < 3
              ? 'lg:col-span-2'
              : i === 3
                ? 'lg:col-span-2 lg:col-start-2'
                : 'lg:col-span-2 lg:col-start-4'
            return (
              <article
                key={u.n}
                className={`group relative overflow-hidden rounded-[22px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-7 shadow-[0_8px_28px_rgba(5,46,44,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/50 hover:shadow-[0_24px_48px_-12px_rgba(16,185,129,0.30)] md:p-8 ${lgSpan}`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: `radial-gradient(80% 80% at 0% 0%, ${u.accent}, transparent 60%)` }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl">
                      <u.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="font-mono tab-num text-[13px] font-medium text-[var(--muted-foreground)]">
                      № {u.n}
                    </span>
                  </div>
                  <h3 className="font-display mt-6 text-[24px] font-bold leading-[1.2] tracking-[-0.015em] text-[var(--text)] md:text-[26px]">
                    {u.title}
                  </h3>
                  <p className="mt-3 text-[15.5px] leading-[1.6] text-[var(--text)]/70 md:text-[16px]">
                    {u.body}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default EcosystemSection
