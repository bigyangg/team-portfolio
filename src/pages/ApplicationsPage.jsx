import { Wheat, Sprout, Truck, Flame, Battery, Beaker } from 'lucide-react'
import PageHero from '../components/ui/PageHero'

const APPLICATIONS = [
  {
    n: '01',
    icon: Wheat,
    title: 'Agricultural Mechanization',
    region: 'Terai region',
    body: 'Hydrogen-powered tractor retrofit kits replace diesel in Nepal’s breadbasket. Diesel imports drop, farm-input costs stabilize, and Nepal’s rural carbon footprint contracts.',
    points: [
      'Diesel-to-H₂ tractor retrofit kits',
      'Designed for existing 25–50 HP fleets',
      'Manufactured at Godawari pilot site',
    ],
    accent: '#10B981',
  },
  {
    n: '02',
    icon: Sprout,
    title: 'Fertilizer Sovereignty',
    region: 'National',
    body: 'Green ammonia for urea production ends Nepal’s import dependency for nitrogen fertilizer. Price stability returns to farmers. The proposed NPR 1.6 billion fertilizer plant gains a domestic R&D backbone.',
    points: [
      'Green ammonia synthesis from electrolysed H₂',
      'Direct displacement of urea imports',
      'Link to NPR 1.6 bn government fertilizer plant',
    ],
    accent: '#2DD4BF',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Heavy Transport',
    region: 'Cross-border',
    body: 'Fuel-cell trucks and long-haul freight powered by domestic H₂ replace imported diesel for cross-border SAARC routes. A new domestic export industry: hydrogen for India and Bangladesh corridors.',
    points: [
      'Fuel cell stacks for long-haul freight',
      'Refuelling infrastructure for major highways',
      'Cross-border SAARC corridor pilots',
    ],
    accent: '#34D399',
  },
  {
    n: '04',
    icon: Flame,
    title: 'Industrial Heat',
    region: 'Brick kilns + cement',
    body: 'Hydrogen combustion replaces coal in Nepal’s notoriously polluting brick kilns and cement plants. The country’s largest single emitter category gets a domestic, drop-in decarbonization pathway.',
    points: [
      'H₂ burners for traditional Bull’s Trench Kilns',
      'Cement kiln co-firing trials',
      'Air quality impact: Kathmandu valley brick belt',
    ],
    accent: '#14B8A6',
  },
  {
    n: '05',
    icon: Battery,
    title: 'Energy Storage',
    region: 'Grid-scale',
    body: 'Electrolysis stores monsoon hydroelectric surplus that currently goes to waste, releasing it as hydrogen during the dry season. Nepal’s biggest renewable asset stops being seasonal.',
    points: [
      'Monsoon hydro surplus → H₂ → dry-season electricity',
      'Grid-scale electrolyser deployment',
      'Reduces dry-season Indian import dependence',
    ],
    accent: '#0D9488',
  },
]

function ApplicationsPage() {
  return (
    <>
      <PageHero
        eyebrow="— Strategy"
        title={
          <>
            Five places hydrogen{' '}
            <span className="glow-text">moves the needle</span>{' '}for Nepal.
          </>
        }
        intro={
          <>
            Each application is mapped to a documented Nepali industry, existing infrastructure, and named
            people on the NGHTT team who can deliver it. Not theoretical. Deployable.
          </>
        }
        breadcrumb={[{ label: 'Applications' }]}
        image="/hero/hydrogen-plant.png"
      />

      <section className="mx-auto w-full max-w-[1240px] px-5 py-16 md:px-10 md:py-24">
        <div className="space-y-16 md:space-y-24">
          {APPLICATIONS.map((a, i) => {
            const reverse = i % 2 === 1
            return (
              <article
                key={a.n}
                className={`grid items-center gap-8 md:gap-16 lg:grid-cols-[1fr_1.05fr] ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}
              >
                {/* Visual side */}
                <div className="relative">
                  <div
                    className="relative aspect-[5/4] overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${a.accent}26, transparent 65%), var(--glass-bg)`,
                    }}
                  >
                    {/* Big icon as visual hero */}
                    <div className="absolute inset-0 grid place-items-center">
                      <span
                        className="grid h-44 w-44 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--primary)] shadow-[0_24px_60px_-12px_rgba(16,185,129,0.30)] backdrop-blur-2xl md:h-56 md:w-56"
                        style={{ boxShadow: `0 24px 60px -12px ${a.accent}55` }}
                      >
                        <a.icon className="h-20 w-20 md:h-24 md:w-24" aria-hidden="true" />
                      </span>
                    </div>
                    {/* Floating number tag */}
                    <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-3 py-1.5 backdrop-blur-xl">
                      <span className="font-mono tab-num text-[11px] font-bold text-[var(--primary)]">№ {a.n}</span>
                    </span>
                    {/* Region chip */}
                    <span className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-3 py-1.5 backdrop-blur-xl">
                      <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text)]/80">
                        {a.region}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Text side */}
                <div>
                  <p className="font-mono tab-num text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                    Application № {a.n}
                  </p>
                  <h2 className="font-display mt-3 text-[32px] font-bold leading-[1.05] tracking-[-0.022em] text-[var(--text)] sm:text-[40px] md:text-[48px]">
                    {a.title}
                  </h2>
                  <p className="mt-5 max-w-xl text-[15.5px] leading-[1.7] text-[var(--text)]/75 md:text-[17px]">
                    {a.body}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {a.points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-md"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: a.accent }}
                        />
                        <span className="text-[14px] leading-[1.5] text-[var(--text)]/85">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Closing strip */}
      <section className="mx-auto mb-12 w-full max-w-[1240px] px-5 md:px-10">
        <div className="relative overflow-hidden rounded-[26px] border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] p-8 backdrop-blur-2xl md:p-12">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 80% at 0% 50%, rgba(110,231,183,0.22), transparent 60%)',
            }}
          />
          <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Beaker className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              <h2 className="font-display mt-3 text-[26px] font-bold leading-[1.1] tracking-[-0.018em] text-[var(--text)] md:text-[34px]">
                Each application has named owners on the team.
              </h2>
              <p className="mt-2 max-w-xl text-[14.5px] leading-[1.6] text-[var(--text)]/70 md:text-[15.5px]">
                Meet the 27 experts who will build each pathway.
              </p>
            </div>
            <a href="/team" className="btn btn-primary shrink-0">
              Meet the team
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default ApplicationsPage
