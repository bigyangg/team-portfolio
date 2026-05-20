// Loading skeleton primitive. Subtle shimmer using a moving gradient.
// Respects prefers-reduced-motion (falls back to static tint).

function Skeleton({ className = '', rounded = '12px', style = {} }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`skeleton ${className}`}
      style={{ borderRadius: rounded, ...style }}
    />
  )
}

export default Skeleton
