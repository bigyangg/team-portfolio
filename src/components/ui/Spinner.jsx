function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[var(--muted)]" role="status" aria-live="polite">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--gold)] border-t-transparent" />
      {label}
    </div>
  )
}

export default Spinner
