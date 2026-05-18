import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Reusable hero for non-home pages.
 * Props:
 *   eyebrow:       label text
 *   title:         JSX or string for the big headline
 *   intro:         JSX/string for the sub-paragraph
 *   breadcrumb:    [{ label, to }] (optional)
 *   image:         optional image path for full-bleed bg
 */
function PageHero({ eyebrow, title, intro, breadcrumb = [], image, accent = '#10B981' }) {
  return (
    <section className="relative w-full overflow-hidden border-b border-[var(--surface-rule-soft)] pb-16 pt-32 md:pb-24 md:pt-40">
      {/* Optional bg image */}
      {image && (
        <>
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(238,248,244,0.40) 0%, rgba(238,248,244,0.75) 60%, var(--aurora-base) 100%)',
            }}
          />
        </>
      )}

      {/* Soft accent wash */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(70% 60% at 18% 12%, ${accent}26, transparent 60%), radial-gradient(50% 50% at 92% 0%, rgba(45,212,191,0.18), transparent 65%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 md:px-10">
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
            <Link to="/" className="hover:text-[var(--primary)]">NGHTT</Link>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3 text-[var(--muted-foreground)]/50" aria-hidden="true" />
                {b.to ? (
                  <Link to={b.to} className="hover:text-[var(--primary)]">{b.label}</Link>
                ) : (
                  <span className="text-[var(--text)]">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-[40px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[var(--text)] sm:text-[58px] md:text-[80px]">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-[15.5px] leading-[1.7] text-[var(--text)]/75 md:text-[17.5px]">
            {intro}
          </p>
        )}

        <div className="brand-stroke mt-10 w-28" aria-hidden="true" />
      </div>
    </section>
  )
}

export default PageHero
