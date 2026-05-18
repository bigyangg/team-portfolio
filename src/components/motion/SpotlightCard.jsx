import { useMemo, useRef } from 'react'
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion'
import { hasFineHover, prefersReducedMotion } from '../../lib/motion'

// Framer-motion v12 prefers motion.create() over motion(). Fall back if older.
const toMotion = (Comp) => (motion.create ? motion.create(Comp) : motion(Comp))

// Card with cursor-aware radial glow. Glow follows mouse via motion values
// (no React state, no re-renders).
//
// Usage: <SpotlightCard className="...">{children}</SpotlightCard>
// Pass `as={Link} to="/about"` to render as a Link, or any other element.
function SpotlightCard({
  as: Comp = 'div',
  children,
  className = '',
  glowColor = 'rgba(16, 185, 129, 0.22)',
  glowSize = 280,
  ...rest
}) {
  const ref = useRef(null)
  const mx = useMotionValue(-1000)
  const my = useMotionValue(-1000)
  // Spring-damp the glow so it doesn't snap to the cursor. Subtle, but feels alive.
  const sx = useSpring(mx, { stiffness: 200, damping: 30, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 200, damping: 30, mass: 0.4 })
  const background = useMotionTemplate`radial-gradient(${glowSize}px circle at ${sx}px ${sy}px, ${glowColor}, transparent 70%)`

  const handleMove = (e) => {
    if (prefersReducedMotion() || !hasFineHover()) return
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }

  const handleLeave = () => {
    mx.set(-1000)
    my.set(-1000)
  }

  const MotionComp = useMemo(() => toMotion(Comp), [Comp])

  return (
    <MotionComp
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative overflow-hidden ${className}`}
      {...rest}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background }}
      />
      <span className="relative block">{children}</span>
    </MotionComp>
  )
}

export default SpotlightCard
