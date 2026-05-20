import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { riseItem, staggerContainer } from '../../lib/motion'
import MagneticButton from '../motion/MagneticButton'

export default function ContactCTA() {
  return (
    <motion.section
      className="surface-forest grain relative w-full overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      <div aria-hidden="true" className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#6EE7B7]/40 to-transparent" />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 py-20 md:px-10 md:py-28">
        <motion.div variants={riseItem} className="mb-10 max-w-3xl md:mb-12">
          <p className="eyebrow">RESPOND TO THIS PETITION</p>
          <h2 className="font-display mt-3 text-[36px] font-bold leading-[1.05] tracking-[-0.025em] text-[#E6F4EF] md:text-[56px]">
            Ready to issue the{' '}
            <span className="glow-text">designation order.</span>
          </h2>
          <p className="mt-5 max-w-xl text-[14px] leading-[1.7] text-[#E6F4EF]/65 md:text-[15.5px]">
            Read the full proposal, request the formal brief, or schedule a Ministry briefing.
          </p>
        </motion.div>

        <motion.div variants={riseItem} className="flex flex-wrap gap-3">
          <MagneticButton as={Link} to="/submission" className="btn btn-primary">
            Read full proposal <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </MagneticButton>
          <MagneticButton as={Link} to="/team" className="btn btn-ghost">
            Meet the team
          </MagneticButton>
          <MagneticButton
            as="a"
            href="mailto:info@nghtt.org?subject=Ministry Briefing Request"
            className="btn btn-ghost"
          >
            Request briefing
          </MagneticButton>
        </motion.div>
      </div>
    </motion.section>
  )
}
