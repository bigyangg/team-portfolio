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
    <svg viewBox="0 0 64 64" className="h-10 w-10 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]" aria-label="Nepal flag">
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

  return (
    <header className="relative">
      {/* Dark navy band */}
      <div className="bg-[var(--navy2)] text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8 md:py-5">
          {/* Left — flag + identity */}
          <div className="flex min-w-0 items-start gap-4">
            <div className="mt-0.5 flex h-12 w-10 shrink-0 items-center justify-center">
              <NepalFlagMark />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-[20px] leading-tight text-white md:text-[24px]">
                NGHTT Team Portfolio
              </h1>
              <div className="mt-1.5 space-y-0.5">
                <p className="font-mono text-[10px] uppercase leading-4 tracking-[0.18em] text-white/65">
                  Submitted to
                </p>
                <p className="text-[12.5px] font-semibold leading-[1.35] text-white md:text-[13px]">
                  नेपाल सरकार · ऊर्जा, जलस्रोत तथा सिंचाइ मन्त्रालय
                </p>
                <p className="text-[11.5px] font-medium leading-[1.35] text-white/80">
                  सिंहदरबार, काठमाडौं, नेपाल
                </p>
              </div>
            </div>
          </div>

          {/* Right — theme toggle + edit lock */}
          <div className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end md:w-auto md:gap-3">
            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="group relative inline-flex h-10 w-[72px] shrink-0 items-center rounded-full border border-white/20 bg-white/8 p-1 backdrop-blur-sm transition-colors duration-200 hover:border-white/35 hover:bg-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy2)] focus-visible:ring-white/60"
            >
              <span
                className={`pointer-events-none absolute left-1 top-1 h-8 w-8 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
                  isDarkMode ? 'translate-x-8 bg-[var(--accent)]' : 'translate-x-0 bg-white'
                }`}
                aria-hidden="true"
              />
              <span className="relative z-10 flex w-full items-center justify-between px-1.5">
                <Sun
                  className={`h-3.5 w-3.5 transition-opacity duration-200 ${
                    isDarkMode ? 'text-white/40' : 'text-[var(--navy)]'
                  }`}
                  aria-hidden="true"
                />
                <MoonStar
                  className={`h-3.5 w-3.5 transition-opacity duration-200 ${
                    isDarkMode ? 'text-white' : 'text-white/70'
                  }`}
                  aria-hidden="true"
                />
              </span>
            </button>

            <span className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-white/85 md:inline-flex">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              NGHTT 2082-83
            </span>

            <button
              type="button"
              onClick={requestManageLockToggle}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-md px-3.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--navy2)] focus-visible:ring-white/60 ${
                isManageLocked
                  ? 'border border-white/18 bg-white/6 text-white/85 hover:bg-white/12'
                  : 'border border-[var(--primary)]/60 bg-[var(--primary)]/25 text-white hover:bg-[var(--primary)]/35'
              }`}
            >
              {isManageLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              {isManageLocked ? 'Manage off' : 'Manage on'}
            </button>
          </div>
        </div>
      </div>

      {/* Two-tone Nepal accent stroke under the navy band */}
      <div className="brand-stroke" aria-hidden="true" />
    </header>
  )
}

export default Navbar
