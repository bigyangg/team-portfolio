import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { prefersReducedMotion } from '../../lib/motion'

// 3D tilt: rotates card based on cursor position (perspective).
// Subtle by default (max 6deg) so it feels premium, not gimmicky.
// Children stay above the tilt plane; the parent does the rotation.
function TiltCard({ children, className = '', max = 6, ...rest }) {
  const ref = useRef(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const sx = useSpring(rx, { stiffness: 200, damping: 22, mass: 0.5 })
  const sy = useSpring(ry, { stiffness: 200, damping: 22, mass: 0.5 })
  const rotateX = useTransform(sy, (v) => v)
  const rotateY = useTransform(sx, (v) => v)

  const handleMove = (e) => {
    if (prefersReducedMotion()) return
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rx.set((px - 0.5) * max * 2)        // rotateY
    ry.set(-(py - 0.5) * max * 2)       // rotateX inverted (point toward cursor)
  }

  const handleLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export default TiltCard
