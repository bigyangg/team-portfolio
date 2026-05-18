import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref + visible flag for scroll-triggered reveals.
 * Apply `style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)' }}`
 * with a transition for the effect.
 */
export function useReveal({ threshold = 0.12, rootMargin = '0px 0px -80px 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!ref.current || visible) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            obs.disconnect()
          }
        })
      },
      { threshold, rootMargin }
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold, rootMargin, visible])

  return [ref, visible]
}
