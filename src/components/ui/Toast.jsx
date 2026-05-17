function Toast({ toasts }) {
  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(22rem,90vw)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-[toast-in_220ms_ease-out] rounded-lg border border-white/15 bg-[var(--navy)] px-4 py-3 text-sm font-medium text-[var(--white)]"
          role="alert"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}

export default Toast
