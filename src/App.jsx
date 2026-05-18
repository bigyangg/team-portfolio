import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import FooterSection from './components/FooterSection'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ApplicationsPage from './pages/ApplicationsPage'
import TeamPage from './pages/TeamPage'
import SubmissionPage from './pages/SubmissionPage'
import PageTransition from './components/motion/PageTransition'
import { useEffect } from 'react'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/applications" element={<PageTransition><ApplicationsPage /></PageTransition>} />
        <Route path="/team" element={<PageTransition><TeamPage /></PageTransition>} />
        <Route path="/submission" element={<PageTransition><SubmissionPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><HomePage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function AppShell() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-bg text-[var(--text)]">
      <Navbar />
      <ScrollToTop />
      <AnimatedRoutes />
      <FooterSection />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App
