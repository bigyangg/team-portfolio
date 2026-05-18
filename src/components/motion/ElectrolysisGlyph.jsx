import { motion } from 'framer-motion'

// Electrolysis cell glyph: two electrodes with bubbles rising.
// Animates continuously; use as a decorative chip in cards about
// electrolysis, fertilizer (green ammonia), or energy storage.
function ElectrolysisGlyph({ size = 48, className = '' }) {
  const bubbles = [
    { cx: 14, delay: 0 },
    { cx: 14, delay: 0.4 },
    { cx: 14, delay: 0.8 },
    { cx: 34, delay: 0.2 },
    { cx: 34, delay: 0.6 },
    { cx: 34, delay: 1.0 },
  ]

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      {/* Cell walls */}
      <rect
        x="6"
        y="14"
        width="36"
        height="28"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.2"
      />
      {/* Water line */}
      <line
        x1="6"
        y1="20"
        x2="42"
        y2="20"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      {/* Electrodes */}
      <rect x="12" y="8" width="4" height="34" rx="1" fill="currentColor" fillOpacity="0.65" />
      <rect x="32" y="8" width="4" height="34" rx="1" fill="currentColor" fillOpacity="0.65" />
      {/* +/- labels */}
      <text x="14" y="7" textAnchor="middle" fontSize="6" fontWeight="800" fill="currentColor" fillOpacity="0.8">+</text>
      <text x="34" y="7" textAnchor="middle" fontSize="6" fontWeight="800" fill="currentColor" fillOpacity="0.8">−</text>
      {/* Rising bubbles */}
      {bubbles.map((b, i) => (
        <motion.circle
          key={i}
          cx={b.cx}
          r="1.4"
          fill="currentColor"
          fillOpacity="0.7"
          initial={{ cy: 38, opacity: 0 }}
          animate={{ cy: [38, 22], opacity: [0, 1, 0] }}
          transition={{
            duration: 1.6,
            delay: b.delay,
            ease: 'easeOut',
            repeat: Infinity,
            repeatDelay: 0.4,
          }}
        />
      ))}
    </svg>
  )
}

export default ElectrolysisGlyph
