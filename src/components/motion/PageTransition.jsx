import { motion } from 'framer-motion'
import { pageVariants } from '../../lib/motion'

// Wraps a route's content so AnimatePresence can fade between routes.
function PageTransition({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{ minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  )
}

export default PageTransition
