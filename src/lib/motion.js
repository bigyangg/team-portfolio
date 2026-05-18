// Shared motion primitives. Curves + durations + variants used across the site.
// All curves are ease-out (Emil rule for entrances and UI feedback).

export const ease = {
  out: [0.25, 1, 0.5, 1],          // quart  — most entrances
  outQuint: [0.22, 1, 0.36, 1],    // quint  — larger movements
  outExpo: [0.16, 1, 0.3, 1],      // expo   — long parallax
}

export const duration = {
  fast: 0.15,
  base: 0.24,
  slow: 0.40,
  page: 0.30,
}

// Stagger reveal — used for grids / lists
export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

// Single item rising in
export const riseItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.out },
  },
}

// Hero word/element entrance (slightly longer, more staggered)
export const heroStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
}

export const heroItem = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: ease.outQuint },
  },
}

// Route transition: fade + small slide. Exit before enter.
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.page, ease: ease.out },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.18, ease: ease.out },
  },
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
