import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { riseItem, staggerContainer } from '../lib/motion'
import MagneticButton from '../components/motion/MagneticButton'

function NotFoundPage() {
  return (
    <section className="flex min-h-[80vh] w-full items-center justify-center px-5">
      <motion.div
        className="flex flex-col items-center text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.p
          variants={riseItem}
          className="eyebrow mb-4"
        >
          Page Not Found
        </motion.p>

        <motion.span
          variants={riseItem}
          className="font-display block select-none text-[120px] font-extrabold leading-none tracking-[-0.04em] text-[var(--primary)] opacity-20 sm:text-[160px]"
          aria-hidden="true"
        >
          404
        </motion.span>

        <motion.p
          variants={riseItem}
          className="mt-6 max-w-sm text-[15px] leading-[1.65] text-[var(--text)]/70"
        >
          We couldn&apos;t find that page. The petition lives at the home page.
        </motion.p>

        <motion.div
          variants={riseItem}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <MagneticButton as={Link} to="/" className="btn btn-primary">
            Back to home
          </MagneticButton>
          <MagneticButton as={Link} to="/submission" className="btn btn-ghost">
            Read the brief
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default NotFoundPage
