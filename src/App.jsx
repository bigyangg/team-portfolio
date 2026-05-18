import { BrowserRouter, Routes, Route, ScrollRestoration } from 'react-router-dom'
import Navbar from './components/Navbar'
import FooterSection from './components/FooterSection'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ApplicationsPage from './pages/ApplicationsPage'
import TeamPage from './pages/TeamPage'
import SubmissionPage from './pages/SubmissionPage'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function AppShell() {
  return (
    <div className="min-h-screen overflow-x-clip bg-brand-bg text-[var(--text)]">
      <Navbar />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/submission" element={<SubmissionPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
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
