import { useEffect, useRef, useState } from 'react'

/**
 * Animated number counter that triggers once the element enters viewport.
 * Falls back to the final value immediately on browsers without IntersectionObserver,
 * or after a short delay if observed but never marked intersecting (e.g. above the fold).
 */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

function Counter({ to, from = 0, duration = 1400, format = (n) => Math.round(n).toLocaleString('en-US'), className = '' }) {
  const ref = useRef(null)
  const [value, setValue] = useState(from)
  const startedRef = useRef(false)

  useEffect(() => {
    const start = () => {
      if (startedRef.current) return
      startedRef.current = true
      const t0 = performance.now()
      const tick = (now) => {
        const t = Math.min((now - t0) / duration, 1)
        setValue(from + (to - from) * easeOutQuart(t))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (!ref.current || typeof IntersectionObserver === 'undefined') {
      start()
      return
    }

    // Check if already in viewport when mounted (above the fold counters)
    const rect = ref.current.getBoundingClientRect()
    const inView = rect.top < window.innerHeight && rect.bottom > 0
    if (inView) {
      start()
      return
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            start()
            obs.disconnect()
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, from, duration])

  return (
    <span ref={ref} className={`tab-num ${className}`}>
      {format(value)}
    </span>
  )
}

export default Counter
