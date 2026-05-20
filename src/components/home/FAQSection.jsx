import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { riseItem, staggerContainer, ease } from '../../lib/motion'

const FAQS = [
  {
    q: "What if NGHTT doesn't deliver?",
    a: "Loss is bounded. Only tranches tied to verified milestones are released. Nepal retains the trained team, HPC node, and electrolyzer data regardless of outcome.",
  },
  {
    q: 'Why a public trust instead of a government department?',
    a: "Public trust under Nepal law, protected from political cycles. IP stays in Nepal forever. NGHTT does not depend on any single government, minister, or party.",
  },
  {
    q: 'Why does the Ministry need to act now?',
    a: "The patent window closes within ~10 years. India, Bangladesh, Sri Lanka, none have domestic H2 engine IP. The nation that files first controls licensing revenue from the region for decades.",
  },
  {
    q: 'What does the Ministry actually do?',
    a: "Issue one designation order. Costs NPR 0. Triggers university cooperation, donor confidence, and private investment in lockstep. Trust legally constituted within 30 days.",
  },
  {
    q: 'How is the money controlled?',
    a: "Dual signatures on every expense above NPR 1 lakh. Competitive tendering above NPR 5 lakh. Ministry-appointed independent auditor, not NGHTT's. Tranches release only on verified milestones.",
  },
  {
    q: "What if there's a cabinet reshuffle?",
    a: "Public-trust structure with perpetual succession. Tranche-tied funding survives elections. Institutional knowledge and IP stay in Nepal regardless of what changes in Singha Durbar.",
  },
]

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <motion.div
      variants={riseItem}
      className="border-b border-[var(--surface-rule-soft)] last:border-0"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display text-[15px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--text)] md:text-[16.5px]">
          {item.q}
        </span>
        <span className="mt-0.5 shrink-0 text-[var(--primary)]">
          {isOpen ? (
            <Minus className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Plus className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
              transition: { duration: 0.32, ease: ease.out },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.22, ease: ease.out },
            }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[13.5px] leading-[1.7] text-[var(--text)]/70 md:text-[14.5px]">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i)

  return (
    <motion.section
      className="surface-mint relative w-full border-b border-[var(--surface-rule-soft)]"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={staggerContainer}
    >
      <div className="mx-auto w-full max-w-[1240px] px-5 py-20 md:px-10 md:py-28">
        <motion.div variants={riseItem} className="mb-10 md:mb-14">
          <p className="eyebrow">QUESTIONS THE MINISTRY ASKS</p>
          <h2 className="font-display mt-2 max-w-2xl text-[28px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--text)] md:text-[40px]">
            Anticipated, not avoided.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="mx-auto max-w-3xl rounded-[18px] border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 backdrop-blur-2xl md:px-8"
        >
          {FAQS.map((item, i) => (
            <FAQItem
              key={item.q}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
