import { Mountain, Wind, Droplets, Flame } from 'lucide-react'

const PILLARS = [
  {
    icon: Droplets,
    title: 'Electrolysis at altitude',
    body:
      'Pilot plants in the high Himalayas convert monsoon hydroelectric surplus into storable, transportable green H₂.',
  },
  {
    icon: Wind,
    title: 'Energy sovereignty',
    body:
      'Replace imported fertiliser, diesel, and coal with home-produced green ammonia, hydrogen fuel cells, and heat.',
  },
  {
    icon: Flame,
    title: 'Decarbonised industry',
    body:
      'Brick kilns, cement, and heavy transport switched to hydrogen — Nepal\'s biggest emitters retooled, not retired.',
  },
  {
    icon: Mountain,
    title: 'Mountain to grid',
    body:
      'A new energy export economy: green hydrogen, ammonia, and ammonium pellets shipped across SAARC.',
  },
]

function VisionSection() {
  return (
    <section id="vision" className="relative w-full overflow-hidden py-24 md:py-32">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 md:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        {/* Image side */}
        <div className="relative overflow-hidden rounded-[28px] border border-[var(--glass-border)] bg-[var(--glass-bg)] shadow-[0_30px_80px_-20px_rgba(5,46,44,0.18)] backdrop-blur-2xl">
          <img
            src="/hero/hydrogen-plant.png"
            alt="Green hydrogen plant in the Nepali Himalayas at dawn"
            className="block h-full w-full object-cover"
            loading="lazy"
          />
          {/* Inner gradient wash for premium feel */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(165deg, transparent 55%, rgba(16, 185, 129, 0.12) 100%)',
            }}
          />
          {/* Floating credit chip */}
          <div className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/55 px-3 py-1.5 backdrop-blur-xl">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)] pulse-dot" aria-hidden="true" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text)]/80">
              Concept · NGHTT 2082
            </span>
          </div>
        </div>

        {/* Text side */}
        <div className="flex flex-col justify-center">
          <p className="eyebrow">The Mission</p>
          <h2 className="font-display mt-2 text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-[var(--text)] sm:text-[36px] md:text-[42px]">
            From{' '}
            <span className="glow-text">monsoon water</span> to molecular fuel.
          </h2>
          <p className="mt-4 max-w-xl text-[14.5px] leading-[1.65] text-[var(--text)]/75 md:text-[15.5px]">
            NGHTT is a 27-person think tank convened to give Nepal a green hydrogen strategy
            that is built, not borrowed. We map the chemistry, the policy, the capital stack,
            and the people, then submit it as a single, signed brief.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.title} className="group">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--primary)] backdrop-blur-xl transition-transform duration-300 group-hover:-translate-y-0.5">
                  <p.icon className="h-[16px] w-[16px]" aria-hidden="true" />
                </span>
                <h3 className="font-display mt-2.5 text-[15px] font-bold leading-tight text-[var(--text)]">
                  {p.title}
                </h3>
                <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--text)]/65">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default VisionSection
