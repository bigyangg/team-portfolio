import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Smooth first-paint loader. Stays for ~700ms then fades, so the user sees a
// considered moment of brand instead of a flash of unstyled content.
function PageLoader() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const delay = reduced ? 0 : 700
    const t = setTimeout(() => setDone(true), delay)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--aurora-base)]"
        >
          {/* Soft mint wash */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 50%, rgba(110,231,183,0.30), transparent 70%)',
            }}
          />

          {/* H2 mark + spinning ring */}
          <div className="relative flex flex-col items-center gap-5">
            <div className="relative h-16 w-16">
              {/* Outer ring */}
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/15"
              />
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[var(--primary)]"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
              />
              {/* Center H2 */}
              <div className="absolute inset-0 grid place-items-center font-display text-[20px] font-extrabold tracking-[-0.04em] text-[var(--primary)]">
                H<span className="text-[0.55em] align-baseline">2</span>
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--muted-foreground)]"
            >
              NGHTT · Loading
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PageLoader
