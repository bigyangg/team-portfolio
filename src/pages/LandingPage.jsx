import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import ParticleEngine from '../lib/particleEngine'

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function LandingPage() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const loopRef = useRef(0)
  const mouseRafRef = useRef(0)
  const mouseRef = useRef({ x: -9999, y: -9999 })
  const ctaRef = useRef(null)
  const [isMobile, setIsMobile] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [ctaOffset, setCtaOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined

    const mobileMedia = window.matchMedia('(max-width: 840px)')
    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)')

    const syncPreferences = () => {
      setIsMobile(mobileMedia.matches)
      setReduceMotion(motionMedia.matches)
    }

    syncPreferences()
    mobileMedia.addEventListener('change', syncPreferences)
    motionMedia.addEventListener('change', syncPreferences)

    return () => {
      mobileMedia.removeEventListener('change', syncPreferences)
      motionMedia.removeEventListener('change', syncPreferences)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const onMouseMove = (event) => {
      mouseRef.current = { x: event.clientX, y: event.clientY }
      if (mouseRafRef.current) return

      mouseRafRef.current = window.requestAnimationFrame(() => {
        mouseRafRef.current = 0
        if (!ctaRef.current) return
        const rect = ctaRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const dx = event.clientX - centerX
        const dy = event.clientY - centerY
        const distance = Math.hypot(dx, dy)

        // Only magnetize when the mouse is close to the CTA
        if (distance < 130 && distance > 0.01) {
          const pull = (1 - distance / 130) * 11
          setCtaOffset({
            x: (dx / distance) * pull,
            y: (dy / distance) * pull,
          })
        } else {
          setCtaOffset({ x: 0, y: 0 })
        }
      })
    }

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 }
      setCtaOffset({ x: 0, y: 0 })
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      if (mouseRafRef.current) window.cancelAnimationFrame(mouseRafRef.current)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return undefined

    const engine = new ParticleEngine(canvasRef.current, {
      particleCount: isMobile ? 44 : 120,
      isMobile,
      reducedMotion: reduceMotion,
    })
    engine.init()
    engineRef.current = engine

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    if (reduceMotion) {
      engine.setReducedMotion(true)
      // Progress 0.5 sets the background to a stable helix formation
      engine.update(0.5, -9999, -9999, 0.016)
      engine.render(engine.ctx)
      return () => {
        window.removeEventListener('resize', handleResize)
        engine.destroy()
        engineRef.current = null
      }
    }

    let lastTime = 0
    const tick = (timestamp) => {
      if (!lastTime) lastTime = timestamp
      const deltaTime = clamp((timestamp - lastTime) / 1000, 0.008, 0.05)
      lastTime = timestamp

      engine.setReducedMotion(false)
      // Hardcoded progress = 0.5 allows the "Intelligence" phase to loop indefinitely 
      // without needing scroll interactions.
      engine.update(0.5, mouseRef.current.x, mouseRef.current.y, deltaTime)
      engine.render(engine.ctx)
      loopRef.current = window.requestAnimationFrame(tick)
    }

    loopRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (loopRef.current) window.cancelAnimationFrame(loopRef.current)
      window.removeEventListener('resize', handleResize)
      engine.destroy()
      engineRef.current = null
    }
  }, [isMobile, reduceMotion])

  const ctaStyle = {
    transform: `translate3d(${ctaOffset.x}px, ${ctaOffset.y}px, 0)`,
  }
  const landingBackdropClass = isMobile
    ? 'landing-dark min-h-[100svh] w-full overflow-hidden'
    : 'landing-dark film-grain vignette h-screen w-full overflow-hidden'
  const textShieldClass = isMobile
    ? 'pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(8,18,42,0.44)_0%,rgba(8,18,42,0.22)_46%,transparent_82%)]'
    : 'pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(3,2,8,0.85)_0%,rgba(3,2,8,0.45)_40%,transparent_80%)]'
  const contentWrapClass = isMobile
    ? 'pointer-events-none relative z-20 flex min-h-[100svh] w-full flex-col items-start justify-start px-5 pb-8 pt-[10svh]'
    : 'pointer-events-none relative z-20 flex h-full w-full flex-col items-center justify-center px-4'
  const contentBlockClass = isMobile
    ? 'relative flex w-full max-w-[22rem] flex-col items-start text-left'
    : 'relative flex w-full max-w-4xl flex-col items-center justify-center text-center'
  const headingClass = isMobile
    ? 'landing-word font-heading text-[clamp(44px,14vw,62px)] font-bold leading-[1.06] tracking-tight text-white drop-shadow-[0_10px_42px_rgba(0,0,0,0.72)]'
    : 'landing-word font-heading text-[clamp(42px,7vw,84px)] font-bold leading-[1.12] tracking-tight text-white drop-shadow-[0_10px_42px_rgba(0,0,0,0.72)]'
  const descriptionClass = isMobile
    ? 'mt-5 max-w-[20.5rem] text-[clamp(17px,4.9vw,22px)] font-light text-white/86 drop-shadow-[0_4px_22px_rgba(0,0,0,0.62)]'
    : 'mt-6 text-[clamp(18px,3vw,26px)] font-light text-white/86 drop-shadow-[0_4px_22px_rgba(0,0,0,0.62)]'
  const ctaWrapClass = isMobile ? 'mt-9 w-full max-w-[22rem]' : 'mt-12'
  const ctaClass = isMobile
    ? 'cta-magnetic pointer-events-auto inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-[var(--navy)] px-8 text-sm font-bold uppercase tracking-wider text-[var(--landing-white)] shadow-[0_12px_28px_rgba(15,79,168,0.35)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
    : 'cta-magnetic pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-md border border-white/10 bg-[var(--navy)] px-8 text-sm font-bold uppercase tracking-wider text-[var(--landing-white)] shadow-[0_12px_28px_rgba(15,79,168,0.35)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'

  return (
    <div className={landingBackdropClass}>
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* Full-screen soft radial mask for text legibility (no borders, no boxes). */}
      <div className={textShieldClass} />

      <div className={contentWrapClass}>
        <div className={contentBlockClass}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/18 bg-slate-950/55 px-4 py-1.5 text-xs font-semibold tracking-[0.14em] text-[var(--landing-white)] shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md">
            <span className="font-mono text-[10px] font-bold text-[var(--landing-accent)]">NP</span>
            <span>NGHTT</span>
          </div>

          <h1 className={headingClass}>
            Clarity first.<br />
            Get things done,<br />
            clearly.
          </h1>

          <p className={descriptionClass}>
            This portfolio keeps it focused and simple.
          </p>
        </div>

        <div className={ctaWrapClass}>
          <Link
            ref={ctaRef}
            to="/portfolio"
            style={ctaStyle}
            className={ctaClass}
          >
            VIEW PORTFOLIO
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
