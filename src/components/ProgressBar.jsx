function ProgressBar({ step, total = 7 }) {
  const progress = Math.round((step / total) * 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
        <span>Progress</span>
        <span>
          Step {step} of {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--gray)]">
        <div
          className="h-full rounded-full bg-[var(--gold)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
