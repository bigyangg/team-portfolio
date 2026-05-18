import { useEffect, useRef } from 'react'

// Canvas particle field: drifting glow dust. Lightweight (~60 particles),
// uses requestAnimationFrame, pauses when off-screen, respects reduced motion.
function ParticleField({
  count = 60,
  color = 'rgba(110, 231, 183, 0.55)',
  className = '',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let raf
    let particles = []
    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }

    const seed = () => {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.05 - Math.random() * 0.18,
        a: 0.3 + Math.random() * 0.5,
      }))
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${p.a})`)
        ctx.shadowBlur = 8
        ctx.shadowColor = color
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }

    // Pause when off-screen
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf) tick()
        } else if (raf) {
          cancelAnimationFrame(raf)
          raf = null
        }
      },
      { threshold: 0 }
    )

    const handleResize = () => {
      resize()
      seed()
    }

    resize()
    seed()
    io.observe(canvas)
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [count, color])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  )
}

export default ParticleField
