import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue, useTransform } from 'framer-motion'

// Counts from 0 to `value` once when scrolled into view.
// Uses framer-motion's animate() for non-React tween.
function AnimatedCounter({ value, suffix = '', duration = 1.2, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    if (!inView) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      count.set(value)
      return
    }
    const controls = animate(count, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
    })
    return controls.stop
  }, [inView, value, duration, count])

  return (
    <span ref={ref} className={className}>
      <RoundedDisplay rounded={rounded} />
      {suffix && <span>{suffix}</span>}
    </span>
  )
}

// Subscribes to motion value for text display.
function RoundedDisplay({ rounded }) {
  const ref = useRef(null)
  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      if (ref.current) ref.current.textContent = String(v)
    })
    return unsubscribe
  }, [rounded])
  return <span ref={ref}>{rounded.get()}</span>
}

export default AnimatedCounter
