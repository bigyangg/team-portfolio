import { useRef } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { hasFineHover, prefersReducedMotion } from '../../lib/motion'

// Magnetic button: subtle pull toward cursor when hovered.
// Uses motion values (no React state). Touch devices are excluded.
// Transform is composed via useMotionTemplate to keep the GPU-accelerated
// translate3d path instead of framer-motion's x/y shorthand.

const STRENGTH = 18
const REACH = 110
const SPRING = { stiffness: 220, damping: 18, mass: 0.4 }

function MagneticButton({ as: Comp = motion.button, children, className = '', onClick, ...rest }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, SPRING)
  const springY = useSpring(y, SPRING)
  const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`

  const handleMove = (e) => {
    if (prefersReducedMotion() || !hasFineHover()) return
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const dx = e.clientX - (rect.left + rect.width / 2)
    const dy = e.clientY - (rect.top + rect.height / 2)
    const distance = Math.hypot(dx, dy)
    const decay = Math.max(0, 1 - distance / REACH)
    x.set((dx / REACH) * STRENGTH * decay)
    y.set((dy / REACH) * STRENGTH * decay)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  if (Comp === motion.button) {
    return (
      <motion.button
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        className={className}
        style={{ transform, willChange: 'transform' }}
        {...rest}
      >
        {children}
      </motion.button>
    )
  }

  // Non-button (e.g. Link or <a>): wrap inner span so the underlying element
  // can keep its semantics, while the span carries the spring-driven transform.
  return (
    <Comp
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
      {...rest}
    >
      <motion.span
        className="inline-flex items-center gap-[inherit]"
        style={{ transform, willChange: 'transform' }}
        whileTap={{ scale: 0.97 }}
      >
        {children}
      </motion.span>
    </Comp>
  )
}

export default MagneticButton
