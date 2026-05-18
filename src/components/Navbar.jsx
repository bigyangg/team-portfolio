import { useEffect, useState } from 'react'
import { BadgeCheck, Lock, MoonStar, Sun, Unlock } from 'lucide-react'
import {
  MANAGE_LOCK_STATE_CHANGED_EVENT,
  requestManageLockState,
  requestManageLockToggle,
} from '../lib/manageLockEvents'

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
  const [isManageLocked, setIsManageLocked] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const handleManageLockChange = (event) => {
      setIsManageLocked(Boolean(event?.detail?.locked))
    }

    window.addEventListener(MANAGE_LOCK_STATE_CHANGED_EVENT, handleManageLockChange)
    requestManageLockState()

    return () => {
      window.removeEventListener(MANAGE_LOCK_STATE_CHANGED_EVENT, handleManageLockChange)
    }
  }, [])

  const isDarkMode = theme === 'dark'
  const headerClass = isDarkMode
    ? 'border-b border-[var(--glass-border)] bg-[var(--glass-bg-strong)] text-[var(--white)] backdrop-blur-xl'
    : 'border-b border-white/20 bg-[var(--navy)] text-[var(--white)]'
  const controlChromeClass = isDarkMode
    ? 'border-[var(--glass-border)] bg-[var(--input)]/95 text-[var(--foreground)]'
    : 'border-white/35 bg-[var(--navy2)]/80 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
  const chipClass = isDarkMode
    ? 'border-[var(--glass-border)] bg-[var(--input)]/80'
    : 'border-white/24 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
  const flagWrapClass = isDarkMode
    ? 'border-[var(--glass-border)] bg-[var(--input)]/80'
    : 'border-white/24 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
  const badgeTextClass = isDarkMode ? 'text-[var(--foreground)]' : 'text-white/90'
  const toggleThumbClass = isDarkMode ? 'translate-x-10 bg-[var(--accent)]' : 'translate-x-0 bg-[var(--white)]'

  return (
    <header className={headerClass}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-3 py-2.5 sm:px-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-3">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3.5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${flagWrapClass}`}>
            <NepalFlagMark />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-2xl leading-tight text-[var(--white)] sm:text-3xl md:text-[34px] md:leading-[1.1]">
              NGHTT Team Portfolio
            </h1>
            <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/80">
              National Green Hydrogen Think Tank
            </p>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-1.5 md:w-auto md:justify-end">
          <button
            type="button"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`glass-hover relative inline-flex h-10 w-[76px] items-center rounded-full border p-1 backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] ${controlChromeClass}`}
          >
            <span
              className={`pointer-events-none absolute left-1 top-1 h-8 w-8 rounded-full shadow-sm transition-transform duration-150 ease-out ${toggleThumbClass}`}
              aria-hidden="true"
            />
            <span className="relative z-10 flex w-full items-center justify-between px-1">
              <Sun className={`h-4 w-4 ${isDarkMode ? 'text-[var(--muted)]' : 'text-[var(--navy)]'}`} aria-hidden="true" />
              <MoonStar className={`h-4 w-4 ${isDarkMode ? 'text-[var(--white)]' : 'text-white/90'}`} aria-hidden="true" />
            </span>
          </button>
          <span
            className={`inline-flex min-h-10 items-center gap-1 rounded-md border px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${badgeTextClass} ${chipClass}`}
          >
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sm:hidden">2082-83</span>
            <span className="hidden sm:inline">NGHTT 2082-83</span>
          </span>
          <button
            type="button"
            onClick={requestManageLockToggle}
            className={`inline-flex min-h-10 w-auto max-w-full items-center justify-center gap-1.5 rounded-md border px-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] shadow-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] sm:px-3 sm:text-xs ${
              isManageLocked
                ? 'border-white/22 bg-white/8 text-white/90 hover:bg-white/12'
                : 'border-white/28 bg-white/16 text-white hover:bg-white/20'
            }`}
          >
            {isManageLocked ? <Unlock className="h-3.5 w-3.5" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
            {isManageLocked ? 'Manage/Edit Off' : 'Manage/Edit On'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
