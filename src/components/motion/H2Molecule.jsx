import { motion } from 'framer-motion'

// Animated H2 molecule glyph. Two hydrogen atoms with electron orbit.
// Rotates slowly by default, picks up speed on hover (via group-hover scale).
function H2Molecule({ size = 56, className = '' }) {
  return (
    <motion.svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={className}
      animate={{ rotate: 360 }}
      transition={{ duration: 22, ease: 'linear', repeat: Infinity }}
      aria-hidden="true"
    >
      {/* Orbit ring */}
      <ellipse
        cx="40"
        cy="40"
        rx="34"
        ry="14"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      {/* Bond line */}
      <line
        x1="22"
        y1="40"
        x2="58"
        y2="40"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Two hydrogen nuclei */}
      <circle cx="22" cy="40" r="8" fill="currentColor" fillOpacity="0.92" />
      <circle cx="58" cy="40" r="8" fill="currentColor" fillOpacity="0.92" />
      {/* Highlights */}
      <circle cx="20" cy="38" r="2.5" fill="white" fillOpacity="0.55" />
      <circle cx="56" cy="38" r="2.5" fill="white" fillOpacity="0.55" />
      {/* Electron */}
      <motion.circle
        r="2.4"
        fill="currentColor"
        animate={{
          cx: [40 + 34, 40, 40 - 34, 40, 40 + 34],
          cy: [40, 40 - 14, 40, 40 + 14, 40],
        }}
        transition={{ duration: 3.6, ease: 'linear', repeat: Infinity }}
      />
    </motion.svg>
  )
}

export default H2Molecule
