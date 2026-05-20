import { useState } from 'react'
import { motion } from 'framer-motion'

// Image that shows a shimmering skeleton until the bitmap decodes.
// Once loaded it fades + scales in over 320ms.
// Drop-in replacement for <img>; passes className/style to the img itself.
//
// Usage:
//   <ImageWithSkeleton src="/hero/himalaya-haze.png" alt="" className="..." />
function ImageWithSkeleton({ src, alt = '', className = '', wrapperClassName = '', ...rest }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={`relative ${wrapperClassName}`}>
      {!loaded && (
        <div
          className="skeleton absolute inset-0"
          aria-hidden="true"
          style={{ borderRadius: 'inherit' }}
        />
      )}
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className={className}
        {...rest}
      />
    </div>
  )
}

export default ImageWithSkeleton
