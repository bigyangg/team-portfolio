import { Truck, Wheat, Flame, Battery, Sprout } from 'lucide-react'

const USE_CASES = [
  {
    n: '01',
    icon: Wheat,
    title: 'Agricultural Mechanization',
    body: 'Hydrogen tractor retrofit (Terai region) replaces diesel.',
    accent: 'rgba(16,185,129,0.22)',
  },
  {
    n: '02',
    icon: Sprout,
    title: 'Fertilizer Sovereignty',
    body: 'Green ammonia for urea production, price stability.',
    accent: 'rgba(45,212,191,0.22)',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Heavy Transport',
    body: 'Fuel cells for long-haul, cross-border freight.',
    accent: 'rgba(110,231,183,0.22)',
  },
  {
    n: '04',
    icon: Flame,
    title: 'Industrial Heat',
    body: 'Hydrogen combustion replaces coal in brick kilns.',
    accent: 'rgba(20,184,166,0.22)',
  },
  {
    n: '05',
    icon: Battery,
    title: 'Energy Storage',
    body: 'Electrolysis stores monsoon surplus for dry season.',
    accent: 'rgba(52,211,153,0.22)',
  },
]

function EcosystemSection() {
  return (
    <section className="relative w-full py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">— Green H₂ ecosystem</p>
          <h2 className="font-display mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.025em] text-[var(--text)] sm:text-[44px] md:text-[56px]">
            Five places hydrogen{' '}
            <span className="glow-text">moves the needle</span> for Nepal.
          </h2>
          <p className="mt-5 text-[15.5px] leading-[1.7] text-[var(--text)]/70 md:text-[17px]">
            Not theoretical. Each use case is mapped to specific industries, existing infrastructure,
            and people on this team who can deliver it.
          </p>
        </div>

        {/* Constellation grid */}
        <div className="relative mt-14">
          {/* Central H2 anchor */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="relative grid h-32 w-32 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] backdrop-blur-2xl">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(16,185,129,0.25), transparent 70%)',
                }}
              />
              <div className="relative text-center">
                <div className="font-display text-[42px] font-extrabold leading-none text-[var(--primary)]">
                  H<sub className="text-[26px]">2</sub>
                </div>
                <div className="mt-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Green
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
            {USE_CASES.map((u, i) => (
              <article
                key={u.n}
                className={`group relative overflow-hidden rounded-[22px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-[0_8px_28px_rgba(5,46,44,0.06)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--primary)]/50 hover:shadow-[0_24px_48px_-12px_rgba(16,185,129,0.30)] ${
                  // Push 3rd item into center column on lg if possible
                  i === 2 ? 'lg:col-start-2' : ''
                }`}
              >
                {/* Accent wash */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(80% 80% at 0% 0%, ${u.accent}, transparent 60%)`,
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] backdrop-blur-xl">
                      <u.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono tab-num text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      № {u.n}
                    </span>
                  </div>
                  <h3 className="font-display mt-5 text-[20px] font-bold leading-tight tracking-[-0.018em] text-[var(--text)]">
                    {u.title}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-[1.6] text-[var(--text)]/70">
                    {u.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default EcosystemSection
