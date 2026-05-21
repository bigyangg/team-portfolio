import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown, Sparkles } from 'lucide-react'
import { heroStagger, heroItem } from '../lib/motion'
import ParticleField from './motion/ParticleField'
import MagneticButton from './motion/MagneticButton'

// Wrapper for the hero bg image with skeleton fallback.
// Inline because we need the parallax motion values applied directly.
function HeroBg({ y, scale }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      {!loaded && <div className="skeleton absolute inset-0" aria-hidden="true" />}
      <motion.img
        src="/hero/himalaya-haze.png"
        alt=""
        aria-hidden="true"
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ y, scale, willChange: 'transform', opacity: loaded ? 1 : 0, transition: 'opacity 380ms cubic-bezier(0.22,1,0.36,1)' }}
      />
    </>
  )
}

function HeroSection() {
  const [scrolled, setScrolled] = useState(0)
  const { scrollY } = useScroll()
  const bgY = useTransform(scrollY, [0, 600], [0, 80])
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.06])
  const fgY = useTransform(scrollY, [0, 600], [0, -40])

  useEffect(() => {
    const onScroll = () => setScrolled(Math.min(window.scrollY / 500, 1))
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleScroll = () => {
    const el = document.getElementById('vision')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden">
      {/* Full-bleed Himalaya photograph with parallax + skeleton fallback */}
      <HeroBg y={bgY} scale={bgScale} />

      {/* Gradient washes for legibility + cinematic mood */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(232,244,250,0.10) 0%, rgba(220,238,242,0.30) 40%, rgba(238,248,244,0.85) 92%, var(--aurora-base) 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 12% 30%, rgba(110,231,183,0.16), transparent 60%), radial-gradient(50% 50% at 90% 78%, rgba(45,212,191,0.18), transparent 65%)',
        }}
      />

      {/* Drifting particle dust — hidden below sm to save GPU on mobile */}
      <div className="hidden sm:block absolute inset-0" aria-hidden="true">
        <ParticleField count={36} />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto flex h-full w-full max-w-[1240px] flex-col justify-end px-5 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32"
        style={{ y: fgY }}
        variants={heroStagger}
        initial="hidden"
        animate="show"
      >
        <div className="max-w-3xl">
          <motion.h1
            variants={heroItem}
            className="font-display text-[36px] font-extrabold leading-[1.08] tracking-[-0.022em] text-[var(--text)] [text-wrap:balance] sm:text-[48px] md:text-[60px] lg:text-[72px] xl:text-[80px]"
          >
            Building Nepal's
            <br />
            <span className="glow-text">green hydrogen</span>
            <br />
            future, together.
          </motion.h1>

          <motion.p
            variants={heroItem}
            className="mt-7 max-w-2xl text-[15.5px] leading-[1.6] text-[var(--text)]/80 md:text-[17px]"
          >
            An 11-person founder team developing hydrogen technology Nepal owns. Not licenses,
            not imports. Owns. AI compresses 15 years of R&amp;D into 5, on a single ministerial
            designation order that costs the Ministry nothing to issue.
          </motion.p>

          <motion.div variants={heroItem} className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <MagneticButton as={Link} to="/team" className="btn btn-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              View the team
            </MagneticButton>
            <MagneticButton as="a" href="#vision" className="btn btn-ghost">
              Our mission
            </MagneticButton>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <button
          type="button"
          onClick={handleScroll}
          aria-label="Scroll to vision"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/40 bg-white/40 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--text)]/80 backdrop-blur-xl transition-colors hover:bg-white/60 md:inline-flex"
          style={{ opacity: 1 - scrolled * 1.6 }}
        >
          Scroll
          <ChevronDown className="h-3 w-3 animate-bounce" aria-hidden="true" />
        </button>
      </motion.div>
    </section>
  )
}

export default HeroSection
