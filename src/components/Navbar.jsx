import { useEffect, useState } from 'react'
import { BadgeCheck, MoonStar, Sun } from 'lucide-react'

const THEME_STORAGE_KEY = 'nghtt-theme'

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function NepalFlagMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-10 w-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" aria-label="Nepal flag">
      <path d="M14 5V59" stroke="#FFFFFF" strokeWidth="2.5" />
      <path
        d="M16 7L16 57L50 39L31 31L50 20L16 7Z"
        fill="#DC143C"
        stroke="#003893"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="31" cy="22" r="4" fill="#FFFFFF" />
      <circle cx="31" cy="41" r="4.8" fill="#FFFFFF" />
    </svg>
  )
}

function Navbar() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const isDarkMode = theme === 'dark'
  const headerClass = isDarkMode
    ? 'border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--white)] backdrop-blur-xl'
    : 'border-b border-white/20 bg-[var(--navy)] text-[var(--white)]'
  const controlChromeClass = isDarkMode
    ? 'border-[var(--glass-border)] bg-[var(--input)]/95 text-[var(--foreground)]'
    : 'border-white/35 bg-[var(--navy2)]/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
  const badgeTextClass = isDarkMode ? 'text-[var(--foreground)]' : 'text-white/90'
  const toggleThumbClass = isDarkMode ? 'translate-x-10 bg-[var(--accent)]' : 'translate-x-0 bg-[var(--white)]'

  return (
    <header className={headerClass}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex min-w-0 items-start gap-3.5">
          <div className="mt-0.5 flex h-12 w-10 items-center justify-center">
            <NepalFlagMark />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-xl leading-tight text-[var(--white)] md:text-2xl">
              NGHTT Team Portfolio
            </h1>
            <div className="mt-1 space-y-0.5">
              <p className="text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] text-white/85">Submitted to</p>
              <p className="text-[13px] font-semibold leading-4 text-white md:text-[14px]">नेपाल सरकार · ऊर्जा, जलस्रोत तथा सिंचाइ मन्त्रालय</p>
              <p className="text-[12px] font-medium leading-4 text-white/90">सिंहदरबार, काठमाडौं, नेपाल ।</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`glass-hover relative inline-flex h-11 w-[82px] items-center rounded-full border p-1 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${controlChromeClass}`}
          >
            <span
              className={`pointer-events-none absolute left-1 top-1 h-9 w-9 rounded-full shadow-sm transition-transform duration-150 ease-out ${toggleThumbClass}`}
              aria-hidden="true"
            />
            <span className="relative z-10 flex w-full items-center justify-between px-1">
              <Sun className={`h-4 w-4 ${isDarkMode ? 'text-[var(--muted)]' : 'text-[var(--navy)]'}`} aria-hidden="true" />
              <MoonStar className={`h-4 w-4 ${isDarkMode ? 'text-[var(--white)]' : 'text-white/90'}`} aria-hidden="true" />
            </span>
          </button>
          <span className={`hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.1em] md:inline-flex ${badgeTextClass}`}>
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            NGHTT 2082-83
          </span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
