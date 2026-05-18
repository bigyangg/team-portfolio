import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BadgeCheck, Lock, Menu, MoonStar, Sun, Unlock, X } from 'lucide-react'
import {
  MANAGE_LOCK_STATE_CHANGED_EVENT,
  requestManageLockState,
  requestManageLockToggle,
} from '../lib/manageLockEvents'

const THEME_STORAGE_KEY = 'nghtt-theme'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/applications', label: 'Applications' },
  { to: '/team', label: 'Team' },
  { to: '/submission', label: 'Submission' },
]

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light'
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function NepalFlagMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-9 w-9 drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]" aria-label="Nepal flag">
      <path d="M14 5V59" stroke="#FFFFFF" strokeWidth="2.5" />
      <path d="M16 7L16 57L50 39L31 31L50 20L16 7Z" fill="#DC143C" stroke="#003893" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="31" cy="22" r="4" fill="#FFFFFF" />
      <circle cx="31" cy="41" r="4.8" fill="#FFFFFF" />
    </svg>
  )
}

function Navbar() {
  const [theme, setTheme] = useState(getInitialTheme)
  const [isManageLocked, setIsManageLocked] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    const handleManageLockChange = (event) => setIsManageLocked(Boolean(event?.detail?.locked))
    window.addEventListener(MANAGE_LOCK_STATE_CHANGED_EVENT, handleManageLockChange)
    requestManageLockState()
    return () => window.removeEventListener(MANAGE_LOCK_STATE_CHANGED_EVENT, handleManageLockChange)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isDarkMode = theme === 'dark'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b border-[var(--surface-rule)] bg-[var(--aurora-base)]/95 backdrop-blur-2xl ${
        scrolled ? 'shadow-[0_4px_24px_-8px_rgba(5,46,44,0.18)]' : ''
      }`}
    >
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-3 md:px-10 md:py-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <NepalFlagMark />
          <div className="hidden flex-col sm:flex">
            <span className="font-display text-[15px] font-extrabold leading-tight tracking-[-0.012em] text-[#052E2C]">
              NGHTT
            </span>
            <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] text-[#0D9488]">
              Green Hydrogen Think Tank
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-[13px] font-bold transition-colors duration-200 ${
                  isActive
                    ? 'text-[var(--primary)]'
                    : 'text-[#052E2C] hover:text-[var(--primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[var(--primary-soft)] border border-[var(--primary)]/30"
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text)] backdrop-blur-md transition-colors hover:border-[var(--primary)]/60 hover:text-[var(--primary)]"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>

          {/* Submitted badge — desktop only */}
          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--primary)]/30 bg-[var(--primary-soft)] px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--primary)] backdrop-blur-md md:inline-flex">
            <BadgeCheck className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />
            2082-83
          </span>

          {/* Manage toggle — desktop only */}
          <button
            type="button"
            onClick={requestManageLockToggle}
            className="hidden h-10 items-center gap-1.5 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--text)] backdrop-blur-md transition-colors hover:border-[var(--primary)]/60 hover:text-[var(--primary)] md:inline-flex"
          >
            {isManageLocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            {isManageLocked ? 'Manage off' : 'Manage on'}
          </button>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text)] backdrop-blur-md lg:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="border-t border-[var(--glass-border)] bg-[var(--glass-bg-strong)] backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto flex w-full max-w-[1240px] flex-col gap-1 px-4 py-4 md:px-10">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 font-display text-[18px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                      : 'text-[var(--text)] hover:bg-[var(--glass-bg)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
