import { useEffect, useRef, useState } from 'react'

/**
 * Animated number counter that triggers when scrolled into view.
 * Props:
 *   to:         final number
 *   from:       start number (default 0)
 *   duration:   ms (default 1400)
 *   format:     fn(n) => string (default tabular integer)
 */
function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4)
}

function Counter({ to, from = 0, duration = 1400, format = (n) => Math.round(n).toLocaleString('en-US'), className = '' }) {
  const ref = useRef(null)
  const [value, setValue] = useState(from)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    if (typeof IntersectionObserver === 'undefined') {
      setValue(to)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true
            const start = performance.now()
            const tick = (now) => {
              const t = Math.min((now - start) / duration, 1)
              setValue(from + (to - from) * easeOutQuart(t))
              if (t < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
            obs.disconnect()
          }
        })
      },
      { threshold: 0.3 }
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
