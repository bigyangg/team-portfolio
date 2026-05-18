import { useEffect, useRef, useState } from 'react'

// Reveal-on-scroll: returns [ref, isVisible]. Fires once.
// rootMargin lets you trigger early so reveal happens just before the user gets there.
export default function useScrollReveal({ rootMargin = '-10% 0px', threshold = 0.1 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin, threshold }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [rootMargin, threshold, visible])

  return [ref, visible]
}
