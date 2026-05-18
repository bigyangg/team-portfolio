import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { prefersReducedMotion } from '../../lib/motion'

// Magnetic button: subtle pull toward cursor when hovered.
// Uses motion values (no React state) per Taste skill rule.
// Strength: 18px max pull, decays at ~110px from center.

const STRENGTH = 18
const REACH = 110

function MagneticButton({ as: Comp = motion.button, children, className = '', onClick, ...rest }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  const handleMove = (e) => {
    if (prefersReducedMotion()) return
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

  // If Comp is a non-motion element (like an <a>), wrap children in a motion.span for the pull.
  if (Comp === motion.button) {
    return (
      <motion.button
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={onClick}
        className={className}
        style={{ x: springX, y: springY }}
        {...rest}
      >
        {children}
      </motion.button>
    )
  }

  // For non-button (Link, a), wrap to keep semantics correct.
  return (
    <Comp
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      className={className}
      {...rest}
    >
      <motion.span className="inline-flex items-center gap-[inherit]" style={{ x: springX, y: springY }}>
        {children}
      </motion.span>
    </Comp>
  )
}

export default MagneticButton
